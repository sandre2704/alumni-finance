import { pgTable, uuid, varchar, text, timestamp, decimal, boolean, date, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth.js';
import { categories } from './categories.js';
import { donationTargets } from './donation-targets.js';

export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
export const transactionStatusEnum = pgEnum('transaction_status', ['paid', 'processing']);

export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: transactionTypeEnum('type').notNull(),
    categoryId: text('category_id').references(() => categories.id),
    donationTargetId: text('donation_target_id').references(() => donationTargets.id),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    description: text('description'),
    donorName: varchar('donor_name', { length: 255 }),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
    status: transactionStatusEnum('status').default('paid').notNull(),
    receiptUrl: text('receipt_url'),
    createdBy: text('created_by').references(() => user.id),
    transactionDate: date('transaction_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
