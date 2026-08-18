import { Resend } from 'resend';
import { supabaseAdmin } from './supabase-admin';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

/**
 * Sends a notification email using Resend.
 */
export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{ filename: string; content?: Buffer; path?: string }>
) {
  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    }
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'S.S. Pharmacy <ayuss.ayurvedic@gmail.com>',
      to,
      subject,
      html,
      attachments,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email Send Crash:', err);
    return { success: false, error: err };
  }
}

/**
 * Resolves the application base URL dynamically.
 */
function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://sspharmacy.in';
}



/**
 * Template for contact inquiry notification sent to admins.
 */
export function getAdminInquiryTemplate(name: string, email: string, phone: string | null, company: string | null, message: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0f172a;">New Contact Inquiry Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-style: italic;">${message}</p>
      <div style="margin: 30px 0;">
        <a href="${getAppUrl()}/admin/inquiries" 
           style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Inquiries
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Regards,<br>S.S. Pharmacy</p>
    </div>
  `;
}

/**
 * Dispatches an email notification to all registered admins if the corresponding preference key is enabled.
 */
export async function notifyAdminsIfEnabled(
  prefKey: string,
  subject: string,
  html: string
) {
  try {
    // Check if notifications are enabled for this key
    const { data: config } = await supabaseAdmin
      .from('portal_config')
      .select('config_value')
      .eq('config_key', prefKey)
      .maybeSingle();

    // Default to true if config key doesn't exist
    const isEnabled = config ? config.config_value !== 'false' : true;
    if (!isEnabled) return { success: true, reason: 'Disabled by configuration' };

    // Fetch admin emails
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('email');

    if (adminError || !admins || admins.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('No admin users found to notify.');
      }
      return { success: false, reason: 'No admin users found' };
    }

    // Send emails in parallel
    const results = await Promise.all(
      admins.map((admin) => sendNotificationEmail(admin.email, subject, html))
    );

    return { success: true, results };
  } catch (err) {
    console.error('Failed to notify admins:', err);
    return { success: false, error: err };
  }
}

/**
 * Template for order confirmation sent to customers.
 */
export function getCustomerOrderTemplate(
  orderNum: string,
  customerName: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  address: string
) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #1A5C5E;">Order Confirmed!</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for shopping with S.S. Pharmacy. Your order <strong>#${orderNum}</strong> has been received and is being processed.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #cbd5e1;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #cbd5e1;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 8px; font-weight: bold; text-align: right;">Total Amount:</td>
            <td style="padding: 8px; font-weight: bold; text-align: right; color: #1A5C5E;">₹${total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p><strong>Shipping Address:</strong><br>${address}</p>
      <p>You can track your order status on our portal using your order number.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${getAppUrl()}/order-tracking" 
           style="background-color: #1A5C5E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Track Order
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Regards,<br>S.S. Pharmacy Team</p>
    </div>
  `;
}

/**
 * Template for new order notifications sent to admin users.
 */
export function getAdminOrderTemplate(orderNum: string, customerName: string, total: number) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #0f172a;">New Customer Order Placed</h2>
      <p>Order Number: <strong>#${orderNum}</strong></p>
      <p>Customer Name: <strong>${customerName}</strong></p>
      <p>Order Total: <strong style="color: #1A5C5E;">₹${total.toFixed(2)}</strong></p>
      <div style="margin: 30px 0;">
        <a href="${getAppUrl()}/admin/orders" 
           style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Open Admin Panel
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">Regards,<br>S.S. Pharmacy Systems</p>
    </div>
  `;
}

