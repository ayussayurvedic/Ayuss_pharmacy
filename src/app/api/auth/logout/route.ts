import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  // Session invalidation handled by cookie deletion below

  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.json({ success: true });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };
  response.cookies.set('auth-token', '', cookieOptions);
  response.cookies.set('admin-auth-token', '', cookieOptions);
  response.cookies.set('employee-auth-token', '', cookieOptions);
  response.cookies.set('mfa-pending-token', '', cookieOptions); // LOW-11
  return response;
}

