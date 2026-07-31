'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function AdminBreadcrumbs() {
  const pathname = usePathname();

  if (!pathname || pathname === '/admin/dashboard' || pathname === '/admin/login') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  
  // Format path segment names cleanly
  const formatLabel = (segment: string) => {
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin', href: '/admin/dashboard' },
  ];

  let currentPath = '/admin';
  segments.forEach((segment, idx) => {
    if (segment === 'admin') return;
    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: formatLabel(segment),
      href: currentPath,
    });
  });

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className="flex items-center gap-1.5 text-xs text-slate-500 py-2 px-1 mb-2 font-medium overflow-x-auto scrollbar-none"
    >
      <Link 
        href="/admin/dashboard" 
        className="flex items-center gap-1 hover:text-[#1A5C5E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C5E] rounded-xs px-1"
        aria-label="Admin Dashboard Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {breadcrumbs.map((item, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <div key={item.href} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="w-3 h-3 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-[#1A5C5E]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[#1A5C5E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C5E] rounded-xs"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
