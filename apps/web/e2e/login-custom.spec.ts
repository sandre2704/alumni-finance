import { test, expect } from '@playwright/test';

/**
 * Custom Login Test
 * Test login menggunakan username: sandre1 dan password: sandre123
 */
test.describe('Login Test - Custom User', () => {
    test('should login successfully with username sandre1', async ({ page }) => {
        // 1. Navigate to login page
        await page.goto('http://localhost:5173/login');

        // 2. Wait for page to load
        await page.waitForLoadState('networkidle');

        // 3. Take screenshot before login
        await page.screenshot({ path: 'e2e/screenshots/01-before-login.png' });

        // 4. Fill username (could be in email field)
        const usernameInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="username" i]').first();
        await usernameInput.fill('sandre1');

        // 5. Fill password
        const passwordInput = page.locator('input[type="password"]');
        await passwordInput.fill('sandre123');

        // 6. Take screenshot after filling form
        await page.screenshot({ path: 'e2e/screenshots/02-form-filled.png' });

        // 7. Click sign in button
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // 8. Wait for navigation or response
        await page.waitForLoadState('networkidle');

        // 9. Take screenshot after login attempt
        await page.screenshot({ path: 'e2e/screenshots/03-after-login.png' });

        // 10. Verify login success - should redirect away from /login
        await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

        // 11. Take screenshot of dashboard
        await page.screenshot({ path: 'e2e/screenshots/04-dashboard.png' });

        console.log('✅ Login berhasil dengan username: sandre1');
    });

    test('should show error with wrong password', async ({ page }) => {
        await page.goto('http://localhost:5173/login');
        await page.waitForLoadState('networkidle');

        // Fill wrong credentials
        const usernameInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="username" i]').first();
        await usernameInput.fill('sandre1');

        const passwordInput = page.locator('input[type="password"]');
        await passwordInput.fill('wrongpassword');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Wait for error message
        await page.waitForLoadState('networkidle');

        // Should still be on login page
        await expect(page).toHaveURL(/\/login/);

        // Look for error message
        const errorMessage = page.locator('text=/Invalid|Error|Gagal|Salah/i');
        await expect(errorMessage).toBeVisible({ timeout: 10000 });

        console.log('✅ Error message ditampilkan untuk password salah');
    });
});
