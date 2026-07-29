import { describe, it, expect } from 'vitest';

interface CartItem {
  id: string;
  quantity: number;
}

function addToCart(cart: CartItem[], id: string, qty: number): CartItem[] {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    return cart.map(i => i.id === id ? { ...i, quantity: i.quantity + qty } : i);
  }
  return [...cart, { id, quantity: qty }];
}

describe('Cart Operations', () => {
  it('should add items to cart and increment quantity', () => {
    let cart: CartItem[] = [];
    cart = addToCart(cart, 'item-1', 1);
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(1);

    cart = addToCart(cart, 'item-1', 2);
    expect(cart[0].quantity).toBe(3);
  });
});
