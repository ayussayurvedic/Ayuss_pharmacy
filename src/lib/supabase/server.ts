import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '../env';

export async function createClient() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  const finalUrl = !url || isBuildPhase || url.includes('placeholder') ? 'https://placeholder-project.supabase.co' : url;
  const finalKey = !key || isBuildPhase || key.includes('placeholder') ? 'placeholder-anon-key' : key;

  const cookieStore = await cookies();

  return createServerClient(
    finalUrl,
    finalKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
