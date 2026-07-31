import { supabaseAdmin } from './supabase-admin';

export async function dispatchOrderWebhook(event: string, orderData: any) {
  let responseStatus: number | null = null;
  let errorMessage: string | null = null;

  try {
    const { data: config } = await supabaseAdmin
      .from('portal_config')
      .select('config_value')
      .eq('config_key', 'webhook_url')
      .maybeSingle();

    const url = config?.config_value;
    if (!url) return;

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data: orderData
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SS-Pharmacy-Event': event
      },
      body: JSON.stringify(payload)
    });

    responseStatus = res.status;

    // Log successful webhook dispatch to audit table
    try {
      await supabaseAdmin.from('webhook_events').insert({
        event_name: event,
        order_id: orderData?.id || null,
        payload,
        response_status: responseStatus,
        delivered_at: new Date().toISOString(),
        error_message: null
      });
    } catch (logErr) {
      console.error('Webhook audit log insert failed:', logErr);
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook Dispatch Failed:', err);

    // Log failed webhook dispatch to audit table
    try {
      await supabaseAdmin.from('webhook_events').insert({
        event_name: event,
        order_id: orderData?.id || null,
        payload: { event, data: orderData },
        response_status: responseStatus,
        delivered_at: null,
        error_message: errorMessage
      });
    } catch (logErr) {
      console.error('Webhook audit log insert failed:', logErr);
    }
  }
}
