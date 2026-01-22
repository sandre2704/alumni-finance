import { test, expect } from '@playwright/test';

test.describe('Donation Target Feature', () => {
    test('Create new donation target successfully', async ({ page }) => {
        // Login first
        await page.goto('http://localhost:5173/login');
        // Support both email and username login
        const usernameInput = page.locator('input[type="text"], input[type="email"]').first();
        await usernameInput.fill('admin');
        await page.fill('input[type="password"]', 'Sandre123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('http://localhost:5173/');

        // Wait for dashboard to load
        await expect(page.locator('h3', { hasText: 'Target Donasi' })).toBeVisible({ timeout: 10000 });

        // Click Tambah button
        const addButton = page.locator('button', { hasText: 'Tambah' }).first();
        await expect(addButton).toBeVisible();
        await addButton.click();

        // Check modal
        await expect(page.locator('h3', { hasText: 'Tambah Target Donasi' })).toBeVisible();

        // Fill form
        const targetName = 'Test Donasi Baru ' + Date.now();
        await page.fill('input[placeholder="Contoh: Beasiswa Alumni 2024"]', targetName);
        await page.fill('input[placeholder="Deskripsi singkat target donasi"]', 'Deskripsi test automated');
        await page.fill('input[placeholder="100.000.000"]', '5000000'); // 5.000.000

        // Submit
        await page.click('button:has-text("Simpan")');

        // Verify success
        // Modal should close
        await expect(page.locator('h3', { hasText: 'Tambah Target Donasi' })).not.toBeVisible({ timeout: 5000 });

        // Target should appear in list
        await expect(page.locator('h4', { hasText: targetName })).toBeVisible();

        // Verify API response was 201
        // (Implicitly handled if the item appears in the list)
    });
});
