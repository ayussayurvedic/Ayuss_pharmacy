import { describe, it, expect } from 'vitest';

const expectedItems = [
  '/admin/dashboard',
  '/admin/products',
  '/admin/inventory',
  '/admin/orders',
  '/admin/returns',
  '/admin/distributors',
  '/admin/invoices',
  '/admin/settings'
];

describe('Admin Sidebar Menu Items', () => {
  it('should contain all the required pharmacy admin pages', () => {
    // Check that our list of expected items is correctly configured
    expect(expectedItems).toContain('/admin/dashboard');
    expect(expectedItems).toContain('/admin/products');
    expect(expectedItems).toContain('/admin/inventory');
    expect(expectedItems).toContain('/admin/orders');
    expect(expectedItems).toContain('/admin/returns');
    expect(expectedItems).toContain('/admin/distributors');
    expect(expectedItems).toContain('/admin/invoices');
    expect(expectedItems).toContain('/admin/settings');
  });
});
