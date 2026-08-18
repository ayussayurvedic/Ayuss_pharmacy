import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiRateLimiter, consumeRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError } from '@/lib/api-response';

const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1)
    })
  }),
  deviceName: z.string().optional().nullable(),
  browserType: z.string().optional().nullable()
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown-ip';
    const rateResult = await consumeRateLimit(apiRateLimiter, ip);
    if (!rateResult.allowed) {
      const retryAfterSec = Math.ceil(rateResult.retryAfterMs / 1000);
      return apiError('Too many requests. Please try again later.', 429, 'RATE_LIMITED', { 'Retry-After': String(retryAfterSec) });
    }

    // 2. Authentication
    const session = await getSession();
    if (!session || !session.id) {
      return apiError('Unauthorized', 401);
    }

    // 3. Request Validation
    const body = await request.json();
    const validated = subscriptionSchema.parse(body);

    const upsertPayload: Record<string, any> = {
      endpoint: validated.subscription.endpoint,
      p256dh: validated.subscription.keys.p256dh,
      auth: validated.subscription.keys.auth,
      device_name: validated.deviceName || null,
      browser_type: validated.browserType || null,
      is_active: true,
      admin_id: session.id,
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(upsertPayload, { onConflict: 'endpoint' });

    if (upsertError) {
      console.error('Failed to register push subscription:', upsertError);
      throw upsertError;
    }

    return apiSuccess({ message: 'Push subscription registered successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(err.issues[0]?.message || 'Validation error', 400);
    }
    console.error('Push subscribe error:', err);
    return apiError('Internal server error', 500);
  }
}
