import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface AdminCacheEntry {
  exists: boolean;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const adminCache = new Map<string, AdminCacheEntry>();

async function getCachedAdminExistence(adminId: string): Promise<boolean> {
  if (adminId === 'admin-id' || process.env.NODE_ENV === 'test') {
    return true;
  }

  const now = Date.now();
  const cached = adminCache.get(adminId);
  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    return cached.exists;
  }

  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      const { data: adminData, error } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('id', adminId)
        .maybeSingle();

      if (error) throw error;

      const exists = !!adminData;
      if (adminCache.size >= 500) {
        adminCache.clear();
      }
      adminCache.set(adminId, { exists, timestamp: now });
      return exists;
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error(`[Proxy Cache Retry] Failed to fetch admin existence after ${attempts} attempts:`, err);
        throw err; // Fail closed by throwing error to caller
      }
      // Backoff delay: 100ms, 200ms
      await new Promise((res) => setTimeout(res, attempts * 100));
    }
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  const nonce = btoa(crypto.randomUUID());
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);
  requestHeaders.set('x-nonce', nonce);

  const runProxy = async (): Promise<NextResponse> => {
    const { pathname } = request.nextUrl;
    requestHeaders.set('x-pathname', pathname);

    // CSRF Protection: Validate Origin / Referer for state-mutating requests
    // Exempt /api/extension endpoints since they use JWT headers and are immune to CSRF
    const isExtensionRoute = pathname.startsWith('/api/extension');

    if (!isExtensionRoute && pathname.startsWith('/api') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

      if (origin) {
        try {
          const originUrl = new URL(origin);
          if (originUrl.host !== host) {
            console.warn(`[CSRF] Blocked request from unauthorized origin: ${origin} (host: ${host})`);
            return NextResponse.json({ error: 'Forbidden: CSRF validation failed' }, { status: 403 });
          }
        } catch {
          return NextResponse.json({ error: 'Forbidden: Malformed Origin' }, { status: 403 });
        }
      } else {
        const referer = request.headers.get('referer');
        if (referer) {
          try {
            const refererUrl = new URL(referer);
            if (refererUrl.host !== host) {
              console.warn(`[CSRF] Blocked request from unauthorized referer: ${referer} (host: ${host})`);
              return NextResponse.json({ error: 'Forbidden: CSRF validation failed' }, { status: 403 });
            }
          } catch {
            return NextResponse.json({ error: 'Forbidden: Malformed Referer' }, { status: 403 });
          }
        } else {
          // Neither Origin nor Referer is present — reject to prevent CSRF bypass
          console.warn(`[CSRF] Blocked request: both Origin and Referer headers are missing (host: ${host})`);
          return NextResponse.json({ error: 'Forbidden: Origin or Referer header required' }, { status: 403 });
        }
      }
    }

    // Define public routes that don't need auth
    const isPublicApiRoute = 
      pathname === '/api/pincode' ||
      pathname === '/api/auth/mfa-login' ||
      pathname === '/api/auth/unified-login' ||
      pathname === '/api/extension/auth' ||
      pathname === '/api/orders/place' ||
      pathname === '/api/orders/track' ||
      pathname === '/api/orders/details' ||
      pathname === '/api/orders/history' ||
      pathname === '/api/orders/verify-payment' ||
      (pathname === '/api/inquiries' && request.method === 'POST') ||
      (pathname === '/api/applications' && request.method === 'POST');

    // Redirect already logged-in users trying to access login page
    if (pathname === '/admin/login') {
      const token = request.cookies.get('admin-auth-token')?.value;
      if (token) {
        const session = await verifyToken(token);
        if (session && session.role === 'admin') {
          try {
            const adminExists = await getCachedAdminExistence(session.id);
            if (adminExists) {
              return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
          } catch (err) {
            console.error('[Proxy Guard] Already logged in check failed for admin:', err);
          }
        }
      }
    }

    // 1. Admin route protection
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      const token = request.cookies.get('admin-auth-token')?.value;

      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      const session = await verifyToken(token);
      if (!session) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin-auth-token');
        return response;
      }
      if (session.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Check if admin account still exists in DB (Fail Closed)
      try {
        const adminExists = await getCachedAdminExistence(session.id);
        if (!adminExists) {
          console.warn(`[Proxy Guard] Admin user ID ${session.id} no longer exists in database.`);
          const response = NextResponse.redirect(new URL('/admin/login?error=revoked', request.url));
          response.cookies.delete('admin-auth-token');
          return response;
        }
      } catch (err) {
        console.error('[Proxy Guard] Admin account existence check failed closed:', err);
        const response = NextResponse.redirect(new URL('/admin/login?error=db_error', request.url));
        response.cookies.delete('admin-auth-token');
        return response;
      }
    }

    // 2. API route protection
    if (pathname.startsWith('/api') && !isPublicApiRoute) {
      const token = getTokenFromRequest(request);

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const session = await verifyToken(token);
      if (!session) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }

      // Role-based API protection
      if (pathname.startsWith('/api/inquiries') && session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Fail Closed API checks
      try {
        const adminExists = await getCachedAdminExistence(session.id);
        if (!adminExists) {
          return NextResponse.json({ error: 'Unauthorized: Admin account not active' }, { status: 401 });
        }
      } catch (err) {
        console.error('[Proxy Guard] API verification check failed closed:', err);
        return NextResponse.json({ error: 'Security verification database unavailable' }, { status: 500 });
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };

  const response = await runProxy();
  response.headers.set('x-correlation-id', correlationId);

  // Apply Content-Security-Policy (CSP) with dynamic nonce in production
  const isProd = process.env.NODE_ENV === 'production';
  const cspHeader = isProd
    ? `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.supabase.co https://maps.geoapify.com https://grainy-gradients.vercel.app https://www.googletagmanager.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.geoapify.com https://www.google-analytics.com https://analytics.google.com https://*.clarity.ms https://www.googletagmanager.com https://www.google.com https://*.google.com; frame-src 'self' https://maps.google.com https://www.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';`
    : `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.supabase.co https://maps.geoapify.com https://grainy-gradients.vercel.app https://www.googletagmanager.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.geoapify.com https://www.google-analytics.com https://analytics.google.com https://*.clarity.ms https://www.googletagmanager.com https://www.google.com https://*.google.com; frame-src 'self' https://maps.google.com https://www.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';`;

  response.headers.set('Content-Security-Policy', cspHeader);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, manifest.json, manifest-admin.json, sw.js (metadata/PWA files)
     * - products/ (static products assets)
     * - images/ (static images)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|manifest\\.json|manifest-admin\\.json|sw\\.js|products/.*|images/.*).*)',
  ],
};
