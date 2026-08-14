import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

test.describe('S.S. Pharmacy Admin Portal Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Print browser console messages and errors to debug
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[Browser JS Error] ${err.message}`));
  });

  test('should load the admin login page', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page).toHaveURL(/.*\/admin\/login/);

    const loginCard = page.locator('.admin-card, form');
    await expect(loginCard).toBeVisible();

    const usernameInput = page.locator('input[type="email"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]');
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should contain WCAG skip navigation link on admin pages', async ({ page, context }) => {
    // Intercept auth checks to simulate logged in admin session
    await page.route('**/api/auth/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 'admin-id', role: 'admin', name: 'Mock Admin' }
        }),
      });
    });

    // Mock dashboard metrics stats endpoint
    await page.route('**/api/admin/dashboard-stats*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            orders: { total: 10, pending: 2, revenue: 5000 },
            products: { total: 24, lowStock: 3 },
          }
        }),
      });
    });

    // Generate a valid JWT token matching the middleware's expectation
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'placeholder-secret');
    const token = await new SignJWT({ id: 'admin-id', role: 'admin', email: 'ayuss.ayurvedic@gmail.com', name: 'Mock Admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret);

    // Set browser cookie
    await context.addCookies([
      {
        name: 'admin-auth-token',
        value: token,
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Navigate to login page first to establish storage origin
    await page.goto('/admin/login');
    
    // Inject mock session into sessionStorage and localStorage for the client-side app router
    await page.evaluate(() => {
      const mockUser = { id: 'admin-id', role: 'admin', name: 'Mock Admin' };
      sessionStorage.setItem('sspharmacy-admin-session', JSON.stringify(mockUser));
      localStorage.setItem('sspharmacy-admin-session', JSON.stringify(mockUser));
    });

    // Navigate to dashboard
    await page.goto('/admin/dashboard');

    // Confirm skip to content link presence in DOM
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });
});
