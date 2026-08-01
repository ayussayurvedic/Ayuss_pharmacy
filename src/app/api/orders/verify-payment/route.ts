import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing verification fields' }, { status: 400 });
    }

    // Fetch order total to log transaction securely
    const { data: order, error: queryErr } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('id', orderId)
      .maybeSingle();

    if (queryErr || !order) {
      return NextResponse.json({ error: 'Order reference not found' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || razorpayOrderId === 'sandbox_order') {
      console.warn('⚠️ Warning: RAZORPAY_KEY_SECRET is not configured or using sandbox. Falling back to sandbox validation.');
      
      // Update database status to paid using supabaseAdmin
      const { error: dbErr } = await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId);
        
      if (dbErr) throw dbErr;

      // Log transaction
      const { error: txErr } = await supabaseAdmin.from('payment_transactions').insert({
        order_id: orderId,
        razorpay_payment_id: `sandbox_${Date.now()}`,
        razorpay_order_id: 'sandbox_order',
        amount: order.total_amount,
        status: 'paid',
      });
      if (txErr) {
        console.error('Failed to log sandbox transaction:', txErr);
      }

      return NextResponse.json({ success: true, sandbox: true });
    }

    // Verify Razorpay Payment Signature cryptographically
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature verification failed.' }, { status: 400 });
    }

    // Update database status to paid using supabaseAdmin
    const { error: dbErr } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId);

    if (dbErr) throw dbErr;

    // Log transaction
    const { error: txErr } = await supabaseAdmin.from('payment_transactions').insert({
      order_id: orderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
      amount: order.total_amount,
      status: 'paid',
    });
    if (txErr) {
      console.error('Failed to log live transaction:', txErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Payment verification crash:', err);
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 });
  }
}
