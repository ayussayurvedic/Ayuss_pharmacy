import { describe, it, expect } from 'vitest';

// Simple path tester matching updated PWA standalone guard redirect rules
function testPortalRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

describe('PWA Standalone Guard Routing Rules', () => {
  it('should recognize admin portal routes', () => {
    expect(testPortalRoute('/admin/dashboard')).toBe(true);
    expect(testPortalRoute('/admin/returns')).toBe(true);
  });

  it('should ignore non-admin paths to allow the public storefront', () => {
    expect(testPortalRoute('/products')).toBe(false);
    expect(testPortalRoute('/')).toBe(false);
  });
});
