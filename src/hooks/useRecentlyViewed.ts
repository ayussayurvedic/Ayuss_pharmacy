'use client';

import { useState, useEffect } from 'react';

export interface RecentlyViewedItem {
  id: string;
  title: string;
  url: string;
  type: 'order' | 'product' | 'distributor' | 'inquiry' | 'page';
  timestamp: number;
}

const STORAGE_KEY = 'sspharmacy_admin_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('Failed to read recently viewed items from localStorage:', err);
    }
  }, []);

  const addRecentlyViewed = (item: Omit<RecentlyViewedItem, 'timestamp'>) => {
    try {
      const newItem: RecentlyViewedItem = { ...item, timestamp: Date.now() };
      setItems((prevItems) => {
        const filtered = prevItems.filter((i) => i.url !== item.url && i.id !== item.id);
        const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.warn('Failed to save recently viewed item:', err);
    }
  };

  const clearRecentlyViewed = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
    } catch (err) {
      console.warn('Failed to clear recently viewed items:', err);
    }
  };

  return {
    items,
    addRecentlyViewed,
    clearRecentlyViewed,
  };
}
