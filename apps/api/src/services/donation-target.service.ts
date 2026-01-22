import { db } from '../db/index.js';
import { donationTargets, transactions } from '../db/schema/index.js';
import { eq, desc, and, or, ilike, sql, SQL } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';
import { nanoid } from 'nanoid';

interface CreateDonationTargetData {
    name: string;
    description?: string;
    targetAmount: number;
    startDate?: string;
    endDate?: string;
}

interface UpdateDonationTargetData extends Partial<CreateDonationTargetData> {
    isActive?: boolean;
    currentAmount?: number;
}

class DonationTargetService {
    async getAll() {
        return db.query.donationTargets.findMany({
            orderBy: [desc(donationTargets.createdAt)],
        });
    }

    async getActive() {
        return db.query.donationTargets.findFirst({
            where: eq(donationTargets.isActive, true),
        });
    }

    async getById(id: string) {
        const target = await db.query.donationTargets.findFirst({
            where: eq(donationTargets.id, id),
        });

        if (!target) {
            throw new AppError(404, 'Donation target not found');
        }

        return target;
    }

    async create(data: CreateDonationTargetData) {
        // Deactivate other targets if this one will be active
        await db.update(donationTargets)
            .set({ isActive: false })
            .where(eq(donationTargets.isActive, true));

        const [target] = await db.insert(donationTargets).values({
            id: nanoid(),
            name: data.name,
            description: data.description,
            targetAmount: data.targetAmount.toString(),
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: true,
        }).returning();

        return target;
    }

    async update(id: string, data: UpdateDonationTargetData) {
        await this.getById(id); // Check exists

        const updateData: Record<string, any> = {
            updatedAt: new Date(),
        };

        if (data.name) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.targetAmount) updateData.targetAmount = data.targetAmount.toString();
        if (data.currentAmount !== undefined) updateData.currentAmount = data.currentAmount.toString();
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.startDate !== undefined) updateData.startDate = data.startDate;
        if (data.endDate !== undefined) updateData.endDate = data.endDate;

        // If activating this target, deactivate others
        if (data.isActive === true) {
            await db.update(donationTargets)
                .set({ isActive: false })
                .where(eq(donationTargets.isActive, true));
        }

        const [updated] = await db.update(donationTargets)
            .set(updateData)
            .where(eq(donationTargets.id, id))
            .returning();

        return updated;
    }

    async delete(id: string) {
        await this.getById(id); // Check exists
        await db.delete(donationTargets).where(eq(donationTargets.id, id));
    }
    async getDonors(id: string, query: any) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const { search, sortOrder = 'date-desc' } = query;
        const offset = (page - 1) * limit;

        const conditions: SQL<unknown>[] = [
            eq(transactions.donationTargetId, id),
            eq(transactions.type, 'income')
        ];

        if (search) {
            conditions.push(
                or(
                    ilike(transactions.donorName, `%${search}%`),
                    ilike(transactions.description, `%${search}%`)
                ) as SQL<unknown>
            );
        }

        let orderBy = desc(transactions.transactionDate);
        switch (sortOrder) {
            case 'date-asc':
                // frontend valid options: date-desc, date-asc. 
                // Let's stick to standard SQL. date-asc = asc(date).
                orderBy = sql`${transactions.transactionDate} ASC`;
                break;
            case 'amount-desc':
                orderBy = desc(transactions.amount);
                break;
            case 'amount-asc':
                orderBy = sql`${transactions.amount} ASC`;
                break;
            case 'date-desc':
            default:
                orderBy = desc(transactions.transactionDate);
        }

        const [donors, countResult] = await Promise.all([
            db.select({
                id: transactions.id,
                transactionDate: transactions.transactionDate,
                donorName: transactions.donorName,
                isAnonymous: transactions.isAnonymous,
                amount: transactions.amount,
                description: transactions.description,
            })
                .from(transactions)
                .where(and(...conditions))
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset),
            db.select({ count: sql<number>`count(*)` })
                .from(transactions)
                .where(and(...conditions)),
        ]);

        const total = Number(countResult[0]?.count || 0);

        // Get aggregate stats
        const [stats] = await db.select({
            totalCollected: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
            donorCount: sql<number>`count(*)`
        })
            .from(transactions)
            .where(and(
                eq(transactions.donationTargetId, id),
                eq(transactions.type, 'income')
            ));

        return {
            data: donors,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalCollected: parseFloat(stats?.totalCollected || '0'),
                donorCount: Number(stats?.donorCount || 0)
            }
        };
    }
}


export const donationTargetService = new DonationTargetService();
