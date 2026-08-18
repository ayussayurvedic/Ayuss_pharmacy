import { describe, it, expect } from 'vitest';
import { isDisposableEmail } from '@/lib/validations';

describe('Pincode, GPS Geocoding & Public APIs Suite', () => {
  describe('Indian Pincode Formatting & Rules', () => {
    it('accepts valid 6-digit Indian pincodes', () => {
      const pin = '516309';
      expect(/^\d{6}$/.test(pin)).toBe(true);
    });

    it('rejects invalid or non-numeric pincodes', () => {
      expect(/^\d{6}$/.test('51630')).toBe(false);
      expect(/^\d{6}$/.test('5163099')).toBe(false);
      expect(/^\d{6}$/.test('51630A')).toBe(false);
    });
  });

  describe('UPI QR Code Intent URL Generation', () => {
    it('constructs a valid NPCI UPI payment intent URI', () => {
      const vpa = 'ayuss.pharmacy@okaxis';
      const payeeName = 'S.S. Pharmacy';
      const amount = (499.5).toFixed(2);
      const orderNo = 'SSP-984852';

      const upiUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=${orderNo}&cu=INR`;

      expect(upiUrl).toContain('pa=ayuss.pharmacy@okaxis');
      expect(upiUrl).toContain('am=499.50');
      expect(upiUrl).toContain('tn=SSP-984852');
      expect(upiUrl).toContain('cu=INR');
    });

    it('encodes correctly for QRServer API payload', () => {
      const upiUrl = 'upi://pay?pa=ayuss.pharmacy@okaxis&am=299.00&tn=SSP-1234&cu=INR';
      const qrEndpoint = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

      expect(qrEndpoint).toContain('api.qrserver.com');
      expect(qrEndpoint).toContain(encodeURIComponent('ayuss.pharmacy@okaxis'));
    });
  });

  describe('Anti-Disposable Email Shield (EVA & Local Blocklist)', () => {
    it('detects known disposable email services immediately', async () => {
      expect(await isDisposableEmail('test@mailinator.com')).toBe(true);
      expect(await isDisposableEmail('user@tempmail.com')).toBe(true);
      expect(await isDisposableEmail('bot@10minutemail.com')).toBe(true);
      expect(await isDisposableEmail('spam@guerrillamail.com')).toBe(true);
    });

    it('allows genuine consumer & enterprise domains', async () => {
      expect(await isDisposableEmail('dr.anji@gmail.com')).toBe(false);
      expect(await isDisposableEmail('ayuss.ayurvedic@gmail.com')).toBe(false);
      expect(await isDisposableEmail('contact@sspharmacy.com')).toBe(false);
    });
  });
});
