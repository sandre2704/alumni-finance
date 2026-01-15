import { db } from '../db/index.js';
import { feedbacks } from '../db/schema/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';

class FeedbackService {
    async create(data: {
        name?: string;
        email?: string;
        phone?: string;
        isAnonymous: boolean;
        message: string;
        category: 'kategori_baru' | 'fitur' | 'kritik' | 'lainnya';
    }) {
        const [feedback] = await db
            .insert(feedbacks)
            .values({
                name: data.isAnonymous ? 'Anonim' : data.name,
                email: data.isAnonymous ? null : data.email,
                phone: data.isAnonymous ? null : data.phone,
                isAnonymous: data.isAnonymous,
                message: data.message,
                category: data.category,
                status: 'pending',
                isRead: false,
            })
            .returning();

        return feedback;
    }

    async getAll(status?: 'pending' | 'approved' | 'rejected') {
        if (status) {
            return db.query.feedbacks.findMany({
                where: eq(feedbacks.status, status),
                orderBy: [desc(feedbacks.createdAt)],
            });
        }
        return db.query.feedbacks.findMany({
            orderBy: [desc(feedbacks.createdAt)],
        });
    }

    async getById(id: string) {
        const feedback = await db.query.feedbacks.findFirst({
            where: eq(feedbacks.id, id),
        });

        if (!feedback) {
            throw new AppError(404, 'Feedback not found');
        }

        return feedback;
    }

    async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
        const [feedback] = await db
            .update(feedbacks)
            .set({
                status,
                isRead: true, // Auto mark as read when status changes
                updatedAt: new Date(),
            })
            .where(eq(feedbacks.id, id))
            .returning();

        if (!feedback) {
            throw new AppError(404, 'Feedback not found');
        }

        return feedback;
    }

    async markAsRead(id: string) {
        const [feedback] = await db
            .update(feedbacks)
            .set({
                isRead: true,
                updatedAt: new Date(),
            })
            .where(eq(feedbacks.id, id))
            .returning();

        if (!feedback) {
            throw new AppError(404, 'Feedback not found');
        }

        return feedback;
    }

    async getUnreadCount() {
        // Since we can't easily do count queries with query builder in simple way without raw sql sometimes, 
        // fetching potential large list might be bad, but for this scale it's fine.
        // Or we can use db.select({ count: count() })...
        // For simplicity and consistency with other services, let's just findMany and length for now, or use count if easy.

        // Let's stick to simple array length for now to avoid complexity, assuming feedback volume is manageable.
        const unreadFeedbacks = await db.query.feedbacks.findMany({
            where: and(eq(feedbacks.isRead, false), eq(feedbacks.status, 'pending')),
        });

        return unreadFeedbacks.length;
    }
}

export const feedbackService = new FeedbackService();
