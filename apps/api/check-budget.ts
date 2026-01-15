
import { db } from './src/db/index.js';
import { categories } from './src/db/schema/index.js';
import { sql, eq } from 'drizzle-orm';

async function checkBudgets() {
    console.log('Checking categories with budgets...');

    const allCategories = await db.select().from(categories);
    console.log(`Total categories: ${allCategories.length}`);

    const budgeted = allCategories.filter(c => c.monthlyBudget && parseFloat(c.monthlyBudget) > 0);
    console.log('Categories with budget > 0 (JS filter):');
    console.table(budgeted.map(c => ({ name: c.name, budget: c.monthlyBudget })));

    // Test the SQL query used in service
    const sqlBudgeted = await db.query.categories.findMany({
        where: sql`${categories.monthlyBudget} > 0`
    });
    console.log('Categories found via SQL query:');
    console.table(sqlBudgeted.map(c => ({ name: c.name, budget: c.monthlyBudget })));

    process.exit(0);
}

checkBudgets();
