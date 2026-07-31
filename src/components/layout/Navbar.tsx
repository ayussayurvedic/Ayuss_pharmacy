'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X, Trash2, Plus, Minus, Truck } from 'lucide-react';

export default function Navbar() {
  const { cartItems, cartCount, isCartOpen, setIsCartOpen, handleRemoveFromCart, handleUpdateCartQuantity } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.sellingPrice || item.product.mrp || 0) * item.quantity, 0);
  const freeShippingThreshold = 500;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white border-b border-slate-200/80 text-slate-800 z-50 shadow-xs font-sans">
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <Image src="/products/logo/logo.webp" alt="Ayu S.S. Pharmacy Logo" className="h-9 sm:h-12 w-auto object-contain shrink-0" width={150} height={56} priority />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs sm:text-base md:text-lg tracking-tight sm:tracking-wide font-serif leading-none text-[#134547] truncate">AYU S.S. PHARMACY</span>
            <span className="text-[8px] sm:text-[10px] md:text-[11px] font-bold text-[#C9943E] tracking-wider uppercase leading-none mt-0.5 sm:mt-1 truncate">One Stop Solution</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-slate-700">
          <Link href="/" className="hover:text-[#1A5C5E] transition-colors py-1">Home</Link>
          <Link href="/products" className="hover:text-[#1A5C5E] transition-colors py-1">Products</Link>
          <Link href="/why-choose-us" className="hover:text-[#1A5C5E] transition-colors py-1">Why Choose Us</Link>
          <Link href="/manufacturing" className="hover:text-[#1A5C5E] transition-colors py-1">Manufacturing</Link>
          <Link href="/about" className="hover:text-[#1A5C5E] transition-colors py-1">About Us</Link>
          <Link href="/contact" className="hover:text-[#1A5C5E] transition-colors py-1">Contact</Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 text-[#134547] hover:text-[#C9943E] transition-colors bg-transparent border-0 cursor-pointer"
            aria-label={`Shopping bag containing ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C9943E] text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#134547] hover:text-[#C9943E] transition-colors bg-transparent border-0 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex justify-end">
          <div className="w-full max-w-md bg-[#FDF8F0] text-slate-800 h-full flex flex-col p-6 shadow-2xl relative animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#C9D5D5]/80 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-[#134547] font-serif uppercase tracking-wider">Your Shopping Bag</h3>
                <p className="text-[11px] text-slate-500 font-medium">{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full border border-slate-200 transition-colors cursor-pointer"
                aria-label="Close Shopping Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#C9D5D5]/80 mb-4 shadow-xs shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A5C5E] mb-1.5">
                <Truck className="w-4 h-4 text-[#C9943E] shrink-0" />
                {amountForFreeShipping > 0 ? (
                  <span>Add <strong className="text-[#C9943E]">₹{amountForFreeShipping}</strong> more for <strong>FREE Delivery</strong></span>
                ) : (
                  <span className="text-emerald-700 font-bold">🎉 You unlocked FREE Express Delivery!</span>
                )}
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1A5C5E] to-[#C9943E] transition-all duration-300"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
              {cartItems.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-12">Your bag is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3 border-b pb-3 items-center bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                    <Image src={item.product.image || ''} alt={item.product.name} className="object-contain bg-white rounded border p-1 shrink-0" width={52} height={52} />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-900 block">{item.product.name}</span>
                      <span className="text-slate-500 block text-[10px] mt-0.5">{item.product.packSize}</span>
                      <span className="font-bold text-[#1A5C5E] mt-1 block">₹{(item.product.sellingPrice || item.product.mrp || 0) * item.quantity}</span>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer border border-slate-300"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer border border-slate-300"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
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
              <div className="border-t pt-4 space-y-3 shrink-0">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full bg-[#1A5C5E] hover:bg-[#134547] text-white text-center py-3 rounded-full text-xs font-bold block transition-colors uppercase tracking-wider shadow-md">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 md:top-20 left-0 right-0 bottom-0 bg-[#FDF8F0] text-slate-800 z-40 flex flex-col p-5 space-y-2.5 font-sans shadow-2xl border-t border-slate-200/80 overflow-y-auto animate-in slide-in-from-top duration-250">
          <div className="text-[10px] font-bold text-[#C9943E] uppercase tracking-widest px-1 mb-1">
            Navigation Menu
          </div>
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 font-bold text-xs text-[#134547] hover:border-[#1A5C5E] transition-all shadow-xs">
            <span>Home</span>
            <span className="text-[#C9943E] text-sm">→</span>
          </Link>
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 font-bold text-xs text-[#134547] hover:border-[#1A5C5E] transition-all shadow-xs">
            <span>Products</span>
            <span className="text-[#C9943E] text-sm">→</span>
          </Link>
          <Link href="/why-choose-us" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 font-bold text-xs text-[#134547] hover:border-[#1A5C5E] transition-all shadow-xs">
            <span>Why Choose Us</span>
            <span className="text-[#C9943E] text-sm">→</span>
          </Link>
          <Link href="/manufacturing" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 font-bold text-xs text-[#134547] hover:border-[#1A5C5E] transition-all shadow-xs">
            <span>Manufacturing</span>
            <span className="text-[#C9943E] text-sm">→</span>
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 font-bold text-xs text-[#134547] hover:border-[#1A5C5E] transition-all shadow-xs">
            <span>About Us</span>
            <span className="text-[#C9943E] text-sm">→</span>
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 font-bold text-xs text-[#134547] hover:border-[#1A5C5E] transition-all shadow-xs">
            <span>Contact</span>
            <span className="text-[#C9943E] text-sm">→</span>
          </Link>

          <div className="pt-4 mt-auto border-t border-slate-200/80 text-center shrink-0">
            <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-widest block mb-0.5">AYU S.S. PHARMACY</span>
            <span className="text-[10px] text-slate-500 font-medium block">One Stop Solution • Govt. Licensed Ayurvedic Manufacturer</span>
          </div>
        </div>
      )}
    </header>
  );
}
