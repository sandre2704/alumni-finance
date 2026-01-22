import { db } from '../db/index.js';
import { transactions, categories, donationTargets } from '../db/schema/index.js';
import { eq, and, gte, lte, ilike, or, desc, sql } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';

interface TransactionQuery {
    type?: 'income' | 'expense';
    categoryId?: string;
    status?: 'paid' | 'processing';
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
}

interface CreateTransactionData {
    type: 'income' | 'expense';
    categoryId?: string | null;
    donationTargetId?: string | null;
    amount: number;
    description?: string;
    donorName?: string;
    isAnonymous?: boolean;
    status?: 'paid' | 'processing';
    transactionDate: string;
    receiptUrl?: string;
}

class TransactionService {
    async getAll(query: TransactionQuery) {
        const { type, categoryId, status, startDate, endDate, search, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (type) {
            conditions.push(eq(transactions.type, type));
        }
        if (categoryId) {
            conditions.push(eq(transactions.categoryId, categoryId));
        }
        if (status) {
            conditions.push(eq(transactions.status, status));
        }
        if (startDate) {
            conditions.push(gte(transactions.transactionDate, startDate));
        }
        if (endDate) {
            conditions.push(lte(transactions.transactionDate, endDate));
        }
        if (search) {
            conditions.push(
                or(
                    ilike(transactions.description, `%${search}%`),
                    ilike(transactions.donorName, `%${search}%`)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [transactionList, countResult] = await Promise.all([
            db.select({
                transaction: transactions,
                category: categories,
            })
                .from(transactions)
                .leftJoin(categories, eq(transactions.categoryId, categories.id))
                .where(whereClause)
                .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
                .limit(limit)
                .offset(offset),
            db.select({ count: sql<number>`count(*)` })
                .from(transactions)
                .where(whereClause),
        ]);

        const total = Number(countResult[0]?.count || 0);

        return {
            transactions: transactionList.map(row => ({
                ...row.transaction,
                category: row.category,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getById(id: string) {
        const result = await db.select({
            transaction: transactions,
            category: categories,
        })
            .from(transactions)
            .leftJoin(categories, eq(transactions.categoryId, categories.id))
            .where(eq(transactions.id, id))
            .limit(1);

        if (result.length === 0) {
            throw new AppError(404, 'Transaction not found');
        }

        return {
            ...result[0].transaction,
            category: result[0].category,
        };
    }

    async create(data: CreateTransactionData, userId?: string) {
        // Sanitize inputs
        let categoryId = data.categoryId && data.categoryId !== '' ? data.categoryId : null;
        const donationTargetId = data.donationTargetId && data.donationTargetId !== '' ? data.donationTargetId : null;

        // If donation transaction, ensure category is 'Donasi'
        if (donationTargetId && data.type === 'income') {
            // Find or create 'Donasi' category
            const donasiCategory = await db.query.categories.findFirst({
                where: and(
                    eq(categories.name, 'Donasi'),
                    eq(categories.type, 'income')
                )
            });

            if (donasiCategory) {
                categoryId = donasiCategory.id;
            } else {
                // Create Donasi category if not exists
                // Note: categories.id is text without auto-generation, so we need to provide one
                const newId = crypto.randomUUID();
                const [newCat] = await db.insert(categories).values({
                    id: newId,
                    name: 'Donasi',
                    slug: 'donasi',
                    type: 'income',
                }).returning();
                categoryId = newCat.id;
            }
        }

        const [transaction] = await db.insert(transactions).values({
            type: data.type,
            categoryId: categoryId,
            donationTargetId: donationTargetId,
            amount: data.amount.toString(),
            description: data.description,
            donorName: data.donorName,
            isAnonymous: data.isAnonymous || false,
            status: data.status || 'paid',
            transactionDate: data.transactionDate,
            receiptUrl: data.receiptUrl,
            createdBy: userId,
        }).returning();

        // If this transaction is linked to a donation target, update currentAmount
        if (donationTargetId && data.type === 'income') {
            const target = await db.query.donationTargets.findFirst({
                where: eq(donationTargets.id, donationTargetId),
            });

            if (target) {
                const newCurrentAmount = parseFloat(target.currentAmount) + data.amount;
                await db.update(donationTargets)
                    .set({
                        currentAmount: newCurrentAmount.toString(),
                        updatedAt: new Date(),
                    })
                    .where(eq(donationTargets.id, donationTargetId));
            }
        }

        return transaction;
    }

    async update(id: string, data: Partial<CreateTransactionData>) {
        const existing = await this.getById(id);

        // Handle Donation Target Updates
        const oldTargetId = existing.donationTargetId;
        const newTargetId = data.donationTargetId !== undefined ? data.donationTargetId : oldTargetId;
        const oldAmount = parseFloat(existing.amount);
        const newAmount = data.amount !== undefined ? data.amount : oldAmount;
        const oldType = existing.type;
        const newType = data.type || oldType;

        // If transaction was income and linked to a donation target, we might need to adjust
        if (oldType === 'income' && oldTargetId) {
            // Subtract old amount from old target
            const target = await db.query.donationTargets.findFirst({
                where: eq(donationTargets.id, oldTargetId),
            });
            if (target) {
                const updatedAmount = parseFloat(target.currentAmount) - oldAmount;
                await db.update(donationTargets)
                    .set({ currentAmount: updatedAmount.toString(), updatedAt: new Date() })
                    .where(eq(donationTargets.id, oldTargetId));
            }
        }

        // Apply updates to transaction
        const updateData: Record<string, any> = {
            updatedAt: new Date(),
        };

        if (data.type) updateData.type = data.type;
        if (data.categoryId) updateData.categoryId = data.categoryId;
        if (data.donationTargetId !== undefined) updateData.donationTargetId = data.donationTargetId;
        if (data.amount) updateData.amount = data.amount.toString();
        if (data.description !== undefined) updateData.description = data.description;
        if (data.donorName !== undefined) updateData.donorName = data.donorName;
        if (data.isAnonymous !== undefined) updateData.isAnonymous = data.isAnonymous;
        if (data.status) updateData.status = data.status;
        if (data.transactionDate) updateData.transactionDate = data.transactionDate;
        if (data.receiptUrl) updateData.receiptUrl = data.receiptUrl;

        const [updated] = await db.update(transactions)
            .set(updateData)
            .where(eq(transactions.id, id))
            .returning();

        // Add new amount to new target (if applicable)
        if (newType === 'income' && newTargetId) {
            const target = await db.query.donationTargets.findFirst({
                where: eq(donationTargets.id, newTargetId),
            });
            if (target) {
                const updatedAmount = parseFloat(target.currentAmount) + newAmount;
                await db.update(donationTargets)
                    .set({ currentAmount: updatedAmount.toString(), updatedAt: new Date() })
                    .where(eq(donationTargets.id, newTargetId));
            }
        }

        return updated;
    }

    async delete(id: string) {
        const existing = await this.getById(id);

        // If it was a donation income, subtract from target
        if (existing.type === 'income' && existing.donationTargetId) {
            const target = await db.query.donationTargets.findFirst({
                where: eq(donationTargets.id, existing.donationTargetId),
            });

            if (target) {
                const currentAmount = parseFloat(target.currentAmount);
                const deduction = parseFloat(existing.amount);
                // Prevent negative amount just in case, though logically it should be fine
                const newAmount = Math.max(0, currentAmount - deduction);

                await db.update(donationTargets)
                    .set({ currentAmount: newAmount.toString(), updatedAt: new Date() })
                    .where(eq(donationTargets.id, existing.donationTargetId));
            }
        }

        await db.delete(transactions).where(eq(transactions.id, id));
    }

    async updateReceipt(id: string, receiptUrl: string) {
        await this.getById(id); // Check exists

        const [updated] = await db.update(transactions)
            .set({ receiptUrl, updatedAt: new Date() })
            .where(eq(transactions.id, id))
            .returning();

        return updated;
    }
}

export const transactionService = new TransactionService();
