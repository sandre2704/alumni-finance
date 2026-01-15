import { pgTable, text, varchar, timestamp, pgEnum, decimal } from 'drizzle-orm/pg-core';

export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense']);

export const categories = pgTable('categories', {
    id: text('id').primaryKey(), // Changed from uuid to text to support NanoID/Cuid
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    type: categoryTypeEnum('type').notNull(),
    monthlyBudget: decimal('monthly_budget', { precision: 15, scale: 2 }).default('0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
