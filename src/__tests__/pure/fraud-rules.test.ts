import { describe, it, expect } from 'vitest';

// ──────────────────────────────────────────────────────────────────
// Pure helper: fraud score calculation (mirrors route.ts logic)
// ──────────────────────────────────────────────────────────────────
function calculateFraudScore(params: {
  recentOrdersCount: number;
  isSameIP: boolean;
  isCOD: boolean;
}): number {
  let score = 0;
  if (params.recentOrdersCount > 2) score += 50;
  if (params.isSameIP && params.isCOD) score += 30;
  return score;
}

// ──────────────────────────────────────────────────────────────────
// Pure helper: estimated delivery date calculation
// ──────────────────────────────────────────────────────────────────
const MAJOR_METRO_PINCODES = ['110001', '400001', '560001', '600001', '500001', '700001'];

function estimateDeliveryDate(pincode: string, orderDate: Date): Date {
  const isMajorMetro = MAJOR_METRO_PINCODES.includes(pincode.trim());
  const daysToAdd = isMajorMetro ? 3 : 5;
  const est = new Date(orderDate);
  est.setDate(est.getDate() + daysToAdd);
  return est;
}

// ──────────────────────────────────────────────────────────────────
// Pure helper: pincode validation (mirrors route.ts logic)
// ──────────────────────────────────────────────────────────────────
function isValidIndianPincode(pincode: string): boolean {
  const clean = pincode.replace(/\s+/g, '');
  return /^\d{6}$/.test(clean);
}

// ──────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────
describe('Fraud and Delivery Date Calculation Helper', () => {
  // Fraud score tests
  it('calculates elevated fraud score for spam COD orders', () => {
    const score = calculateFraudScore({ recentOrdersCount: 3, isSameIP: true, isCOD: true });
    expect(score).toBe(80);
  });

  it('returns zero for clean first-time online payment orders', () => {
    const score = calculateFraudScore({ recentOrdersCount: 0, isSameIP: false, isCOD: false });
    expect(score).toBe(0);
  });

  it('flags only rate for repeat orders without COD', () => {
    const score = calculateFraudScore({ recentOrdersCount: 5, isSameIP: true, isCOD: false });
    expect(score).toBe(50);
  });

  it('flags only COD + same IP without rate abuse', () => {
    const score = calculateFraudScore({ recentOrdersCount: 1, isSameIP: true, isCOD: true });
    expect(score).toBe(30);
  });

  it('returns zero for COD without same IP and low order count', () => {
    const score = calculateFraudScore({ recentOrdersCount: 1, isSameIP: false, isCOD: true });
    expect(score).toBe(0);
  });

  // Delivery date tests
  it('estimates 3 days for major metros', () => {
    const date = estimateDeliveryDate('500001', new Date('2026-07-31'));
    expect(date.getDate()).toBe(3); // 31 + 3 = Aug 3
  });

  it('estimates 5 days for non-metro pincodes', () => {
    const date = estimateDeliveryDate('516309', new Date('2026-07-31'));
    expect(date.getDate()).toBe(5); // 31 + 5 = Aug 5
  });

  it('handles all 6 major metro pincodes at 3 days', () => {
    for (const pin of MAJOR_METRO_PINCODES) {
      const date = estimateDeliveryDate(pin, new Date('2026-08-01'));
      expect(date.getDate()).toBe(4); // Aug 1 + 3 = Aug 4
    }
  });

  it('handles pincode with whitespace', () => {
    const date = estimateDeliveryDate(' 110001 ', new Date('2026-08-01'));
    expect(date.getDate()).toBe(4); // metro = 3 days
  });

  it('handles month boundary crossing', () => {
    const date = estimateDeliveryDate('516309', new Date('2026-08-29'));
    expect(date.getMonth()).toBe(8); // September (0-indexed)
    expect(date.getDate()).toBe(3); // 29 + 5 = Sep 3
  });

  // Pincode validation tests
  it('validates correct Indian pincodes', () => {
    expect(isValidIndianPincode('516309')).toBe(true);
    expect(isValidIndianPincode('110001')).toBe(true);
    expect(isValidIndianPincode('400001')).toBe(true);
  });

  it('rejects invalid pincode formats', () => {
    expect(isValidIndianPincode('1234')).toBe(false);
    expect(isValidIndianPincode('12345678')).toBe(false);
    expect(isValidIndianPincode('abcdef')).toBe(false);
    expect(isValidIndianPincode('')).toBe(false);
  });

  it('accepts pincodes with leading/trailing whitespace', () => {
    expect(isValidIndianPincode(' 516309 ')).toBe(true);
  });
});
