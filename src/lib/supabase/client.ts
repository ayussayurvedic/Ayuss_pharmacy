import { createBrowserClient } from '@supabase/ssr';
import { env } from '../env';

export function createClient() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  const finalUrl = !url || isBuildPhase || url.includes('placeholder') ? 'https://placeholder-project.supabase.co' : url;
  const finalKey = !key || isBuildPhase || key.includes('placeholder') ? 'placeholder-anon-key' : key;

  return createBrowserClient(finalUrl, finalKey);
}
