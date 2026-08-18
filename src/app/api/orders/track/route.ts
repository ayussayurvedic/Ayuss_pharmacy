import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawOrderNumber = searchParams.get('order_number') || searchParams.get('orderNumber');
    const phone = searchParams.get('phone')?.trim();

    if (!rawOrderNumber || !phone) {
      return NextResponse.json(
        { error: 'Order number and phone number are required.' },
        { status: 400 }
      );
    }

    const cleanOrderNumber = decodeURIComponent(rawOrderNumber).trim().replace(/^#+/, '');

    // Query using admin client to bypass RLS since guest users need to query their order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        order_status,
        payment_status,
        payment_method,
        total_amount,
        shipping_address,
        city,
        state,
        pincode,
        customer_name,
        customer_phone,
        customer_email,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price,
          pack_size_snapshot
        )
      `)
      .eq('order_number', cleanOrderNumber)
      .maybeSingle();

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve order details.' },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    // Standardize phone strings for comparison (remove spaces, country codes, non-digits)
    const dbPhoneClean = (order.customer_phone || '').replace(/\D/g, '');
    const inputPhoneClean = phone.replace(/\D/g, '');

    // Match last 10 digits to allow flexible format inputs
    if (dbPhoneClean.slice(-10) !== inputPhoneClean.slice(-10)) {
      return NextResponse.json(
        { error: 'Order details do not match the phone number provided.' },
        { status: 403 }
      );
    }

    // Privacy Masking helpers
    const maskString = (str: string, keep = 1) => {
      if (!str) return '';
      const trimmed = str.trim();
      if (trimmed.length <= keep * 2) return trimmed;
      return trimmed.slice(0, keep) + '*'.repeat(trimmed.length - keep * 2) + trimmed.slice(-keep);
    };

    const maskName = (name: string) => {
      if (!name) return 'Customer';
      return name.split(/\s+/).map(part => maskString(part, 1)).join(' ');
    };

    const maskEmail = (email: string) => {
      if (!email) return '';
      const parts = email.split('@');
      if (parts.length !== 2) return maskString(email, 1);
      return maskString(parts[0], 1) + '@' + parts[1];
    };

    const maskedOrder = {
      order_number: order.order_number,
      order_status: order.order_status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      total_amount: order.total_amount,
      created_at: order.created_at,
      customer_name: maskName(order.customer_name),
      customer_email: order.customer_email ? maskEmail(order.customer_email) : null,
      shipping_address: order.shipping_address ? maskString(order.shipping_address, 3) : null,
      city: order.city,
      state: order.state,
      pincode: order.pincode ? maskString(order.pincode, 2) : null,
      order_items: order.order_items || []
    };

    return NextResponse.json({ order: maskedOrder }, { status: 200 });
  } catch (err) {
    console.error('Unhandled order tracking error:', err);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
