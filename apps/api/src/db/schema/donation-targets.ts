import { pgTable, varchar, text, timestamp, decimal, boolean, date } from 'drizzle-orm/pg-core';

export const donationTargets = pgTable('donation_targets', {
    id: text('id').primaryKey(), // Changed from uuid to text
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    targetAmount: decimal('target_amount', { precision: 15, scale: 2 }).notNull(),
    currentAmount: decimal('current_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    startDate: date('start_date'),
    endDate: date('end_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DonationTarget = typeof donationTargets.$inferSelect;
export type NewDonationTarget = typeof donationTargets.$inferInsert;
