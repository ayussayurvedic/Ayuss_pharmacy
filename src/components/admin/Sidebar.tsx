'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, MessageSquare, Building2, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
  { href: '/admin/distributors', icon: Building2, label: 'Distributor Leads' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  userName?: string;
}

export default function Sidebar({ userName = 'Admin' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('sspharmacy-admin-session');
      localStorage.removeItem('sspharmacy-admin-session');
      localStorage.removeItem('sspharmacy-admin-token');
      localStorage.removeItem('sspharmacy-session');
      localStorage.removeItem('sspharmacy-token');
    } catch {}
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-navy-900 text-white transition-all duration-300 min-h-screen',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <Image
            src="/products/logo/logo.webp"
            alt="S.S. Pharmacy Logo"
            className="h-10 w-auto object-contain shrink-0"
            width={180}
            height={60}
            priority
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-black text-white text-base tracking-wider leading-none uppercase truncate">
                S.S. PHARMACY
              </span>
              <span className="text-[10px] font-bold text-[#E8C87A] uppercase tracking-widest leading-none mt-1 truncate">
                Ayurvedic Healthcare
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors ml-1"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-500/15 text-primary-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0 transition-transform" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-1">
        {!collapsed && (
          <div className="px-3 py-1.5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Signed in as</p>
            <p className="text-xs font-semibold text-zinc-300 truncate">{userName}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 h-10 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
