import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyActiveAdmin, getSession } from '@/lib/auth';
import { sendSMSNotification } from '@/lib/sms';
import { dispatchOrderWebhook } from '@/lib/webhooks';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin auth
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await verifyActiveAdmin(session.id);

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

    const { orderId, newStatus } = body;
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing transition parameters' }, { status: 400 });
    }

    // 2. Fetch order details
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Dispatch Webhook
    await dispatchOrderWebhook(`order.status.${newStatus}`, order);

    // 4. Send SMS alert
    const smsMessage = `Hi ${order.customer_name}, your S.S. Pharmacy order #${order.order_number} has been updated to: ${newStatus.toUpperCase().replace(/_/g, ' ')}. Thank you!`;
    await sendSMSNotification(order.customer_phone, smsMessage);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Transition notifier crashed:', err);
    return NextResponse.json({ error: err.message || 'Transition notification failed' }, { status: 500 });
  }
}
