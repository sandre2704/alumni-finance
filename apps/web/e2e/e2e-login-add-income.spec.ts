import { test, expect } from '@playwright/test';

/**
 * E2E Test: Login sekali dan Input 10 Transaksi dalam 1 sesi browser
 * 
 * Test Cases:
 * 1. Pemasukan biasa dengan kategori
 * 2. Pemasukan dengan donasi
 * 3. Pemasukan sebagai anonim
 * 4. Pemasukan donasi + anonim
 * 5. Pengeluaran biasa
 * 6. Pemasukan dengan jumlah besar
 * 7. Pengeluaran dengan keterangan panjang
 * 8. Pemasukan kategori berbeda
 * 9. Pengeluaran dengan jumlah kecil
 * 10. Pemasukan donasi jumlah besar
 */

// Data untuk 10 test input
const testCases = [
    {
        name: '1. Pemasukan biasa dengan kategori Iuran Wajib',
        type: 'Pemasukan',
        donorName: 'Alumni Test 1',
        isDonation: false,
        isAnonymous: false,
        amount: '100000',
        description: 'Iuran wajib bulan Januari'
    },
    {
        name: '2. Pemasukan dengan target donasi',
        type: 'Pemasukan',
        donorName: 'Donatur Test 2',
        isDonation: true,
        isAnonymous: false,
        amount: '250000',
        description: 'Donasi untuk pembangunan'
    },
    {
        name: '3. Pemasukan sebagai anonim',
        type: 'Pemasukan',
        donorName: 'Hamba Allah',
        isDonation: false,
        isAnonymous: true,
        amount: '75000',
        description: 'Sumbangan anonim'
    },
    {
        name: '4. Pemasukan donasi dan anonim',
        type: 'Pemasukan',
        donorName: 'Hamba Allah',
        isDonation: true,
        isAnonymous: true,
        amount: '300000',
        description: 'Donasi anonim untuk kebaikan'
    },
    {
        name: '5. Pengeluaran biasa',
        type: 'Pengeluaran',
        itemName: 'Konsumsi Rapat',
        isDonation: false,
        isAnonymous: false,
        amount: '150000',
        description: 'Konsumsi rapat bulanan'
    },
    {
        name: '6. Pemasukan dengan jumlah besar',
        type: 'Pemasukan',
        donorName: 'Pengusaha Sukses',
        isDonation: false,
        isAnonymous: false,
        amount: '10000000',
        description: 'Sumbangan besar dari alumni pengusaha'
    },
    {
        name: '7. Pengeluaran dengan keterangan detail',
        type: 'Pengeluaran',
        itemName: 'Perlengkapan Acara',
        isDonation: false,
        isAnonymous: false,
        amount: '500000',
        description: 'Pembelian perlengkapan untuk acara reuni tahunan alumni angkatan 2020'
    },
    {
        name: '8. Pemasukan dengan kategori lain',
        type: 'Pemasukan',
        donorName: 'Alumni Dermawan',
        isDonation: false,
        isAnonymous: false,
        amount: '200000',
        description: 'Sumbangan sukarela',
        categoryIndex: 2
    },
    {
        name: '9. Pengeluaran dengan jumlah kecil',
        type: 'Pengeluaran',
        itemName: 'ATK',
        isDonation: false,
        isAnonymous: false,
        amount: '25000',
        description: 'Beli pulpen dan kertas'
    },
    {
        name: '10. Pemasukan donasi dengan jumlah besar',
        type: 'Pemasukan',
        donorName: 'Donatur Utama',
        isDonation: true,
        isAnonymous: false,
        amount: '5000000',
        description: 'Donasi besar untuk pembangunan fasilitas'
    }
];

