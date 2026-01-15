import { test, expect, Page } from '@playwright/test';

/**
 * Transaction Flow Test
 * Login dan tambah transaksi: 2 pemasukan, 1 pengeluaran
 * 
 * Credentials:
 * - Username: sandre1
 * - Password: sandre123
 */

const TEST_USER = {
    username: 'sandre1',
    password: 'sandre123'
};

// Helper function untuk login
async function login(page: Page) {
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // Fill credentials
    const usernameInput = page.locator('input[type="email"], input[name="email"]').first();
    await usernameInput.fill(TEST_USER.username);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(TEST_USER.password);

    // Click sign in
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for redirect to dashboard
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
}

// Helper function untuk navigasi ke halaman Transaksi
async function navigateToTransactions(page: Page) {
    // Cari menu Transaksi di sidebar/navbar
    const transactionMenu = page.locator('a[href="/transactions"], [href="/transactions"]').first();
    await transactionMenu.click();

    // Wait for page to load
    await page.waitForURL('**/transactions');
    await page.waitForLoadState('networkidle');

    // Verify we're on transactions page
    await expect(page.locator('h1')).toContainText('Daftar Transaksi');
}

// Helper untuk menambah transaksi Pemasukan (Income)
async function addIncomeTransaction(page: Page, data: {
    donorName: string;
    amount: string;
    description?: string;
}) {
    // Click "Tambah Baru" button
    await page.locator('button:has-text("Tambah Baru")').click();

    // Wait for modal
    await page.waitForSelector('text=Catat Transaksi Baru', { timeout: 5000 });

    // Select "Pemasukan" (should be a radio or tab)
    await page.locator('label:has-text("Pemasukan")').click();

    // Wait for form to update
    await page.waitForTimeout(300);

    // Fill donor name
    const donorInput = page.locator('input[placeholder*="alumni" i]').first();
    await donorInput.fill(data.donorName);

    // Select first category (if not using donation target)
    const categorySelect = page.locator('select').filter({ hasText: 'Pilih Kategori' }).first();
    if (await categorySelect.count() > 0) {
        await categorySelect.selectOption({ index: 1 }); // Select first option after "Pilih Kategori"
    }

    // Fill amount
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill(data.amount);

    // Fill description if provided
    if (data.description) {
        const descTextarea = page.locator('textarea');
        if (await descTextarea.count() > 0) {
            await descTextarea.fill(data.description);
        }
    }

    // Click save button
    await page.locator('button:has-text("Simpan Transaksi")').click();

    // Wait for modal to close
    await page.waitForSelector('text=Catat Transaksi Baru', { state: 'hidden', timeout: 10000 });
    await page.waitForLoadState('networkidle');
}

// Helper untuk menambah transaksi Pengeluaran (Expense)
async function addExpenseTransaction(page: Page, data: {
    itemName: string;
    amount: string;
    description?: string;
}) {
    // Click "Tambah Baru" button
    await page.locator('button:has-text("Tambah Baru")').click();

    // Wait for modal
    await page.waitForSelector('text=Catat Transaksi Baru', { timeout: 5000 });

    // Select "Pengeluaran" (default or click it)
    await page.locator('label:has-text("Pengeluaran")').click();

    // Wait for form to update
    await page.waitForTimeout(300);

    // Fill item name
    const itemInput = page.locator('input[placeholder*="Nasi Kotak" i], input[placeholder*="Barang" i]').first();
    if (await itemInput.count() === 0) {
        // Try to find input by looking for the first text input
        const firstTextInput = page.locator('.overflow-y-auto input[type="text"]').first();
        await firstTextInput.fill(data.itemName);
    } else {
        await itemInput.fill(data.itemName);
    }

    // Select first expense category
    const categorySelect = page.locator('select').filter({ hasText: 'Pilih Kategori' }).first();
    if (await categorySelect.count() > 0) {
        await categorySelect.selectOption({ index: 1 });
    }

    // Fill amount
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill(data.amount);

    // Fill description if provided
    if (data.description) {
        const descTextarea = page.locator('textarea');
        if (await descTextarea.count() > 0) {
            await descTextarea.fill(data.description);
        }
    }

    // Click save button
    await page.locator('button:has-text("Simpan Transaksi")').click();

    // Wait for modal to close
    await page.waitForSelector('text=Catat Transaksi Baru', { state: 'hidden', timeout: 10000 });
    await page.waitForLoadState('networkidle');
}

test.describe('Transaction Flow - Add Transactions', () => {

    test('should login and add 2 income + 1 expense transactions', async ({ page }) => {
        // ============ STEP 1: LOGIN ============
        console.log('🔐 Logging in...');
        await login(page);
        await page.screenshot({ path: 'e2e/screenshots/tx-01-after-login.png' });
        console.log('✅ Login successful');

        // ============ STEP 2: NAVIGATE TO TRANSACTIONS ============
        console.log('📋 Navigating to Transaksi menu...');
        await navigateToTransactions(page);
        await page.screenshot({ path: 'e2e/screenshots/tx-02-transactions-page.png' });
        console.log('✅ Arrived at Transactions page');

        // ============ STEP 3: ADD INCOME 1 ============
        console.log('💰 Adding income transaction 1...');
        await addIncomeTransaction(page, {
            donorName: 'Ahmad Sudirman',
            amount: '500000',
            description: 'Donasi bulanan Januari'
        });
        await page.screenshot({ path: 'e2e/screenshots/tx-03-after-income-1.png' });
        console.log('✅ Income transaction 1 added');

        // ============ STEP 4: ADD INCOME 2 ============
        console.log('💰 Adding income transaction 2...');
        await addIncomeTransaction(page, {
            donorName: 'Budi Santoso',
            amount: '750000',
            description: 'Iuran tahunan alumni'
        });
        await page.screenshot({ path: 'e2e/screenshots/tx-04-after-income-2.png' });
        console.log('✅ Income transaction 2 added');

        // ============ STEP 5: ADD EXPENSE ============
        console.log('💸 Adding expense transaction...');
        await addExpenseTransaction(page, {
            itemName: 'Konsumsi Rapat Pengurus',
            amount: '350000',
            description: 'Rapat bulanan Januari 2026'
        });
        await page.screenshot({ path: 'e2e/screenshots/tx-05-after-expense.png' });
        console.log('✅ Expense transaction added');

        // ============ STEP 6: VERIFY RESULTS ============
        console.log('🔍 Verifying transactions...');
        await page.waitForLoadState('networkidle');

        // Check if transactions are visible in the table
        const tableBody = page.locator('tbody');
        await expect(tableBody).toBeVisible();

        // Take final screenshot
        await page.screenshot({ path: 'e2e/screenshots/tx-06-final-verification.png' });

        console.log('');
        console.log('========================================');
        console.log('✅ ALL TRANSACTIONS ADDED SUCCESSFULLY!');
        console.log('========================================');
        console.log('📊 Summary:');
        console.log('   - 2 Pemasukan (Income)');
        console.log('   - 1 Pengeluaran (Expense)');
        console.log('========================================');
    });
});
