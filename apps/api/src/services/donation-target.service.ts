import { db } from '../db/index.js';
import { donationTargets } from '../db/schema/index.js';
import { eq, desc } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';

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
}

export const donationTargetService = new DonationTargetService();
