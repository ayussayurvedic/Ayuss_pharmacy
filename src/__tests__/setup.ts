import { config } from 'dotenv';
import path from 'path';

// Load test environment variables before any other imports
config({ path: path.resolve(process.cwd(), '.env.test') });

import { vi, afterEach, beforeAll } from 'vitest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Global Next.js Mocks
vi.mock('next/headers', () => {
  const store = new Map();
  return {
    headers: vi.fn(async () => {
      const headersMap = new Map();
      headersMap.set('x-forwarded-for', '127.0.0.1');
      headersMap.set('user-agent', 'Vitest Agent');
      headersMap.set('x-correlation-id', 'test-correlation-id');
      return headersMap;
    }),
    cookies: vi.fn(async () => {
      return {
        get: vi.fn((name: string) => {
          const val = store.get(name);
          return val ? { name, value: val } : undefined;
        }),
        set: vi.fn((name: string, value: string) => {
          store.set(name, value);
        }),
        delete: vi.fn((name: string) => {
          store.delete(name);
        }),
      };
    }),
    // Helper to inject mock cookies in tests
    __mockSetCookie: (name: string, value: string) => {
      store.set(name, value);
    },
    __mockClearCookies: () => {
      store.clear();
    },
  };
});

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: any) => fn),
}));

vi.mock('@/lib/cache/office-location', () => ({
  getCachedActiveOfficeLocation: vi.fn(async () => ({
    name: 'S.S. Pharmacy Office',
    lat: 17.44569123225756,
    lng: 78.38649648531063,
    radius_meters: 500,
  })),
}));

// Reset vi mocks after each test
afterEach(() => {
  vi.clearAllMocks();
  try {
    const { __mockClearCookies } = require('next/headers') as any;
    if (__mockClearCookies) __mockClearCookies();
  } catch {}
});

// Office locations DB mutating logic removed to protect user data from tests.
// The active office location cache helper is now mocked above in setup.ts.



export async function createTestAdmin() {
  const email = 'test_admin@sspharmacy.in';
  let userId: string;

  // Provision Admin in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'TestPass123!',
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already') || authError.message.includes('registered')) {
      const { data: existingAdmin } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (!existingAdmin) throw new Error(`User claimed to exist but not found in public.admin_users: ${email}`);
      userId = existingAdmin.id;
    } else {
      throw new Error(`Failed to create test admin auth user: ${authError.message}`);
    }
  } else {
    userId = authData.user.id;
  }

  // Ensure public.admin_users record exists
  const { data: existing } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: admin, error } = await supabaseAdmin
    .from('admin_users')
    .insert({
      id: userId,
      email,
      role: 'SUPER_ADMIN',
    })
    .select('*')
    .single();

  if (error || !admin) {
    throw new Error(`Failed to create test admin profile record: ${error?.message || 'unknown error'}`);
  }

  return admin;
}

export async function getTestSession(userId: string, role: string = 'admin', email: string = 'test@example.com') {
  return createToken({ id: userId, email, role });
}


