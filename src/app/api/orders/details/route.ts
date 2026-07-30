import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const orderNumber = request.nextUrl.searchParams.get('orderNumber');
    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing order number' }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('order_number, customer_name, total_amount, payment_status, created_at')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      customerName: order.customer_name.replace(/(?<=.).(?=.)/g, '*'), // Mask name details
      totalAmount: Number(order.total_amount),
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
    });
  } catch (err: any) {
    console.error('Order query error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
