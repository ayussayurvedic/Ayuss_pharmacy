'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X, Trash2 } from 'lucide-react';

export default function Navbar() {
  const { cartItems, cartCount, isCartOpen, setIsCartOpen, handleRemoveFromCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.sellingPrice || item.product.mrp || 0) * item.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#1A5C5E] border-b border-[#2d5238] text-white z-50 shadow-sm font-sans">
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/products/logo/logo.webp" alt="S.S. Pharmacy Logo" className="h-14 w-auto" />
          <span className="font-bold text-lg tracking-wide hidden sm:inline font-serif">S.S. PHARMACY</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-widest uppercase">
          <Link href="/" className="hover:text-[#C9943E] transition-colors">Home</Link>
          <Link href="/products" className="hover:text-[#C9943E] transition-colors">Products</Link>
          <Link href="/order-tracking" className="hover:text-[#C9943E] transition-colors">Track Order</Link>
          <Link href="/why-choose-us" className="hover:text-[#C9943E] transition-colors">Why Choose Us</Link>
          <Link href="/manufacturing" className="hover:text-[#C9943E] transition-colors">Manufacturing</Link>
          <Link href="/about" className="hover:text-[#C9943E] transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-[#C9943E] transition-colors">Contact</Link>
        </nav>

        {/* Cart trigger & Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 hover:bg-[#2d5238] rounded-full transition-colors cursor-pointer bg-transparent border-0 text-white"
            aria-label="Toggle Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#C9943E] text-[10px] text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[#2d5238] rounded-full transition-colors cursor-pointer bg-transparent border-0 text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#FDF8F0] text-slate-800 h-full flex flex-col p-6 shadow-xl relative animate-in slide-in-from-right">
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-850 bg-transparent border-0 cursor-pointer"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-sm text-[#1A5C5E] border-b pb-4 mb-4 uppercase tracking-wider">Your Shopping Bag</h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {cartItems.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-12">Your bag is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3 border-b pb-3 items-center">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-contain bg-white rounded border p-1" />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-900 block">{item.product.name}</span>
                      <span className="text-slate-500 block text-[10px] mt-0.5">Qty: {item.quantity} · {item.product.packSize}</span>
                      <span className="font-bold text-slate-800 mt-1 block">₹{(item.product.sellingPrice || item.product.mrp || 0) * item.quantity}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full bg-[#1A5C5E] hover:bg-[#2d5238] text-white text-center py-2.5 rounded-lg text-xs font-bold block transition-colors uppercase tracking-wider">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 right-0 bottom-0 bg-[#1A5C5E]/95 z-40 flex flex-col p-6 space-y-4 text-xs font-bold tracking-widest uppercase">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C9943E] transition-colors border-b border-[#2d5238] pb-2">Home</Link>
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C9943E] transition-colors border-b border-[#2d5238] pb-2">Products</Link>
          <Link href="/order-tracking" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C9943E] transition-colors border-b border-[#2d5238] pb-2">Track Order</Link>
          <Link href="/why-choose-us" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C9943E] transition-colors border-b border-[#2d5238] pb-2">Why Choose Us</Link>
          <Link href="/manufacturing" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C9943E] transition-colors border-b border-[#2d5238] pb-2">Manufacturing</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C9943E] transition-colors border-b border-[#2d5238] pb-2">About Us</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#C9943E] transition-colors border-b border-[#2d5238] pb-2">Contact</Link>
        </div>
      )}
    </header>
  );
}
