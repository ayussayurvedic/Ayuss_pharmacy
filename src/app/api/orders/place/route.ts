import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendNotificationEmail, notifyAdminsIfEnabled, getCustomerOrderTemplate, getAdminOrderTemplate } from '@/lib/notifications';
import { loginRateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting based on IP to prevent abuse/fraud
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown-ip';
    const rateLimitKey = `order-ip:${ip}`;
    
    try {
      await loginRateLimiter.consume(rateLimitKey); // Max 5 requests per 15 minutes by default
    } catch (rlErr) {
      return NextResponse.json({ error: 'Too many order attempts from this network. Please try again in 15 minutes.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      email,
      name,
      phone,
      address,
      city,
      state,
      pincode,
      cartItems,
      paymentMethod,
      delivery,
      subtotal,
      total,
      checkoutAttemptId,
    } = body;

    if (!name || !phone || !address || !pincode || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // 2. Validate Stock and Reserve Inventory transactionally using a db check
    for (const item of cartItems) {
      const { data: inv, error: invErr } = await supabaseAdmin
        .from('inventory')
        .select('quantity_on_hand, quantity_reserved')
        .eq('product_id', item.product.id)
        .maybeSingle();

      if (invErr || !inv) {
        return NextResponse.json({ error: `Product ${item.product.name} has no inventory entry.` }, { status: 400 });
      }

      const available = inv.quantity_on_hand - inv.quantity_reserved;
      if (item.quantity > available) {
        return NextResponse.json({ error: `Sorry, ${item.product.name} is out of stock (Available: ${available}).` }, { status: 400 });
      }
    }

    // 2.1. Basic Pincode Verification (Indian pincodes are 6 digits)
    const cleanPincode = pincode.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanPincode)) {
      return NextResponse.json({ error: 'Invalid Indian Pincode format. Must be exactly 6 digits.' }, { status: 400 });
    }

    // 2.2. Fraud Check (Count orders from same phone within the last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('customer_phone', phone)
      .gte('created_at', oneHourAgo);

    let fraudScore = 0;
    if ((recentCount || 0) >= 2) {
      fraudScore += 50; // Flag high rate
    }
    // Additional signal: COD payment + same IP placing multiple orders
    if (paymentMethod === 'cod' && (recentCount || 0) >= 1) {
      const { count: ipCount } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo);
      if ((ipCount || 0) >= 2) {
        fraudScore += 30; // COD abuse from same network
      }
    }
    const isFlagged = fraudScore >= 50;

    // 2.3. Dynamic Estimated Delivery Date Calculation
    const isMetro = ['110001', '400001', '560001', '600001', '500001', '700001'].includes(cleanPincode);
    const deliveryDays = isMetro ? 3 : 5;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    // Check if checkout_attempt_id has already generated an order (idempotency)
    if (checkoutAttemptId) {
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id, order_number')
        .eq('checkout_attempt_id', checkoutAttemptId)
        .maybeSingle();

      if (existingOrder) {
        return NextResponse.json({
          success: true,
          orderId: existingOrder.id,
          orderNumber: existingOrder.order_number,
        });
      }
    }

    // 3. Generate unique order number with collision checking
    let orderNum = '';
    let isUnique = false;
    let retries = 0;
    
    while (!isUnique && retries < 5) {
      orderNum = `SSP-${Math.floor(100000 + Math.random() * 900000)}`;
      const { count } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('order_number', orderNum);

      if (count === 0) {
        isUnique = true;
      }
      retries++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique order number.');
    }

    // 4. Create order record using service role client to bypass client RLS rules
    const fullPayload: Record<string, any> = {
      order_number: orderNum,
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      shipping_address: address,
      city,
      state,
      pincode,
      subtotal,
      delivery_charge: delivery,
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'cod_pending' : 'pending',
      order_status: 'new',
      checkout_attempt_id: checkoutAttemptId || null,
      estimated_delivery_date: deliveryDate.toISOString().split('T')[0],
      gift_message: body.giftMessage || null,
      is_flagged: isFlagged,
      fraud_score: fraudScore
    };

    let insertedOrder;
    let insErr;

    const res1 = await supabaseAdmin
      .from('orders')
      .insert([fullPayload])
      .select()
      .single();

    insertedOrder = res1.data;
    insErr = res1.error;

    // Fallback if estimated_delivery_date or gift_message columns are missing in live DB schema
    if (insErr && (insErr.code === 'PGRST204' || insErr.message?.includes('estimated_delivery_date') || insErr.message?.includes('gift_message') || insErr.message?.includes('column'))) {
      console.warn('Orders schema cache missing optional columns. Executing fallback order insert without estimated_delivery_date/gift_message...');
      const { estimated_delivery_date, gift_message, ...fallbackPayload } = fullPayload;
      const res2 = await supabaseAdmin
        .from('orders')
        .insert([fallbackPayload])
        .select()
        .single();

      insertedOrder = res2.data;
      insErr = res2.error;
    }

    if (insErr) throw insErr;
    const orderId = insertedOrder.id;

    // 5. Insert order items
    const items = cartItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.sellingPrice || item.product.mrp || 0,
      total_price: (item.product.sellingPrice || item.product.mrp || 0) * item.quantity,
      mrp_snapshot: item.product.mrp || 0,
      pack_size_snapshot: item.product.packSize || '100g'
    }));

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(items);
    if (itemsErr) throw itemsErr;

    // 6. Send Email Notifications
    if (email) {
      await sendNotificationEmail(
        email,
        `S.S. Pharmacy Order Confirmation - #${orderNum}`,
        getCustomerOrderTemplate(orderNum, name, cartItems.map((c: any) => ({
          name: c.product.name,
          quantity: c.quantity,
          price: c.product.sellingPrice || c.product.mrp || 0
        })), total, `${address}, ${city}, ${state} - ${pincode}`)
      ).catch((e) => console.error('Customer email notification failed:', e));
    }

    await notifyAdminsIfEnabled(
      'new_customer_orders',
      `New Order Placed: #${orderNum}`,
      getAdminOrderTemplate(orderNum, name, total)
    ).catch((e) => console.error('Admin order notification failed:', e));

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber: orderNum,
    });
  } catch (err: any) {
    console.error('Order placement route crash:', err);
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 });
  }
}
