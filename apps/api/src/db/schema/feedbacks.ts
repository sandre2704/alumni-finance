import { pgTable, text, varchar, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import crypto from 'crypto';

export const feedbackCategoryEnum = pgEnum('feedback_category', ['kategori_baru', 'fitur', 'kritik', 'lainnya']);
export const feedbackStatusEnum = pgEnum('feedback_status', ['pending', 'approved', 'rejected']);

export const feedbacks = pgTable('feedbacks', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 100 }), // Nullable because it can be anonymous
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
    message: text('message').notNull(),
    category: feedbackCategoryEnum('category').notNull(),
    status: feedbackStatusEnum('status').default('pending').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;
