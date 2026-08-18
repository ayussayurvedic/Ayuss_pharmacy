import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiRateLimiter, consumeRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError } from '@/lib/api-response';

const unsubscribeSchema = z.object({
  endpoint: z.string().url()
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
    const validated = unsubscribeSchema.parse(body);

    const isUserAdmin = session.role === 'admin' || session.role === 'hr';

    // 4. Secure deletion ensuring user ownership (BOLA prevention)
    let deleteQuery = supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', validated.endpoint);

    if (isUserAdmin) {
      deleteQuery = deleteQuery.eq('admin_id', session.id);
    } else {
      deleteQuery = deleteQuery.eq('employee_id', session.id);
    }

    const { error: deleteError } = await deleteQuery.select();

    if (deleteError) {
      console.error('Failed to unregister push subscription:', deleteError);
      throw deleteError;
    }

    return apiSuccess({ message: 'Push subscription unregistered successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(err.issues[0]?.message || 'Validation error', 400);
    }
    console.error('Push unsubscribe error:', err);
    return apiError('Internal server error', 500);
  }
}
