
import { db } from './src/db';
import { categories } from './src/db/schema';
import { eq, ilike } from 'drizzle-orm';

async function checkDonationCategory() {
    console.log('Checking for Donasi category...');

    const category = await db.query.categories.findFirst({
        where: ilike(categories.name, 'Donasi')
    });

    if (category) {
        console.log(`✅ Found 'Donasi' category: ${category.id}`);
    } else {
        console.log("❌ 'Donasi' category NOT FOUND.");

        // Optional: Create it?
        console.log("Creating 'Donasi' category...");
        const [newCat] = await db.insert(categories).values({
            name: 'Donasi',
            slug: 'donasi',
            type: 'income'
        }).returning();
        console.log(`✅ Created 'Donasi' category: ${newCat.id}`);
    }

    process.exit(0);
}

checkDonationCategory();
