'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AppSidebar from '@/components/pwa/AppSidebar';
import AppHeader from '@/components/pwa/AppHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminCommandPalette from '@/components/admin/AdminCommandPalette';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { Loader2, WifiOff, HelpCircle, X, Keyboard } from 'lucide-react';
import { NotificationProvider } from '@/components/pwa/NotificationContext';
import { WebVitals } from '@/components/admin/WebVitals';

function PendingCountResolver({
  promise,
  onResolve
}: {
  promise: Promise<number>;
  onResolve: (val: number) => void;
}) {
  const count = use(promise);
  useEffect(() => {
    onResolve(count);
  }, [count, onResolve]);
  return null;
}

export default function AdminLayoutClient({
  children,
  pendingCountPromise
}: {
  children: React.ReactNode,
  pendingCountPromise?: Promise<number>
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{ id: string; role: 'admin'; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // ARIA Live region announcement event listener
  useEffect(() => {
    const handleAnnounce = (e: Event) => {
      const msg = (e as CustomEvent).detail;
      if (msg) {
        setAnnouncement(msg);
      }
    };
    window.addEventListener('admin-announce', handleAnnounce);
    return () => window.removeEventListener('admin-announce', handleAnnounce);
  }, []);

  const isLoginPage = pathname === '/admin/login';

  // Keyboard shortcut listener for Help Modal (?) and Quick Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsHelpOpen((prev) => !prev);
      } else if (e.altKey && e.key === '1') {
        e.preventDefault();
        router.push('/admin/dashboard');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        router.push('/admin/orders');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        router.push('/admin/products');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!session || session.role !== 'admin') return;

    const fetchPendingCount = async () => {
      try {
        // Pending counts mock for pharmacy admin (can fetch orders/returns counts in future waves)
        const count = 0;
        setPendingCount(count);
      } catch (err) {
        console.warn('Failed to fetch pending counts for layout', err);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 25000);
    return () => clearInterval(interval);
  }, [session]);
 
  useEffect(() => {
    if (!session || session.role !== 'admin') return;
 
    const checkAndPromptNotifications = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
 
      const permission = Notification.permission;
 
      // If already granted, sync subscription silently in the background
      if (permission === 'granted') {
        try {
          const { subscribeUserToPush } = await import('@/lib/notifications/push-helper');
          await subscribeUserToPush();
        } catch (err) {
          console.warn('Failed to sync existing push subscription:', err);
        }
        return;
      }
 
      // If default (never prompted), prompt once
      if (permission === 'default') {
        const hasPrompted = localStorage.getItem('sspharmacy-admin-notif-prompted');
        if (!hasPrompted) {
          localStorage.setItem('sspharmacy-admin-notif-prompted', 'true');
          try {
            const { subscribeUserToPush } = await import('@/lib/notifications/push-helper');
            await subscribeUserToPush();
          } catch (err) {
            console.warn('Failed to register new push subscription:', err);
          }
        }
      }
    };
 
    // Delay prompt by 2 seconds to let the dashboard finish loading smoothly
    const timer = setTimeout(checkAndPromptNotifications, 2000);
    return () => clearTimeout(timer);
  }, [session]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Let the user continue their session uninterrupted on Service Worker update
      });

      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch((err) => console.warn('SW registration failed:', err));
    }

    const checkAuth = async () => {
      // Try to load session from sessionStorage first, then fallback to localStorage
      let currentSession = null;
      try {
        const savedSession = sessionStorage.getItem('sspharmacy-admin-session');
        if (savedSession) {
          currentSession = JSON.parse(savedSession);
        } else {
          const fallbackSession = localStorage.getItem('sspharmacy-admin-session');
          if (fallbackSession) {
            currentSession = JSON.parse(fallbackSession);
            // Sync fallback session back to sessionStorage
            sessionStorage.setItem('sspharmacy-admin-session', fallbackSession);
          }
        }

        if (currentSession) {
          setSession(currentSession);
        }
      } catch (err) {
        console.warn('Error reading session from storage:', err);
      }

      if (isLoginPage) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
          const res = await fetch('/api/auth/me?role=admin', { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data.user?.role === 'admin') {
              router.replace('/admin/dashboard');
              return;
            }
          }
        } catch {
          clearTimeout(timeoutId);
        }
        setIsLoading(false);
        return;
      }

      // If offline
      if (typeof window !== 'undefined' && !navigator.onLine) {
        if (currentSession) {
          setIsLoading(false);
          return;
        } else {
          // Both are empty and device is offline, redirect to login
          router.replace('/admin/login');
          return;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch('/api/auth/me?role=admin', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
            if (data.user?.role === 'admin') {
              setSession(data.user);
              try {
                sessionStorage.setItem('sspharmacy-admin-session', JSON.stringify(data.user));
                localStorage.setItem('sspharmacy-admin-session', JSON.stringify(data.user));
              } catch {}
            } else {
            try {
              sessionStorage.removeItem('sspharmacy-admin-session');
              localStorage.removeItem('sspharmacy-admin-session');
              localStorage.removeItem('sspharmacy-admin-token');
            } catch {}
            setSession(null);
            router.replace('/admin/login');
            return;
          }
        } else if (res.status === 401 || res.status === 403 || res.status === 404) {
          // Genuine unauthenticated response
          try {
            sessionStorage.removeItem('sspharmacy-admin-session');
            localStorage.removeItem('sspharmacy-admin-session');
            localStorage.removeItem('sspharmacy-admin-token');
          } catch {}
          setSession(null);
          router.replace('/admin/login');
          return;
        } else {
          // Server errors (500, 502, etc.) -> keep local session, do not redirect
          console.warn(`Auth check received server status ${res.status}. Session retained.`);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        // Network/fetch error -> keep local session, do not redirect
        console.warn('Network/timeout error during auth verification. Session retained:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, isLoginPage]);

  // Handle hash scrolling on client-side navigation (e.g. settings#notifications, audit#activity)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    let attempts = 0;
    const maxAttempts = 10;
    const intervalTime = 150;

    const tryScroll = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return false;
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    // Try immediately
    if (tryScroll()) return;

    // Retry if element is not in DOM yet (e.g. during client-side dynamic load)
    const interval = setInterval(() => {
      attempts++;
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, intervalTime);

    const handleHashChange = () => {
      tryScroll();
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);


  const [isNavigating, setIsNavigating] = useState(false);

  // Trigger top route loading bar on page navigation
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 300);

    // Announce page changes to screen readers
    const pageSegment = pathname.split('/').filter(Boolean).pop() || '';
    const friendlyTitle = pageSegment 
      ? pageSegment.charAt(0).toUpperCase() + pageSegment.slice(1) 
      : 'Dashboard';
    setAnnouncement(`Navigated to ${friendlyTitle} page`);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-zinc-50 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/30">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Loading Portal</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <NotificationProvider adminId={session?.id} role={session?.role}>
      <WebVitals />
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      {/* Top Route Loading Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-[#1A5C5E] via-[#C9943E] to-[#1A5C5E] animate-pulse" />
      )}
      {/* WCAG Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1A5C5E] focus:text-white focus:rounded-lg focus:shadow-lg text-xs font-bold"
      >
        Skip to main content
      </a>

      <AdminCommandPalette />

      {/* Keyboard Shortcuts Help Modal */}
      {isShortcutsHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#1A5C5E]" />
                <h3 className="font-bold text-sm text-slate-900">Keyboard Shortcuts Guide</h3>
              </div>
              <button
                onClick={() => setIsShortcutsHelpOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                aria-label="Close keyboard shortcuts"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-700">Global Command Palette Search</span>
                <kbd className="px-2 py-1 bg-white border rounded-md font-mono text-[10px] font-bold shadow-xs">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-700">Navigate to Operations Dashboard</span>
                <kbd className="px-2 py-1 bg-white border rounded-md font-mono text-[10px] font-bold shadow-xs">Alt + 1</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-700">Navigate to Orders Management</span>
                <kbd className="px-2 py-1 bg-white border rounded-md font-mono text-[10px] font-bold shadow-xs">Alt + 2</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-700">Navigate to Product Catalogue</span>
                <kbd className="px-2 py-1 bg-white border rounded-md font-mono text-[10px] font-bold shadow-xs">Alt + 3</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-700">Toggle Keyboard Shortcuts Guide</span>
                <kbd className="px-2 py-1 bg-white border rounded-md font-mono text-[10px] font-bold shadow-xs">?</kbd>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setIsShortcutsHelpOpen(false)}
                className="w-full py-2 bg-[#1A5C5E] text-white rounded-lg text-xs font-semibold hover:bg-[#134446] transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-portal fixed inset-0 flex bg-zinc-50 text-navy-900 overflow-hidden font-sans">
        {pendingCountPromise && (
          <Suspense fallback={null}>
            <PendingCountResolver promise={pendingCountPromise} onResolve={setPendingCount} />
          </Suspense>
        )}
        {session && (
          <AppSidebar 
            role={session.role} 
            userName={session.name} 
            pendingCount={pendingCount} 
          />
        )}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 overflow-x-hidden">
          <AppHeader userName={session?.name} role={session?.role} notificationCount={session?.role === 'admin' ? pendingCount : 0} />
          <main id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-6 md:p-6 md:pt-8 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-6 scroll-smooth scrollbar-none">
            <div className="max-w-7xl mx-auto space-y-4">
              {isOffline && (
                <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs" role="alert">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  <span>Network connection lost. You are operating in offline cached mode.</span>
                </div>
              )}
              <AdminBreadcrumbs />
              <AdminErrorBoundary>
                {children}
              </AdminErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
