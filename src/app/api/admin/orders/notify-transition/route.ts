import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyActiveAdmin, getSession } from '@/lib/auth';
import { sendSMSNotification } from '@/lib/sms';
import { dispatchOrderWebhook } from '@/lib/webhooks';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin auth
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }
    await verifyActiveAdmin(session.id);

    const body = await request.json().catch(() => null);
    if (!body) return apiError('Invalid body', 400);

    const { orderId, newStatus } = body;
    if (!orderId || !newStatus) {
      return apiError('Missing transition parameters', 400);
    }

    // 2. Fetch order details
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return apiError('Order not found', 404);
    }

    // 3. Dispatch Webhook
    await dispatchOrderWebhook(`order.status.${newStatus}`, order);

    // 4. Send SMS alert
    const smsMessage = `Hi ${order.customer_name}, your S.S. Pharmacy order #${order.order_number} has been updated to: ${newStatus.toUpperCase().replace(/_/g, ' ')}. Thank you!`;
    await sendSMSNotification(order.customer_phone, smsMessage);

    return apiSuccess({ notified: true });
  } catch (err: any) {
    console.error('Transition notifier crashed:', err);
    return apiError(err.message || 'Transition notification failed', 500);
  }
}
