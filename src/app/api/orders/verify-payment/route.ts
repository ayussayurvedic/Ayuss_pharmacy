import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiSuccess, apiError } from '@/lib/api-response';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return apiError('Invalid request body', 400);
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return apiError('Missing verification fields', 400);
    }

    // Fetch order total to log transaction securely
    const { data: order, error: queryErr } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('id', orderId)
      .maybeSingle();

    if (queryErr || !order) {
      return apiError('Order reference not found', 400);
    }

    const isProd = process.env.NODE_ENV === 'production';
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (isProd) {
      if (!secret) {
        console.error('CRITICAL: RAZORPAY_KEY_SECRET is not configured in production.');
        return apiError('Payment gateway configuration error.', 500);
      }
      if (razorpayOrderId === 'sandbox_order' || String(razorpayPaymentId).startsWith('sandbox_')) {
        return apiError('Sandbox payments are not allowed in production.', 403);
      }
    } else if (!secret || razorpayOrderId === 'sandbox_order') {
      console.warn('⚠️ Warning: Running in development/test mode with sandbox payment verification.');
      
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

      return apiSuccess({ verified: true, sandbox: true });
    }

    // Verify Razorpay Payment Signature cryptographically (Constant-Time)
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    const genBuf = Buffer.from(generatedSignature, 'utf8');
    const sigBuf = Buffer.from(razorpaySignature, 'utf8');

    if (genBuf.length !== sigBuf.length || !crypto.timingSafeEqual(genBuf, sigBuf)) {
      return apiError('Invalid payment signature verification failed.', 400);
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

    return apiSuccess({ verified: true });
  } catch (err: any) {
    console.error('Payment verification crash:', err);
    return apiError(err.message || 'Payment verification failed', 500);
  }
}
