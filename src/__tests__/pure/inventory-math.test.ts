import { describe, it, expect } from 'vitest';

function getAvailableStock(onHand: number, reserved: number): number {
  return onHand - reserved;
}

function getStockStatus(available: number, reorderLevel: number, enabled: boolean): 'in_stock' | 'low_stock' | 'out_of_stock' | 'disabled' {
  if (!enabled) return 'disabled';
  if (available <= 0) return 'out_of_stock';
  if (available <= reorderLevel) return 'low_stock';
  return 'in_stock';
}

describe('Inventory Math & Status Check', () => {
  it('should compute available quantity correctly', () => {
    expect(getAvailableStock(100, 10)).toBe(90);
  });

  it('should determine stock condition types correctly', () => {
    expect(getStockStatus(90, 10, true)).toBe('in_stock');
    expect(getStockStatus(5, 10, true)).toBe('low_stock');
    expect(getStockStatus(0, 10, true)).toBe('out_of_stock');
    expect(getStockStatus(90, 10, false)).toBe('disabled');
  });
});
