import { describe, it, expect } from 'vitest';

// Masking helpers from src/app/api/orders/track/route.ts
const maskString = (str: string, keep = 1) => {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.length <= keep * 2) return trimmed;
  return trimmed.slice(0, keep) + '*'.repeat(trimmed.length - keep * 2) + trimmed.slice(-keep);
};

const maskName = (name: string) => {
  if (!name) return 'Customer';
  return name.split(/\s+/).map(part => maskString(part, 1)).join(' ');
};

const maskEmail = (email: string) => {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return maskString(email, 1);
  return maskString(parts[0], 1) + '@' + parts[1];
};

function validatePhone(dbPhone: string, inputPhone: string): boolean {
  const dbPhoneClean = dbPhone.replace(/\D/g, '');
  const inputPhoneClean = inputPhone.replace(/\D/g, '');
  return dbPhoneClean.slice(-10) === inputPhoneClean.slice(-10);
}

describe('Order Tracking Security & Masking', () => {
  it('should mask customer names correctly', () => {
    expect(maskName('Janakiram Kumar')).toBe('J*******m K***r');
    expect(maskName('John')).toBe('J**n');
    expect(maskName('A')).toBe('A');
  });

  it('should mask email addresses correctly', () => {
    expect(maskEmail('customer@example.com')).toBe('c******r@example.com');
  });

  it('should mask address strings leaving start/end readable', () => {
    expect(maskString('123 Main Street, Yerraguntla, AP', 3)).toBe('123************************** AP');
  });

  it('should clean and validate phone suffixes accurately', () => {
    expect(validatePhone('+91 9848523295', '9848523295')).toBe(true);
    expect(validatePhone('09848523295', '98485 23295')).toBe(true);
    expect(validatePhone('+91 9848523295', '9848523296')).toBe(false);
  });
});