test.describe('E2E Login dan Input 10 Transaksi dalam 1 Sesi', () => {

    test('Login sekali dan input 10 transaksi secara berurutan', async ({ page }) => {
        // Set timeout panjang untuk 10 transaksi
        test.setTimeout(300000); // 5 menit

        // Set viewport
        await page.setViewportSize({ width: 1920, height: 1080 });

        // ========== LOGIN SEKALI ==========
        console.log('📍 Login ke aplikasi...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });

        // Tunggu sampai halaman login siap
        await expect(page.locator('h1')).toContainText('Admin Portal', { timeout: 10000 });

        const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="username" i]').first();
        await expect(emailInput).toBeVisible({ timeout: 10000 });
        await emailInput.fill('sandre1');
        await page.locator('input[type="password"]').fill('sandre123');
        await page.locator('button[type="submit"]').click();

        await expect(page).toHaveURL('/', { timeout: 20000 });
        console.log('✅ Login berhasil!\n');

        // ========== NAVIGASI KE HALAMAN TRANSAKSI ==========
        console.log('📋 Navigasi ke halaman Transaksi...');
        try {
            const txLink = page.getByRole('link', { name: 'Transaksi', exact: true }).first();
            await expect(txLink).toBeVisible({ timeout: 5000 });
            await txLink.click();
        } catch (e) {
            await page.goto('http://localhost:5173/transactions');
        }

        await expect(page).toHaveURL(/\/transactions/, { timeout: 10000 });
        await expect(page.locator('h1', { hasText: 'Daftar Transaksi' })).toBeVisible({ timeout: 10000 });
        console.log('✅ Berhasil masuk halaman Transaksi!\n');

        // ========== LOOP 10 TRANSAKSI ==========
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            console.log(`\n🔄 [${i + 1}/10] ${tc.name}`);
            console.log('─'.repeat(50));

            // Klik tombol Tambah Baru
            const addBtn = page.getByRole('button', { name: 'Tambah Baru' });
            await expect(addBtn).toBeVisible({ timeout: 10000 });
            await addBtn.click();

            // Tunggu modal muncul
            const modalTitle = page.locator('h3', { hasText: 'Catat Transaksi Baru' });
            await expect(modalTitle).toBeVisible({ timeout: 10000 });
            console.log('   📝 Modal terbuka');

            // Pilih tipe transaksi
            const typeLabel = page.locator('label', { hasText: tc.type });
            await expect(typeLabel).toBeVisible({ timeout: 5000 });
            await typeLabel.click();
            await page.waitForTimeout(500);

            if (tc.type === 'Pemasukan') {
                // Input nama donor
                const donorInput = page.locator('input[placeholder*="alumni" i]');
                await expect(donorInput).toBeVisible({ timeout: 5000 });
                await donorInput.fill(tc.donorName || '');
                console.log(`   👤 Nama: ${tc.donorName}`);

                // Centang anonim jika perlu (lakukan sebelum donasi)
                if (tc.isAnonymous) {
                    const anonLabel = page.locator('label').filter({ hasText: /anonim/i }).first();
                    await expect(anonLabel).toBeVisible({ timeout: 5000 });
                    await anonLabel.click();
                    await page.waitForTimeout(300);
                    console.log('   🕶️ Anonim dicentang');
                }

                // Centang donasi jika perlu
                if (tc.isDonation) {
                    const donationLabel = page.locator('label', { hasText: 'Untuk Donasi' });
                    await expect(donationLabel).toBeVisible({ timeout: 5000 });
                    await donationLabel.click();
                    await page.waitForTimeout(500);
                    console.log('   🎯 Donasi dicentang');

                    // Pilih target donasi
                    const donationSelect = page.locator('select').filter({ hasText: 'Pilih Target Donasi' });
                    await expect(donationSelect).toBeVisible({ timeout: 5000 });
                    await donationSelect.selectOption({ index: 1 });
                    console.log('   🎯 Target donasi dipilih');
                } else {
                    // Pilih kategori
                    const categorySelect = page.locator('select').filter({ hasText: 'Pilih Kategori' });
                    await expect(categorySelect).toBeVisible({ timeout: 5000 });
                    const catIndex = tc.categoryIndex || 1;
                    await categorySelect.selectOption({ index: catIndex });
                    console.log('   📂 Kategori dipilih');
                }
            } else {
                // Pengeluaran
                const itemInput = page.locator('input').filter({ hasNot: page.locator('[type="number"]') }).filter({ hasNot: page.locator('[type="date"]') }).filter({ hasNot: page.locator('[type="password"]') }).filter({ hasNot: page.locator('[type="email"]') }).first();

                // Tunggu input nama barang muncul
                const expenseInput = page.locator('input[placeholder*="Barang" i], input[placeholder*="Keperluan" i], input[placeholder*="Contoh" i]').first();
                await expect(expenseInput).toBeVisible({ timeout: 5000 });
                await expenseInput.fill(tc.itemName || '');
                console.log(`   📦 Barang: ${tc.itemName}`);

                // Pilih kategori
                const categorySelect = page.locator('select').filter({ hasText: 'Pilih Kategori' });
                await expect(categorySelect).toBeVisible({ timeout: 5000 });
                await categorySelect.selectOption({ index: 1 });
                console.log('   📂 Kategori dipilih');
            }

            // Input jumlah
            const amountInput = page.locator('input[type="number"]');
            await expect(amountInput).toBeVisible({ timeout: 5000 });
            await amountInput.fill(tc.amount);
            console.log(`   💵 Jumlah: Rp ${parseInt(tc.amount).toLocaleString('id-ID')}`);

            // Input keterangan
            const descInput = page.locator('textarea');
            await expect(descInput).toBeVisible({ timeout: 5000 });
            await descInput.fill(tc.description);
            console.log(`   📝 Keterangan: ${tc.description}`);

            // Screenshot sebelum submit
            await page.screenshot({ path: `e2e/screenshots/e2e-tx-${String(i + 1).padStart(2, '0')}-before-submit.png` });
            console.log(`   📸 Screenshot: e2e-tx-${String(i + 1).padStart(2, '0')}-before-submit.png`);

            // Submit
            const saveBtn = page.getByRole('button', { name: 'Simpan Transaksi' });
            await expect(saveBtn).toBeEnabled({ timeout: 5000 });

            // Tunggu response API
            const responsePromise = page.waitForResponse(
                response => response.url().includes('/transactions') && response.request().method() === 'POST',
                { timeout: 15000 }
            ).catch(() => null);

            await saveBtn.click();

            const response = await responsePromise;
            if (response) {
                if (response.ok()) {
                    console.log(`   ✅ Berhasil! (Status: ${response.status()})`);
                } else {
                    console.log(`   ❌ Gagal! (Status: ${response.status()})`);
                    const text = await response.text().catch(() => 'No body');
                    console.log(`   Error: ${text}`);
                }
            }

            // Tunggu modal tertutup
            await expect(modalTitle).not.toBeVisible({ timeout: 15000 });

            // Tunggu sebentar sebelum transaksi berikutnya
            await page.waitForTimeout(500);
        }

        // ========== SUMMARY ==========
        console.log('\n');
        console.log('═'.repeat(50));
        console.log('✅ SEMUA 10 TRANSAKSI BERHASIL DIINPUT!');
        console.log('═'.repeat(50));
        console.log('📊 Ringkasan:');
        testCases.forEach((tc, i) => {
            console.log(`   ${i + 1}. ${tc.type}: Rp ${parseInt(tc.amount).toLocaleString('id-ID')} - ${tc.description.substring(0, 30)}...`);
        });
        console.log('═'.repeat(50));

        // Screenshot hasil akhir
        await page.screenshot({ path: 'e2e/screenshots/e2e-10-transactions-complete.png' });
    });
});
