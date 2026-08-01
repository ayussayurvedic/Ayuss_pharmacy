'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, Truck, ShoppingBag } from 'lucide-react';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const;

const panelVariants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: { type: 'spring', damping: 28, stiffness: 260 }
  },
  exit: { 
    x: '100%',
    transition: { type: 'spring', damping: 30, stiffness: 300 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
} as const;

export default function CartDrawer() {
  const { cartItems, cartCount, isCartOpen, setIsCartOpen, handleRemoveFromCart, handleUpdateCartQuantity } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      // Set focus to close button for keyboard navigation
      closeButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Handle Escape keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCartOpen]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.sellingPrice || item.product.mrp || 0) * item.quantity, 0);
  const freeShippingThreshold = 500;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Backdrop style for GPU acceleration
  const backdropStyle = { willChange: 'opacity' };
  const panelStyle = { willChange: 'transform' };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop Scrim */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            style={backdropStyle}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Cart Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={panelStyle}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart Drawer"
            className="relative w-full max-w-md bg-[#FDF8F0] text-slate-800 h-full flex flex-col p-6 shadow-2xl z-10 border-l border-slate-200/50"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#C9D5D5]/80 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-[#134547] font-serif uppercase tracking-wider">Your Shopping Bag</h3>
                <p className="text-[11px] text-slate-500 font-semibold">{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</p>
              </div>
              <motion.button
                ref={closeButtonRef}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full border border-slate-200 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A5C5E]"
                aria-label="Close Shopping Bag"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Shipping Progress bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#C9D5D5]/60 mb-4 shadow-xs shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A5C5E] mb-2">
                <Truck className="w-4.5 h-4.5 text-[#C9943E] shrink-0" />
                {amountForFreeShipping > 0 ? (
                  <span>Add <strong className="text-[#C9943E]">₹{amountForFreeShipping}</strong> more for <strong>FREE Delivery</strong></span>
                ) : (
                  <span className="text-emerald-700 font-bold">🎉 You unlocked FREE Express Delivery!</span>
                )}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-[#C9943E] h-full rounded-full"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 py-1">
              <AnimatePresence initial={false}>
                {cartItems.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-500 text-center py-16 flex flex-col items-center gap-3"
                  >
                    <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <span>Your bag is empty. Start adding some products!</span>
                  </motion.div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.product.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow duration-200"
                    >
                      <Image 
                        src={item.product.image || "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 1 1'%2F%3E"} 
                        alt={item.product.name} 
                        className="object-contain bg-white rounded-lg border p-1 shrink-0" 
                        width={56} 
                        height={56} 
                      />
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-slate-900 block leading-tight">{item.product.name}</span>
                        <span className="text-slate-500 block text-[10px] mt-0.5 font-medium">{item.product.packSize}</span>
                        <span className="font-extrabold text-[#1A5C5E] mt-1 block">₹{(item.product.sellingPrice || item.product.mrp || 0) * item.quantity}</span>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-6.5 h-6.5 rounded-lg bg-slate-50 hover:bg-slate-150 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer border border-slate-250/70 focus-visible:outline-2 focus-visible:outline-[#1A5C5E]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-6.5 h-6.5 rounded-lg bg-slate-50 hover:bg-slate-150 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer border border-slate-250/70 focus-visible:outline-2 focus-visible:outline-[#1A5C5E]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                      
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1, color: '#DC2626' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-0 bg-transparent focus-visible:outline-2 focus-visible:outline-red-500"
                        aria-label={`Remove ${item.product.name} from bag`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Subtotal and Checkout Button */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-[#C9D5D5]/80 space-y-4 shrink-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
                  <span className="text-lg font-black text-[#134547]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <Link 
                  href="/checkout" 
                  onClick={() => setIsCartOpen(false)} 
                  className="w-full bg-[#1A5C5E] hover:bg-[#134547] text-white text-center py-3 rounded-full text-xs font-bold block transition-colors uppercase tracking-wider shadow-md focus-visible:outline-2 focus-visible:outline-[#134547]"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
