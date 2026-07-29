'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function PWAStandaloneGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Detect standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      || (navigator as any).standalone;

    if (isStandalone) {
      document.body.classList.add('pwa-standalone');
      
      // If user tries to access website pages while in standalone app, allow public storefront, only guard admin paths
      const isPortalRoute = pathname.startsWith('/admin');
      
      if (!isPortalRoute && pathname.startsWith('/employee')) {
        router.replace('/admin/login');
      }
    } else {
      document.body.classList.remove('pwa-standalone');
    }
  }, [pathname, router]);

  return null;
}
