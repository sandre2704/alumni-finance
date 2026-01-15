
import { db } from './src/db';
import { donationTargets, transactions, categories } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { transactionService } from './src/services/transaction.service';

async function verifyDonationLogic() {
    console.log('Starting verification...');

    // 1. Get a donation target
    const target = await db.query.donationTargets.findFirst({
        where: eq(donationTargets.isActive, true)
    });

    if (!target) {
        console.error('No active donation target found. Please create one first.');
        process.exit(1);
    }

    console.log(`Found Target: ${target.name}`);
    console.log(`Initial Amount: ${target.currentAmount}`);

    // 2. Create a donation transaction
    const amount = 100000;
    console.log(`Injecting donation transaction of Rp ${amount}...`);

    try {
        const transaction = await transactionService.create({
            type: 'income',
            amount: amount,
            transactionDate: new Date().toISOString().split('T')[0],
            description: 'Inject Test Donation 3',
            donorName: 'Script Tester 3',
            donationTargetId: target.id,
            // categoryId is optional now, leaving it undefined/null
        });

        console.log('Transaction created:', transaction.id);
        console.log('Transaction Category ID:', transaction.categoryId);

        // Verify Category Name
        const cat = await db.query.categories.findFirst({
            where: eq(categories.id, transaction.categoryId!)
        });
        console.log(`Transaction Category Name: ${cat?.name}`);
        if (cat?.name === 'Donasi') {
            console.log('✅ SUCCESS: Transaction correctly categorized as "Donasi"');
        } else {
            console.error(`❌ FAILED: Transaction category is "${cat?.name}", expected "Donasi"`);
        }

        // 3. Verify update
        const updatedTarget = await db.query.donationTargets.findFirst({
            where: eq(donationTargets.id, target.id)
        });

        if (!updatedTarget) return;

        console.log(`Updated Amount: ${updatedTarget.currentAmount}`);

        const expected = parseFloat(target.currentAmount) + amount;
        const actual = parseFloat(updatedTarget.currentAmount);

        if (actual === expected) {
            console.log('✅ SUCCESS: Donation target amount updated correctly.');
        } else {
            console.error(`❌ FAILED: Amount mismatch. Expected ${expected}, got ${actual}`);
        }

    } catch (error) {
        console.error('Error creating transaction:', error);
    }

    process.exit(0);
}

verifyDonationLogic();
