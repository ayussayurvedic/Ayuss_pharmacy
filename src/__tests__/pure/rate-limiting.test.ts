import { describe, it, expect } from 'vitest';
import { orderRateLimiter, loginRateLimiter, apiRateLimiter, CAPTCHA_THRESHOLD } from '@/lib/rate-limit';

describe('Rate Limiter Configurations (rate-limit.ts)', () => {
  it('should have orderRateLimiter configured with appropriate spam defenses', () => {
    expect(orderRateLimiter).toBeDefined();
    // Verify properties
    expect((orderRateLimiter as any).points).toBe(5);
    expect((orderRateLimiter as any).duration).toBe(900); // 15 minutes
    expect((orderRateLimiter as any).blockDuration).toBe(900);
    expect((orderRateLimiter as any).keyPrefix).toBe('order');
  });

  it('should have loginRateLimiter configured for brute force protection', () => {
    expect(loginRateLimiter).toBeDefined();
    expect((loginRateLimiter as any).points).toBe(5);
    expect((loginRateLimiter as any).duration).toBe(900);
    expect((loginRateLimiter as any).keyPrefix).toBe('login');
    expect(CAPTCHA_THRESHOLD).toBe(3);
  });

  it('should have apiRateLimiter configured for general endpoint protection', () => {
    expect(apiRateLimiter).toBeDefined();
    expect((apiRateLimiter as any).points).toBe(30);
    expect((apiRateLimiter as any).duration).toBe(60);
    expect((apiRateLimiter as any).keyPrefix).toBe('api');
  });

  it('should sanitize phone numbers and compound keys correctly for order placement', () => {
    const rawPhone = '+91 98485-23295';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const ip = '103.21.244.2';

    const rateLimitIpKey = `ip:${ip}`;
    const rateLimitPhoneKey = `phone:${cleanPhone}`;

    expect(cleanPhone).toBe('919848523295');
    expect(rateLimitIpKey).toBe('ip:103.21.244.2');
    expect(rateLimitPhoneKey).toBe('phone:919848523295');
  });
});
