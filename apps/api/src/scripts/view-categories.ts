import { db } from '../db/index.js';
import { categories } from '../db/schema/categories.js';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Fetching income categories...');
    const result = await db.select().from(categories).where(eq(categories.type, 'income'));

    console.table(result.map(c => ({ id: c.id, name: c.name, type: c.type })));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
