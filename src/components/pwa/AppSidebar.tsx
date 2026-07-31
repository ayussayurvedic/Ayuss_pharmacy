'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Clock, UserCircle, LogOut, 
  MessageSquare, Users, FileUser, FileText,
  Settings, ChevronLeft, Calendar, CheckSquare,
  MoreHorizontal, X, ClipboardList, BarChart2, Shield, Building2, Bell, Home,
  Briefcase, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface AppSidebarProps {
  role?: string;
  userName?: string;
  initialPendingCount?: number;
  pendingCount?: number;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  section: string;
}

export default function AppSidebar({ role, userName, initialPendingCount = 0, pendingCount: propPendingCount }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [pendingCount, setPendingCount] = useState(initialPendingCount);

  useEffect(() => {
    if (propPendingCount !== undefined) {
      setPendingCount(propPendingCount);
    }
  }, [propPendingCount]);

  useEffect(() => {
    if (propPendingCount === undefined) {
      setPendingCount(initialPendingCount);
    }
  }, [initialPendingCount, propPendingCount]);

  useEffect(() => {
    if (propPendingCount !== undefined) return;
    if (role !== 'admin') return;

    const fetchPendingCount = async () => {
      try {
        const count = 0;
        setPendingCount(count);
      } catch (err) {
        console.warn('Failed to fetch pending counts for sidebar', err);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 25000);
    return () => clearInterval(interval);
  }, [role, propPendingCount]);

  const desktopAdminItems: NavItem[] = [
    // ─── Operations ───
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview', section: 'Operations' },
    { href: '/admin/orders', icon: ClipboardList, label: 'Orders', section: 'Operations' },
    { href: '/admin/returns', icon: Clock, label: 'Returns', section: 'Operations' },
    
    // ─── Catalogue & Supply ───
    { href: '/admin/products', icon: Briefcase, label: 'Products', section: 'Catalogue & Supply' },
    { href: '/admin/inventory', icon: Activity, label: 'Inventory Control', section: 'Catalogue & Supply' },
    { href: '/admin/suppliers', icon: Users, label: 'Suppliers', section: 'Catalogue & Supply' },
    { href: '/admin/procurement', icon: CheckSquare, label: 'Procurement POs', section: 'Catalogue & Supply' },
    { href: '/admin/distributors', icon: Building2, label: 'Distributors', section: 'Catalogue & Supply' },

    // ─── Quality & Compliance ───
    { href: '/admin/expirations', icon: Clock, label: 'Batch Expirations', section: 'Quality & Compliance' },
    { href: '/admin/recalls', icon: Shield, label: 'Quality Recalls', section: 'Quality & Compliance' },
    { href: '/admin/audit', icon: FileText, label: 'Audit Logs', section: 'Quality & Compliance' },
    
    // ─── Finance & System ───
    { href: '/admin/invoices', icon: FileText, label: 'Invoices & GST', section: 'Finance & System' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', section: 'Finance & System' },
    { href: '/admin/profile', icon: UserCircle, label: 'My Profile', section: 'Finance & System' },
  ];

  const navItems = desktopAdminItems;

  // Mobile navigation arrays
  const mobileAdminBottom = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/orders', icon: ClipboardList, label: 'Orders' },
    { href: '/admin/returns', icon: Clock, label: 'Returns' },
    { href: '/admin/products', icon: Briefcase, label: 'Products' },
  ];

  const mobileAdminMore = [
    { href: '/admin/inventory', icon: Activity, label: 'Inventory', section: 'Catalogue & Supply' },
    { href: '/admin/suppliers', icon: Users, label: 'Suppliers', section: 'Catalogue & Supply' },
    { href: '/admin/procurement', icon: CheckSquare, label: 'Procurement', section: 'Catalogue & Supply' },
    { href: '/admin/distributors', icon: Building2, label: 'Distributors', section: 'Catalogue & Supply' },
    { href: '/admin/expirations', icon: Clock, label: 'Expirations', section: 'Quality & Compliance' },
    { href: '/admin/recalls', icon: Shield, label: 'Recalls', section: 'Quality & Compliance' },
    { href: '/admin/audit', icon: FileText, label: 'Audit Logs', section: 'Quality & Compliance' },
    { href: '/admin/invoices', icon: FileText, label: 'Invoices', section: 'Finance & System' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', section: 'Finance & System' },
    { href: '/admin/profile', icon: UserCircle, label: 'Profile', section: 'Finance & System' },
  ];

  const bottomBarItems = mobileAdminBottom;
  const overflowItems = mobileAdminMore;
  const hasOverflow = overflowItems.length > 0;

  // Check if any overflow item is currently active (to highlight the "More" button)
  const isOverflowActive = overflowItems.some((item) => pathname === item.href.split('#')[0]);

  // Render bottom nav bar on all employee mobile pages
  const hideMobileNav = false;

  const handleLogout = async () => {
    setIsMoreOpen(false);
    setConfirmLogout(true);
  };

  const executeLogout = async () => {
    setConfirmLogout(false);
    try {
      sessionStorage.removeItem('sspharmacy-admin-session');
      localStorage.removeItem('sspharmacy-admin-session');
      localStorage.removeItem('sspharmacy-admin-token');
      sessionStorage.removeItem('sspharmacy-employee-session');
      localStorage.removeItem('sspharmacy-employee-session');
      localStorage.removeItem('sspharmacy-employee-token');
      localStorage.removeItem('sspharmacy-session');
      localStorage.removeItem('sspharmacy-token');
    } catch {}
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <>
      {/* ─── Desktop Sidebar (hidden on mobile) ─── */}
      <aside className={cn(
        'hidden md:flex flex-col bg-[#134547] text-white transition-[width] duration-300 ease-in-out h-full border-r border-[#1A5C5E]/50 overflow-hidden',
        collapsed ? 'w-[68px]' : 'w-60'
      )}>
        {/* Brand */}
        <div className="flex items-center justify-between p-4 border-b border-[#1A5C5E]/60 h-16">
          {!collapsed ? (
            <>
              <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
                <Logo className="w-9 h-auto max-h-9 object-contain shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif font-black text-white text-sm tracking-wider leading-none uppercase truncate">
                    AYU S.S. PHARMACY
                  </span>
                  <span className="text-[9px] font-bold text-[#E8C87A] uppercase tracking-widest leading-none mt-1 truncate">
                    One Stop Solution
                  </span>
                </div>
              </Link>
              <button 
                onClick={() => setCollapsed(true)} 
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setCollapsed(false)} 
              className="mx-auto p-1.5 rounded-lg hover:bg-white/10 transition-all active:scale-95"
              aria-label="Expand sidebar"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C9943E] flex items-center justify-center shadow-lg shadow-[#C9943E]/20">
                <span className="text-white font-black text-sm">SS</span>
              </div>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2.5 space-y-1.5 overflow-y-auto scrollbar-sidebar">
          {(() => {
            let lastSection = '';
            return navItems.map((item: NavItem) => {
              const isActive = pathname === item.href.split('#')[0];
              const showSectionHeader = item.section && item.section !== lastSection;
              if (showSectionHeader) {
                lastSection = item.section;
              }
              return (
                <div key={item.href} className="space-y-1">
                  {showSectionHeader && !collapsed && (
                    <div className="text-[9px] font-black text-[#E8C87A] uppercase tracking-[0.18em] px-3 pt-4 pb-1.5">
                      {item.section}
                    </div>
                  )}
                  <Link 
                    href={item.href} 
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group',
                      isActive 
                        ? 'bg-[#C9943E] text-white shadow-lg shadow-[#C9943E]/30 font-bold' 
                        : 'text-slate-200 hover:text-white hover:bg-[#1A5C5E]/60'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="relative shrink-0 flex items-center justify-center">
                      <item.icon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </div>
              );
            });
          })()}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-3">
          {!collapsed && userName && (
            <div className="px-3 py-2">
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-0.5">Signed in</p>
              <p className="text-xs font-medium text-gray-300 truncate">{userName}</p>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── Mobile Bottom Navigation Bar ─── */}
      {/* Hidden on dashboard & attendance — those pages have their own bottom tab bar */}
      {!hideMobileNav && <nav className="max-md:block hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] max-w-[430px] mx-auto">
        <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)] flex-row">
          {bottomBarItems.map((item) => {
            const isActive = pathname === item.href.split('#')[0];
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 rounded-xl transition-all',
                  isActive 
                    ? 'text-primary-505 text-primary-500' 
                    : 'text-gray-400 active:text-gray-600'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-xl transition-all relative',
                  isActive && 'bg-primary-50'
                )}>
                  <item.icon className="w-5 h-5" />
                  {item.label === 'Approvals' && pendingCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] leading-none font-medium',
                  isActive && 'font-bold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* "More" button (replaces static logout when overflow items exist) */}
          {hasOverflow ? (
            <button 
              onClick={() => setIsMoreOpen(true)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-all',
                isOverflowActive 
                  ? 'text-primary-500' 
                  : 'text-gray-400 active:text-gray-600'
              )}
              aria-label="More navigation options"
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all relative',
                isOverflowActive && 'bg-primary-50'
              )}>
                <MoreHorizontal className="w-5 h-5" />
              </div>
              <span className={cn(
                'text-[10px] leading-none font-medium',
                isOverflowActive && 'font-bold'
              )}>
                More
              </span>
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-all text-gray-400 active:text-red-500"
            >
              <div className="p-1.5 rounded-xl">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-none font-medium">Exit</span>
            </button>
          )}
        </div>
      </nav>}
 
      {/* ─── Mobile "More" Bottom Sheet Drawer ─── */}
      <AnimatePresence>
        {!hideMobileNav && isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-md:block hidden fixed inset-0 z-[60] bg-navy-900/60 backdrop-blur-sm"
              onClick={() => setIsMoreOpen(false)}
            />
 
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="max-md:block hidden fixed bottom-0 left-0 right-0 z-[70] pb-[env(safe-area-inset-bottom)] rounded-t-[2rem] shadow-2xl bg-white text-navy-900 border-t border-border"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
 
              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-navy-900">Portal Menu</h3>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-xl transition-colors bg-surface-alt text-gray-400 hover:text-navy-900"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
 
              {/* Overflow Nav Items */}
              <div className="px-5 pb-3 max-h-[60vh] overflow-y-auto">
                {Array.from(new Set(overflowItems.map(item => item.section))).map((sec) => {
                  const sectionItems = overflowItems.filter(item => item.section === sec);
                  if (sectionItems.length === 0) return null;
                  return (
                    <div key={sec} className="mb-4">
                      <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 border-b border-zinc-100 pb-1 mb-2">
                        {sec}
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {sectionItems.map((item) => {
                          const isActive = pathname === item.href.split('#')[0];
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMoreOpen(false)}
                              className={cn(
                                'flex flex-col items-center justify-center p-3 rounded-2xl gap-1.5 transition-all active:scale-95 border',
                                isActive
                                  ? 'bg-primary-50 border-primary-100 text-primary-600'
                                  : 'bg-surface-alt/60 border-transparent text-gray-600 hover:bg-surface-alt'
                              )}
                            >
                              <item.icon className="w-5 h-5" />
                              <span className="text-[10px] font-semibold text-center truncate w-full">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
 
              {/* User Info + Sign Out */}
              <div className="mx-5 mt-2 mb-4 p-4 rounded-2xl border bg-surface-alt/60 border-border/40">
                {userName && (
                  <div className="mb-3 pb-3 border-b border-border/40">
                    <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-0.5">Signed in as</p>
                    <p className="text-xs font-semibold truncate text-navy-900">{userName}</p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full text-red-500 hover:text-red-400 transition-colors active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-bold">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={executeLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        variant="danger"
      />
    </>
  );
}
