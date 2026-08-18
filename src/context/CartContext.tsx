'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { type Product, getDefaultProductImage } from '@/data/products';
import { useToast } from '@/components/ui/Toast';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  handleAddToCart: (product: Product, quantity?: number) => void;
  handleRemoveFromCart: (productId: string) => void;
  handleUpdateCartQuantity: (productId: string, quantity: number) => void;
  handleClearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    async function hydrateAndSyncCart() {
      let initialCart: CartItem[] = [];
      try {
        const saved = localStorage.getItem('ss_cart');
        if (saved) {
          initialCart = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Error reading cart from localStorage:', e);
      }

      // Ensure every initial item has a valid image fallback
      initialCart = initialCart.map(item => ({
        ...item,
        product: {
          ...item.product,
          image: item.product.image || getDefaultProductImage(item.product.id)
        }
      }));

      if (initialCart.length > 0) {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const productIds = initialCart.map(item => item.product.id);
          const { data: dbProducts, error } = await supabase
            .from('products')
            .select('id, name, mrp, selling_price, pack_size, image, is_active')
            .in('id', productIds);

          if (!error && dbProducts && dbProducts.length > 0) {
            const dbProductMap = new Map(dbProducts.map(p => [p.id, p]));
            initialCart = initialCart.map(item => {
              const live = dbProductMap.get(item.product.id);
              if (live) {
                return {
                  ...item,
                  product: {
                    ...item.product,
                    name: live.name || item.product.name,
                    mrp: Number(live.mrp || item.product.mrp || 0),
                    sellingPrice: Number(live.selling_price || item.product.sellingPrice || 0),
                    packSize: live.pack_size || item.product.packSize,
                    image: live.image || item.product.image || getDefaultProductImage(item.product.id),
                    isActive: live.is_active ?? true,
                  }
                };
              }
              return item;
            });
          }
        } catch (syncErr) {
          console.warn('Could not sync cart prices with database, using loaded state:', syncErr);
        }
      }

      setCartItems(initialCart);
      hasHydrated.current = true;
    }

    hydrateAndSyncCart();
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    try {
      localStorage.setItem('ss_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn(e);
    }
  }, [cartItems]);

  const handleAddToCart = (product: Product, quantity = 1) => {
    const productWithImg: Product = {
      ...product,
      image: product.image || getDefaultProductImage(product.id)
    };
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { 
                ...item, 
                product: { ...item.product, image: item.product.image || productWithImg.image }, 
                quantity: item.quantity + quantity 
              }
            : item
        );
      }
      return [...prev, { product: productWithImg, quantity }];
    });
    toast.success(`${product.name} added to cart.`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info('Item removed from cart.');
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        cartCount,
        setIsCartOpen,
        handleAddToCart,
        handleRemoveFromCart,
        handleUpdateCartQuantity,
        handleClearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
