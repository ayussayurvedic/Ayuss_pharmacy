'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Boxes, 
  Building2, 
  MessageSquare, 
  Settings, 
  FileText, 
  X 
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  href: string;
  icon: React.ReactNode;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: 'dash', title: 'Executive Dashboard', category: 'Navigation', shortcut: 'Alt+1', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4 text-[#1A5C5E]" /> },
  { id: 'orders', title: 'Customer Orders', category: 'Navigation', shortcut: 'Alt+2', href: '/admin/orders', icon: <ShoppingBag className="w-4 h-4 text-[#C9943E]" /> },
  { id: 'inv', title: 'Inventory & Stock Control', category: 'Navigation', shortcut: 'Alt+3', href: '/admin/inventory', icon: <Boxes className="w-4 h-4 text-emerald-600" /> },
  { id: 'prod', title: 'Product Catalog', category: 'Management', href: '/admin/products', icon: <Package className="w-4 h-4 text-sky-600" /> },
  { id: 'dist', title: 'Wholesale B2B Distributors', category: 'Management', href: '/admin/distributors', icon: <Building2 className="w-4 h-4 text-indigo-600" /> },
  { id: 'inq', title: 'CRM Inquiries', category: 'Communication', href: '/admin/inquiries', icon: <MessageSquare className="w-4 h-4 text-amber-600" /> },
  { id: 'sets', title: 'System Settings', category: 'System', href: '/admin/settings', icon: <Settings className="w-4 h-4 text-slate-600" /> },
  { id: 'audit', title: 'Audit Trail Logs', category: 'System', href: '/admin/audit', icon: <FileText className="w-4 h-4 text-rose-600" /> },
];

export default function AdminCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Quick Alt navigation shortcuts
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          router.push('/admin/dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          router.push('/admin/orders');
        } else if (e.key === '3') {
          e.preventDefault();
          router.push('/admin/inventory');
        }
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Admin Command Palette"
    >
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search section (e.g. Orders, Inventory)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent text-slate-800 text-xs font-medium focus:outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-xs">
            ESC
          </kbd>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Close Command Palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-none">
          {filteredCommands.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No matching administrative pages found.</p>
          ) : (
            filteredCommands.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#1A5C5E]/10 text-[#1A5C5E] font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-100 shadow-xs">
                      {item.icon}
                    </div>
                    <div>
                      <span className="block text-xs">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                    </div>
                  </div>
                  {item.shortcut && (
                    <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-[#1A5C5E] bg-[#1A5C5E]/8 rounded-md border border-[#1A5C5E]/20">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white px-1 py-0.5 border rounded-xs">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-white px-1 py-0.5 border rounded-xs">↵</kbd> select</span>
          </div>
          <span><kbd className="font-mono bg-white px-1 py-0.5 border rounded-xs">Cmd+K</kbd> trigger</span>
        </div>
      </div>
    </div>
  );
}
