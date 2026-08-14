'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X } from 'lucide-react';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll listener to toggle glassmorphism states
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      if (!isCartOpen) {
        document.body.style.overflow = '';
      }
    }
  }, [mobileMenuOpen, isCartOpen]);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Why Choose Us', href: '/why-choose-us' },
    { name: 'Manufacturing', href: '/manufacturing' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const headerStyle = { willChange: 'height, background-color, border-color, box-shadow' };

  return (
    <>
      <header 
        style={headerStyle}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
          isScrolled 
            ? 'h-14 lg:h-16 bg-white/80 backdrop-blur-md shadow-xs border-b border-slate-200/50' 
            : 'h-16 lg:h-20 bg-white border-b border-slate-200/80'
        }`}
      >
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left: Logo & Company Name (w-1/4) */}
        <div className="w-1/4 flex justify-start min-w-0">
          <Link href="/" className="flex items-center gap-2 min-w-0 shrink-0 focus-visible:outline-2 focus-visible:outline-[#1A5C5E] rounded-lg">
            <Image 
              src="/products/logo/logo.webp" 
              alt="Ayu S.S. Pharmacy Logo" 
              className="h-9 lg:h-11 w-auto object-contain shrink-0 transition-all duration-300" 
              width={150} 
              height={56} 
              priority 
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs sm:text-sm lg:text-base tracking-tight font-serif leading-none text-[#134547] truncate">AYU S.S. PHARMACY</span>
              <span className="text-[7px] sm:text-[8px] lg:text-[9px] font-semibold text-[#C9943E] tracking-normal leading-none mt-0.5 truncate">One Stop Solution</span>
            </div>
          </Link>
        </div>

        {/* Middle: Centered Navigation (w-1/2) */}
        <div className="w-1/2 flex justify-center">
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-xs font-bold tracking-wider uppercase text-slate-700 whitespace-nowrap">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative hover:text-[#1A5C5E] transition-colors py-1.5 px-3.5 text-xs font-bold tracking-wider uppercase whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#1A5C5E] rounded-md ${
                    isActive ? 'text-[#134547]' : 'text-slate-600'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-[#C9943E] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions / Cart (w-1/4) */}
        <div className="w-1/4 flex justify-end gap-3 sm:gap-4 shrink-0">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 text-[#134547] hover:text-[#C9943E] transition-colors bg-transparent border-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A5C5E] rounded-lg"
            aria-label={`Shopping bag containing ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="absolute -top-0.5 -right-0.5 bg-[#C9943E] text-white text-[9px] lg:text-[10px] font-bold w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#134547] hover:text-[#C9943E] transition-colors bg-transparent border-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A5C5E] rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

      </div>
      </header>

      {/* Cart Drawer Portal */}
      <CartDrawer />

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className={`lg:hidden fixed inset-0 bg-black/45 backdrop-blur-xs z-30 cursor-pointer transition-all duration-300 ${
                isScrolled ? 'top-14' : 'top-16'
              }`}
            />

            {/* Links Panel */}
            <motion.div
              initial={{ y: '-10%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-10%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`lg:hidden fixed left-0 right-0 bg-[#FDF8F0] text-slate-800 z-40 flex flex-col p-5 pb-12 space-y-2.5 font-sans shadow-2xl border-t border-slate-200/80 overflow-y-auto overscroll-y-contain transition-all duration-300 ${
                isScrolled ? 'top-14 h-[calc(100dvh-3.5rem)]' : 'top-16 h-[calc(100dvh-4rem)]'
              }`}
            >
              <div className="text-[10px] font-black text-[#C9943E] uppercase tracking-widest px-1 mb-1 font-mono">
                Navigation Menu
              </div>
              
              {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 shadow-xs focus-visible:outline-2 focus-visible:outline-[#1A5C5E] ${
                      isActive 
                        ? 'bg-[#1A5C5E]/5 border-[#1A5C5E] font-bold text-[#134547]' 
                        : 'bg-white border-slate-200/80 font-medium text-slate-700 hover:border-slate-350'
                    }`}
                  >
                    <span>{link.name}</span>
                    <span className="text-[#C9943E] text-sm">→</span>
                  </Link>
                );
              })}

              <div className="pt-6 mt-4 border-t border-slate-200/80 text-center shrink-0">
                <span className="text-[10px] font-black text-[#C9943E] uppercase tracking-widest block mb-0.5 font-mono">AYU S.S. PHARMACY</span>
                <span className="text-[9px] text-slate-500 font-medium block">One Stop Solution • Govt. Licensed Ayurvedic Manufacturer</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
