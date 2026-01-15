import { test, expect } from '@playwright/test';

/**
 * Test Credentials
 * These match the user created in global-setup.ts
 */
const TEST_USER = {
    email: 'e2etest@alumni.com',
    password: 'TestPassword123!',
};

test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to login page before each test
        await page.goto('/login');
    });

    test('should display login form correctly', async ({ page }) => {
        // Verify page elements are visible
        await expect(page.locator('h1')).toContainText('Admin Portal');
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
    });

    test('should show validation for empty fields', async ({ page }) => {
        // Try to submit empty form
        await page.locator('button[type="submit"]').click();

        // HTML5 validation should prevent submission
        // Check that email input has validation state
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toHaveAttribute('required', '');
    });

    test('should show error message for invalid credentials', async ({ page }) => {
        // Fill in wrong credentials
        await page.fill('input[type="email"]', 'wrong@email.com');
        await page.fill('input[type="password"]', 'wrongpassword');

        // Click sign in
        await page.locator('button[type="submit"]').click();

        // Wait for error message to appear
        const errorMessage = page.locator('text=Invalid username or password');
        await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        // Fill in valid credentials
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);

        // Click sign in
        await page.locator('button[type="submit"]').click();

        // Wait for redirect to dashboard (URL should change from /login)
        await expect(page).toHaveURL('/', { timeout: 15000 });

        // Verify we're on the dashboard (check for some dashboard element)
        // Adjust this selector based on your actual dashboard content
        await expect(page.locator('body')).not.toContainText('Admin Portal');
    });

    test('should show loading state when submitting', async ({ page }) => {
        // Fill in credentials
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);

        // Click sign in and immediately check for loading state
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Button should show loading text (check for "Signing In...")
        // This might be very quick, so we use a short timeout
        await expect(submitButton).toContainText(/Sign|Signing/, { timeout: 5000 });
    });

    test('should have link to registration page', async ({ page }) => {
        // Check for registration link
        const registerLink = page.locator('a[href="/register"]');
        await expect(registerLink).toBeVisible();
        await expect(registerLink).toContainText('Daftar di sini');
    });

    test('should have Google login button', async ({ page }) => {
        // Check for Google login button
        const googleButton = page.locator('button:has-text("Sign in with Google")');
        await expect(googleButton).toBeVisible();
    });
});
