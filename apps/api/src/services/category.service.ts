import { db } from '../db/index.js';
import { categories } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';
import { nanoid } from 'nanoid';

class CategoryService {
    async getAll(type?: 'income' | 'expense') {
        if (type) {
            return db.query.categories.findMany({
                where: eq(categories.type, type),
            });
        }
        return db.query.categories.findMany();
    }

    async getById(id: string) {
        const category = await db.query.categories.findFirst({
            where: eq(categories.id, id),
        });

        if (!category) {
            throw new AppError(404, 'Category not found');
        }

        return category;
    }
    async create(data: { name: string; type: 'income' | 'expense'; monthlyBudget?: string }) {
        const slug = data.name
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');

        const [category] = await db
            .insert(categories)
            .values({
                id: nanoid(),
                name: data.name,
                type: data.type,
                slug,
                monthlyBudget: data.monthlyBudget, // Drizzle handles decimal mapping
            })
            .returning();

        return category;
    }

    async update(id: string, data: { name?: string; type?: 'income' | 'expense'; monthlyBudget?: string }) {
        if (!id) throw new AppError(400, "Category ID is required");

        // 1. Check if category exists
        const existingCategory = await db.query.categories.findFirst({
            where: eq(categories.id, id),
        });

        if (!existingCategory) {
            throw new AppError(404, 'Category not found');
        }

        const updateData: any = { ...data };

        if (data.name) {
            updateData.slug = data.name
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
        }

        // 2. Perform update
        const [category] = await db
            .update(categories)
            .set(updateData)
            .where(eq(categories.id, id))
            .returning();

        return category || existingCategory;
    }

    async delete(id: string) {
        const [category] = await db
            .delete(categories)
            .where(eq(categories.id, id))
            .returning();

        if (!category) {
            throw new AppError(404, 'Category not found');
        }

        return category;
    }
}

export const categoryService = new CategoryService();
