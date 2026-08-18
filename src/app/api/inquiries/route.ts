import { NextRequest } from 'next/server';
import { z } from 'zod';
import { inquirySchema, isDisposableEmail } from '@/lib/validations';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiRateLimiter, consumeRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    // Rate limit public submissions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || (request as any).ip || 'unknown-ip';
    const rateResult = await consumeRateLimit(apiRateLimiter, ip);
    if (!rateResult.allowed) {
      const retryAfterSec = Math.ceil(rateResult.retryAfterMs / 1000);
      return apiError('Too many requests. Please try again later.', 429, 'RATE_LIMITED', { 'Retry-After': String(retryAfterSec) });
    }

    const body = await request.json();
    const validated = inquirySchema.parse(body);

    // Anti-Disposable Email Check (EVA API + Blocklist)
    if (await isDisposableEmail(validated.email)) {
      return apiError('Temporary / disposable email addresses are not permitted. Please use a valid email.', 400);
    }

    const { error } = await supabaseAdmin
      .from('inquiries')
      .insert([
        {
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          company: validated.company || null,
          message: validated.requirement,
          status: 'new'
        }
      ]);

    if (error) throw error;

    // Trigger notification to admin
    try {
      const { getAdminInquiryTemplate, notifyAdminsIfEnabled } = await import('@/lib/notifications');
      const html = getAdminInquiryTemplate(
        validated.name,
        validated.email,
        validated.phone || null,
        validated.company || null,
        validated.requirement
      );
      await notifyAdminsIfEnabled('notif_inquiry', `New Contact Inquiry - ${validated.name}`, html);

      const { dispatchNotification } = await import('@/lib/notifications/dispatch');
      await dispatchNotification({
        title: `📞 New Contact Inquiry - ${validated.name}`,
        message: `${validated.name} from ${validated.company || 'Private'} submitted a new inquiry.`,
        type: 'inquiry',
        clickActionUrl: '/admin/inquiries',
        senderName: validated.name
      });
    } catch (notifErr) {
      console.error('Failed to send contact inquiry notification:', notifErr);
    }

    return apiSuccess({ message: 'Inquiry received successfully' }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(err.issues[0]?.message || 'Validation error', 400);
    }
    console.error('Inquiry submission error:', err);
    return apiError('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { getSession } = await import('@/lib/auth');
    const session = await getSession();
    
    if (!session || session.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '100', 10) || 100, 1), 500);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);

    const { data, error, count } = await supabaseAdmin
      .from('inquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return apiSuccess({ data, total: count });
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    return apiError('Failed to fetch inquiries', 500);
  }
}
