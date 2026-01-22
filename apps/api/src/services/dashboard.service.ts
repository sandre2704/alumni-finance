import { db } from '../db/index.js';
import { transactions, categories, donationTargets } from '../db/schema/index.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

class DashboardService {
    async getStats(month?: number, year?: number) {
        const now = new Date();
        // Use provided year/month or default to current.
        // Note: month argument is expected to be 1-12 (human readable from frontend usually), 
        // but JS Date uses 0-11. Let's assume input is 1-12.

        const targetYear = year || now.getFullYear();
        // If month is provided, use it (subtract 1 for JS Date). If not, use current month.
        const targetMonthIndex = month ? month - 1 : now.getMonth();

        const startOfMonth = new Date(targetYear, targetMonthIndex, 1);
        const endOfMonth = new Date(targetYear, targetMonthIndex + 1, 0);

        // Get total balance (all time income - expense)
        // Total balance should arguably be "up to end of selected month" if looking at history?
        // Or "Current Total Balance" regardless of filter?
        // Usually "Total Balance" is "Current Money in Bank". 
        // "Monthly Income/Expense" is specific to the period.
        // Let's keep Total Balance as GLOBAL current balance for now, unless requested otherwise.
        // But if I look at "Dec 2025", seeing valid balance "as of Dec 2025" is more advanced. 
        // For simple dashboard, usually "Total Balance" is real-time. 
        // Let's stick to real-time for Total Balance, and filtered for Monthly stats.

        const [incomeTotal] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(eq(transactions.type, 'income'));

        const [expenseTotal] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(eq(transactions.type, 'expense'));

        // Current Month Data
        const [monthlyIncome] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'income'),
                gte(transactions.transactionDate, formatDate(startOfMonth)),
                lte(transactions.transactionDate, formatDate(endOfMonth))
            ));

        const [monthlyExpense] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'expense'),
                gte(transactions.transactionDate, formatDate(startOfMonth)),
                lte(transactions.transactionDate, formatDate(endOfMonth))
            ));

        // Previous Month Data
        const startOfPrevMonth = new Date(targetYear, targetMonthIndex - 1, 1);
        const endOfPrevMonth = new Date(targetYear, targetMonthIndex, 0);

        const [prevMonthlyIncome] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'income'),
                gte(transactions.transactionDate, formatDate(startOfPrevMonth)),
                lte(transactions.transactionDate, formatDate(endOfPrevMonth))
            ));

        const [prevMonthlyExpense] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'expense'),
                gte(transactions.transactionDate, formatDate(startOfPrevMonth)),
                lte(transactions.transactionDate, formatDate(endOfPrevMonth))
            ));

        const totalBalance = parseFloat(incomeTotal?.total || '0') - parseFloat(expenseTotal?.total || '0');
        const currentMonthIncomeVal = parseFloat(monthlyIncome?.total || '0');
        const currentMonthExpenseVal = parseFloat(monthlyExpense?.total || '0');
        const prevMonthIncomeVal = parseFloat(prevMonthlyIncome?.total || '0');
        const prevMonthExpenseVal = parseFloat(prevMonthlyExpense?.total || '0');

        // Calculate Trends
        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const monthlyIncomeTrend = calculateTrend(currentMonthIncomeVal, prevMonthIncomeVal);
        const monthlyExpenseTrend = calculateTrend(currentMonthExpenseVal, prevMonthExpenseVal);

        // Balance Trend: Comparing Current Balance vs Balance at end of last month
        const netIncomeThisMonth = currentMonthIncomeVal - currentMonthExpenseVal;
        const balanceLastMonth = totalBalance - netIncomeThisMonth;
        const totalBalanceTrend = calculateTrend(totalBalance, balanceLastMonth);

        return {
            totalBalance,
            monthlyIncome: currentMonthIncomeVal,
            monthlyExpense: currentMonthExpenseVal,
            totalBalanceTrend,
            monthlyIncomeTrend,
            monthlyExpenseTrend,
            period: {
                month: targetMonthIndex + 1,
                year: targetYear
            }
        };
    }

    async getCashflow(months: number = 6) {
        const data = [];
        const now = new Date();

        // 1. Get Current Total Balance (Global)
        const [incomeTotal] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(eq(transactions.type, 'income'));

        const [expenseTotal] = await db.select({
            total: sql<string>`COALESCE(SUM(amount), 0)`,
        })
            .from(transactions)
            .where(eq(transactions.type, 'expense'));

        let currentRunningBalance = parseFloat(incomeTotal?.total || '0') - parseFloat(expenseTotal?.total || '0');


        // 2. Generate Chronological Data (Oldest -> Newest)
        // Note: the loop runs Oldest (i=months-1) to Newest (i=0).
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const [income] = await db.select({
                total: sql<string>`COALESCE(SUM(amount), 0)`,
            })
                .from(transactions)
                .where(and(
                    eq(transactions.type, 'income'),
                    gte(transactions.transactionDate, formatDate(startOfMonth)),
                    lte(transactions.transactionDate, formatDate(endOfMonth))
                ));

            const [expense] = await db.select({
                total: sql<string>`COALESCE(SUM(amount), 0)`,
            })
                .from(transactions)
                .where(and(
                    eq(transactions.type, 'expense'),
                    gte(transactions.transactionDate, formatDate(startOfMonth)),
                    lte(transactions.transactionDate, formatDate(endOfMonth))
                ));

            data.push({
                month: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][date.getMonth()],
                year: date.getFullYear(),
                income: parseFloat(income?.total || '0'),
                expense: parseFloat(expense?.total || '0'),
                net: parseFloat(income?.total || '0') - parseFloat(expense?.total || '0'),
                balance: 0 // Placeholder, will calculate below
            });
        }

        // 3. Assign Balances working Backwards
        // The last item in 'data' corresponds to the Current Month (i=0).
        // Its balance should be 'currentRunningBalance'.
        // Previous month balance = Current Balance - Current Net.

        // We iterate backwards from the end of the array
        for (let i = data.length - 1; i >= 0; i--) {
            data[i].balance = currentRunningBalance;
            // Subtract this month's net to get the starting balance (which is roughly prev month's ending balance)
            currentRunningBalance -= data[i].net;
        }

        return data;
    }

    async getExpenseBreakdown(startDate?: string, endDate?: string) {
        // Default to current month if no dates provided
        let start = startDate;
        let end = endDate;

        if (!startDate || !endDate) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            start = formatDate(startOfMonth);
            end = formatDate(endOfMonth);
        }

        const result = await db.select({
            categoryId: transactions.categoryId,
            categoryName: categories.name,
            total: sql<string>`SUM(${transactions.amount})`,
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(and(
                eq(transactions.type, 'expense'),
                gte(transactions.transactionDate, start!),
                lte(transactions.transactionDate, end!)
            ))
            .groupBy(transactions.categoryId, categories.name);

        const totalExpense = result.reduce((acc, row) => acc + parseFloat(row.total || '0'), 0);

        return result.map(row => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            total: parseFloat(row.total || '0'),
            percentage: totalExpense > 0 ? Math.round((parseFloat(row.total || '0') / totalExpense) * 100) : 0,
        }));
    }

    async getIncomeBreakdown(startDate?: string, endDate?: string) {
        // Default to current month if no dates provided
        let start = startDate;
        let end = endDate;

        if (!startDate || !endDate) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            start = formatDate(startOfMonth);
            end = formatDate(endOfMonth);
        }

        const result = await db.select({
            categoryId: transactions.categoryId,
            categoryName: categories.name,
            total: sql<string>`SUM(${transactions.amount})`,
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(and(
                eq(transactions.type, 'income'),
                gte(transactions.transactionDate, start!),
                lte(transactions.transactionDate, end!)
            ))
            .groupBy(transactions.categoryId, categories.name);

        const totalIncome = result.reduce((acc, row) => acc + parseFloat(row.total || '0'), 0);

        return result.map(row => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            total: parseFloat(row.total || '0'),
            percentage: totalIncome > 0 ? Math.round((parseFloat(row.total || '0') / totalIncome) * 100) : 0,
        }));
    }

    async getRecentTransactions(limit: number = 5) {
        return db.select({
            transaction: transactions,
            category: categories,
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
            .limit(limit);
    }

    async getDonationProgress() {
        const activeTarget = await db.query.donationTargets.findFirst({
            where: eq(donationTargets.isActive, true),
        });

        if (!activeTarget) {
            return null;
        }

        const percentage = Math.round(
            (parseFloat(activeTarget.currentAmount) / parseFloat(activeTarget.targetAmount)) * 100
        );

        return {
            ...activeTarget,
            percentage,
        };
    }

    async getBudgetStatus() {
        const now = new Date();
        const startOfMonth = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const endOfMonth = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        // 1. Get all expense categories with a set budget (> 0)
        // Note: Drizzle decimal is string. We check if not '0' and not null.
        // Assuming budget is set on 'categories' table which we added recently.

        // Since we can't easily filter by > 0 on string decimal in simple query without raw sql casting, 
        // we can fetch all expenses and filter in code, or use raw sql.
        // Let's fetch all categories where type is 'expense' and monthlyBudget is distinct from '0' or null.
        const budgetedCategories = await db.query.categories.findMany({
            where: and(
                eq(categories.type, 'expense'),
                sql`${categories.monthlyBudget} > 0`
            )
        });

        const stats = [];

        for (const cat of budgetedCategories) {
            const budget = parseFloat(cat.monthlyBudget || '0');

            // 2. Sum expenses for this category in current month
            const [expense] = await db.select({
                total: sql<string>`COALESCE(SUM(amount), 0)`,
            })
                .from(transactions)
                .where(and(
                    eq(transactions.categoryId, cat.id),
                    eq(transactions.type, 'expense'),
                    gte(transactions.transactionDate, startOfMonth),
                    lte(transactions.transactionDate, endOfMonth)
                ));

            const actual = parseFloat(expense?.total || '0');
            const percentage = budget > 0 ? Math.round((actual / budget) * 100) : 0;

            stats.push({
                id: cat.id,
                category: cat.name,
                budget,
                actual,
                percentage
            });
        }

        // Sort by highest percentage usage
        return stats.sort((a, b) => b.percentage - a.percentage);
    }
}

export const dashboardService = new DashboardService();
