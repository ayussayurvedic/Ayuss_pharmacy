import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const rawOrderNumber = request.nextUrl.searchParams.get('orderNumber') || request.nextUrl.searchParams.get('id');
    if (!rawOrderNumber) {
      return apiError('Missing order number', 400);
    }

    // Normalize order number: decode URI, trim whitespace, and strip leading '#'
    const cleanOrderNumber = decodeURIComponent(rawOrderNumber).trim().replace(/^#+/, '');

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('order_number, customer_name, total_amount, payment_status, created_at')
      .eq('order_number', cleanOrderNumber)
      .maybeSingle();

    if (error || !order) {
      return apiError('Order not found', 404);
    }

    const customerName = order.customer_name || 'Customer';
    const maskedName = customerName.length > 2 
      ? customerName.replace(/(?<=.).(?=.)/g, '*')
      : customerName;

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      customerName: maskedName,
      totalAmount: Number(order.total_amount),
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
    });
  } catch (err: any) {
    console.error('Order query error:', err);
    return apiError('Server error', 500);
  }
}
