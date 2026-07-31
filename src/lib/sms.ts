import { supabaseAdmin } from './supabase-admin';

export async function sendSMSNotification(to: string, message: string) {
  try {
    const { data: sidConfig } = await supabaseAdmin.from('portal_config').select('config_value').eq('config_key', 'twilio_sid').maybeSingle();
    const { data: tokenConfig } = await supabaseAdmin.from('portal_config').select('config_value').eq('config_key', 'twilio_auth_token').maybeSingle();
    const { data: fromConfig } = await supabaseAdmin.from('portal_config').select('config_value').eq('config_key', 'twilio_from_number').maybeSingle();

    const sid = sidConfig?.config_value;
    const token = tokenConfig?.config_value;
    const from = fromConfig?.config_value;

    // Sanitize phone number for Twilio (E.164 format)
    const cleanTo = to.replace(/\D/g, '');
    const formattedTo = cleanTo.length === 10 ? `+91${cleanTo}` : (cleanTo.startsWith('91') && cleanTo.length === 12 ? `+${cleanTo}` : to);

    if (!sid || !token || !from) {
      console.log(`[SMS Mock] To: ${to}, Message: ${message}`);
      return { success: true, mocked: true };
    }

    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: from,
        Body: message
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    return { success: true };
  } catch (err) {
    console.error('SMS Send Failed:', err);
    return { success: false, error: err };
  }
}
