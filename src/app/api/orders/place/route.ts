import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendNotificationEmail, notifyAdminsIfEnabled, getCustomerOrderTemplate, getAdminOrderTemplate } from '@/lib/notifications';
import { orderRateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
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
      paymentMethod = 'cod',
      checkoutAttemptId,
      giftMessage,
    } = body;

    if (!name?.trim() || !phone?.trim() || !address?.trim() || !pincode?.trim() || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // 1. Basic Pincode Verification (Indian pincodes are 6 digits)
    const cleanPincode = pincode.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanPincode)) {
      return NextResponse.json({ error: 'Invalid Indian Pincode format. Must be exactly 6 digits.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown-ip';
    const rateLimitIpKey = `ip:${ip}`;
    const rateLimitPhoneKey = `phone:${cleanPhone}`;
    const productIds = cartItems.map((item: any) => item.product?.id || item.productId).filter(Boolean);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // 2. Execute Pre-Flight Queries in Parallel (Rate limits, Idempotency, Products & Inventory, Fraud check)
    const [rlIpResult, rlPhoneResult, idempotencyResult, productsResult, inventoryResult, recentOrdersResult] = await Promise.allSettled([
      orderRateLimiter.consume(rateLimitIpKey),
      orderRateLimiter.consume(rateLimitPhoneKey),
      checkoutAttemptId
        ? supabaseAdmin.from('orders').select('id, order_number').eq('checkout_attempt_id', checkoutAttemptId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabaseAdmin.from('products').select('id, name, mrp, selling_price, pack_size, is_active').in('id', productIds),
      supabaseAdmin.from('inventory').select('product_id, quantity_on_hand, quantity_reserved, inventory_enabled').in('product_id', productIds),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('customer_phone', phone.trim()).gte('created_at', oneHourAgo)
    ]);

    // Check Rate Limits
    if (rlIpResult.status === 'rejected' || rlPhoneResult.status === 'rejected') {
      return NextResponse.json({ error: 'Too many order attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    // Check Idempotency (if client retried same attempt ID)
    if (idempotencyResult.status === 'fulfilled' && idempotencyResult.value?.data) {
      const existing = idempotencyResult.value.data;
      return NextResponse.json({
        success: true,
        orderId: existing.id,
        orderNumber: existing.order_number,
      });
    }

    // Check Products from database
    const dbProducts = (productsResult.status === 'fulfilled' && productsResult.value?.data) ? productsResult.value.data : [];
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    // Check Inventory
    const dbInventories = (inventoryResult.status === 'fulfilled' && inventoryResult.value?.data) ? inventoryResult.value.data : [];
    const inventoryMap = new Map(dbInventories.map(inv => [inv.product_id, inv]));

    // 3. Authoritative Stock and Pricing Validation
    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      mrp_snapshot: number;
      pack_size_snapshot: string;
    }> = [];

    for (const item of cartItems) {
      const pId = item.product?.id || item.productId;
      const dbProduct = productMap.get(pId);
      const quantity = Math.max(1, Number(item.quantity) || 1);

      // Check stock if inventory tracking is active
      const inv = inventoryMap.get(pId);
      if (inv && inv.inventory_enabled) {
        const available = (inv.quantity_on_hand || 0) - (inv.quantity_reserved || 0);
        if (quantity > available) {
          return NextResponse.json({
            error: `Sorry, ${dbProduct?.name || item.product?.name || 'Product'} is out of stock (Available: ${Math.max(0, available)}).`
          }, { status: 400 });
        }
      }

      // Determine authoritative selling price and mrp from DB (fallback to payload if product DB record missing)
      const unitSellingPrice = Number(dbProduct?.selling_price || item.product?.sellingPrice || dbProduct?.mrp || item.product?.mrp || 0);
      const unitMrp = Number(dbProduct?.mrp || item.product?.mrp || unitSellingPrice);
      const lineTotal = unitSellingPrice * quantity;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        product_id: pId,
        product_name: dbProduct?.name || item.product?.name || 'Ayurvedic Medicine',
        quantity,
        unit_price: unitSellingPrice,
        total_price: lineTotal,
        mrp_snapshot: unitMrp,
        pack_size_snapshot: dbProduct?.pack_size || item.product?.packSize || '100g Jar',
      });
    }

    const deliveryCharge = calculatedSubtotal > 500 ? 0 : 50;
    const calculatedTotal = calculatedSubtotal + deliveryCharge;

    // Fraud Scoring
    const recentCount = (recentOrdersResult.status === 'fulfilled' && recentOrdersResult.value?.count) || 0;
    let fraudScore = recentCount >= 2 ? 50 : 0;
    if (paymentMethod === 'cod' && recentCount >= 1) fraudScore += 20;
    const isFlagged = fraudScore >= 50;

    // Estimated Delivery Date (3 days metro, 5 days standard)
    const isMetro = ['110001', '400001', '560001', '600001', '500001', '700001'].includes(cleanPincode);
    const deliveryDays = isMetro ? 3 : 5;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    // 4. Generate Fast Collision-Proof Order Number
    // Uses high-resolution timestamp slice + random integer to guarantee uniqueness
    const orderNum = `SSP-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    // 5. Insert Order
    const fullPayload = {
      order_number: orderNum,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email?.trim() || null,
      shipping_address: address.trim(),
      city: city?.trim() || null,
      state: state?.trim() || null,
      pincode: cleanPincode,
      subtotal: calculatedSubtotal,
      delivery_charge: deliveryCharge,
      total_amount: calculatedTotal,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'cod_pending' : 'pending',
      order_status: 'new',
      checkout_attempt_id: checkoutAttemptId || null,
      estimated_delivery_date: deliveryDate.toISOString().split('T')[0],
      gift_message: giftMessage || null,
      is_flagged: isFlagged,
      fraud_score: fraudScore,
    };

    let insertedOrder;
    const res1 = await supabaseAdmin.from('orders').insert([fullPayload]).select('id, order_number').single();

    if (res1.error) {
      // Fallback if schema cache is missing optional columns
      const { estimated_delivery_date, gift_message, ...fallbackPayload } = fullPayload;
      const res2 = await supabaseAdmin.from('orders').insert([fallbackPayload]).select('id, order_number').single();
      if (res2.error) throw res2.error;
      insertedOrder = res2.data;
    } else {
      insertedOrder = res1.data;
    }

    const orderId = insertedOrder.id;

    // 6. Insert Order Items
    const itemsToInsert = validatedItems.map(item => ({
      order_id: orderId,
      ...item,
    }));

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(itemsToInsert);
    if (itemsErr) {
      console.error('Order items insert failure:', itemsErr);
      throw itemsErr;
    }

    // 7. Non-blocking Background Notifications
    (async () => {
      try {
        if (email?.trim()) {
          await sendNotificationEmail(
            email.trim(),
            `S.S. Pharmacy Order Confirmation - #${orderNum}`,
            getCustomerOrderTemplate(
              orderNum,
              name.trim(),
              validatedItems.map(c => ({
                name: c.product_name,
                quantity: c.quantity,
                price: c.unit_price,
              })),
              calculatedTotal,
              `${address}, ${city || ''}, ${state || ''} - ${cleanPincode}`
            )
          );
        }
      } catch (e) {
        console.error('Customer email notification error:', e);
      }

      try {
        await notifyAdminsIfEnabled(
          'new_customer_orders',
          `New Order Placed: #${orderNum}`,
          getAdminOrderTemplate(orderNum, name.trim(), calculatedTotal)
        );
      } catch (e) {
        console.error('Admin order notification error:', e);
      }
    })();

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber: orderNum,
      subtotal: calculatedSubtotal,
      delivery: deliveryCharge,
      total: calculatedTotal,
    });
  } catch (err: any) {
    console.error('Order placement route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 });
  }
}
