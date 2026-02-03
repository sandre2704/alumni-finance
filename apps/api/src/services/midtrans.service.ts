import midtransClient from 'midtrans-client';
import { db } from '../db/index.js';
import { transactions } from '../db/schema/transactions.js';
import { donationTargets } from '../db/schema/donation-targets.js';
import { categories } from '../db/schema/categories.js';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Types
export interface CreateDonationParams {
    donorName: string;
    donorEmail: string;
    amount: number;
    donationTargetId?: string | null;
    categoryId?: string | null;
    message?: string;
    isAnonymous?: boolean;
}

export interface MidtransNotification {
    transaction_status: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    signature_key: string;
    fraud_status?: string;
}

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// Initialize Core API for notification handling
const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export const MidtransService = {
    /**
     * Create a new donation transaction and get Snap token
     */
    async createDonation(params: CreateDonationParams) {
        const { donorName, donorEmail, amount, donationTargetId, categoryId: paramCategoryId, message, isAnonymous } = params;

        // Generate unique order ID
        const orderId = `DON-${Date.now()}-${nanoid(6)}`;

        // Determine Category ID and Item Name logic
        let finalCategoryId = paramCategoryId;
        let targetName = 'Donasi Umum';

        if (donationTargetId) {
            // Priority 1: Donation Target
            const target = await db
                .select({ name: donationTargets.name })
                .from(donationTargets)
                .where(eq(donationTargets.id, donationTargetId))
                .limit(1);

            if (target.length > 0) {
                targetName = target[0].name;
            }

            // If category not provided, use default 'Sumbangan'
            if (!finalCategoryId) {
                const defaultCategory = await db
                    .select({ id: categories.id })
                    .from(categories)
                    .where(eq(categories.name, 'Sumbangan'))
                    .limit(1);
                if (defaultCategory.length > 0) finalCategoryId = defaultCategory[0].id;
            }
        } else if (finalCategoryId) {
            // Priority 2: Category selected explicitly
            const cat = await db
                .select({ name: categories.name })
                .from(categories)
                .where(eq(categories.id, finalCategoryId))
                .limit(1);

            if (cat.length > 0) {
                targetName = cat[0].name;
            }
        } else {
            // Priority 3: No target, No category -> Default 'Sumbangan'
            const defaultCategory = await db
                .select({ id: categories.id, name: categories.name })
                .from(categories)
                .where(eq(categories.name, 'Sumbangan'))
                .limit(1);

            if (defaultCategory.length > 0) {
                finalCategoryId = defaultCategory[0].id;
                // targetName remains 'Donasi Umum' or could be 'Sumbangan'
            }
        }

        // Create transaction in database with pending status
        const [newTransaction] = await db
            .insert(transactions)
            .values({
                type: 'income',
                categoryId: finalCategoryId,
                donationTargetId: donationTargetId || null,
                amount: amount.toString(),
                description: message || `Donasi untuk ${targetName}`,
                donorName: isAnonymous ? 'Anonim' : donorName,
                isAnonymous: isAnonymous || false,
                status: 'processing', // pending payment
                transactionDate: new Date().toISOString().split('T')[0],
            })
            .returning();

        // Create Midtrans transaction parameter
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            item_details: [
                {
                    id: donationTargetId || 'general-donation',
                    price: amount,
                    quantity: 1,
                    name: targetName.substring(0, 50), // Midtrans limit 50 chars
                },
            ],
            customer_details: {
                first_name: isAnonymous ? 'Donatur' : donorName,
                email: donorEmail,
            },
            callbacks: {
                finish: `${process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173'}/donation-info?status=success`,
            },
            // Store our transaction ID in metadata
            metadata: {
                transaction_id: newTransaction.id,
                donation_target_id: donationTargetId || null,
            },
        };

        try {
            console.log('[Midtrans] Creating transaction with params:', JSON.stringify(parameter, null, 2));
            console.log('[Midtrans] Server Key:', process.env.MIDTRANS_SERVER_KEY?.substring(0, 20) + '...');
            console.log('[Midtrans] Is Production:', process.env.MIDTRANS_IS_PRODUCTION);

            // Create Snap transaction
            const snapTransaction = await snap.createTransaction(parameter);

            console.log('[Midtrans] Snap transaction created:', snapTransaction);

            return {
                success: true,
                data: {
                    transactionId: newTransaction.id,
                    orderId: orderId,
                    snapToken: snapTransaction.token,
                    redirectUrl: snapTransaction.redirect_url,
                },
            };
        } catch (error: any) {
            console.error('[Midtrans] Error creating transaction:', error);
            console.error('[Midtrans] Error response:', error.ApiResponse || error.httpStatusCode);
            // Rollback: delete the pending transaction
            await db.delete(transactions).where(eq(transactions.id, newTransaction.id));
            throw new Error(`Midtrans error: ${error.message}`);
        }
    },

    /**
     * Handle payment notification from Midtrans
     */
    async handleNotification(notification: MidtransNotification) {
        // Verify notification authenticity
        const statusResponse = await coreApi.transaction.notification(notification);

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`[Midtrans] Order ID: ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

        // Extract transaction ID from order_id (format: DON-timestamp-nanoid)
        // We need to look up by the metadata we stored, but since Midtrans doesn't return it,
        // we'll need to find the transaction by matching order time or use a different approach

        // For now, we'll update based on order_id pattern matching
        // In production, you'd store order_id in the transaction table

        let newStatus: 'paid' | 'processing' = 'processing';

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                newStatus = 'paid';
            }
        } else if (transactionStatus === 'pending') {
            newStatus = 'processing';
        }

        // Note: In a real implementation, you'd store the order_id in your transaction
        // and update by that. For this demo, we'll log the status.
        console.log(`[Midtrans] Payment ${orderId} -> ${newStatus}`);

        return {
            success: true,
            status: newStatus,
            orderId,
        };
    },

    /**
     * Update transaction status after frontend callback
     */
    async updateTransactionStatus(transactionId: string, status: 'paid' | 'processing') {
        const [updated] = await db
            .update(transactions)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(transactions.id, transactionId))
            .returning();

        // If paid, update donation target current amount
        if (status === 'paid' && updated.donationTargetId) {
            await db
                .update(donationTargets)
                .set({
                    currentAmount: sql`${donationTargets.currentAmount} + ${updated.amount}`,
                    updatedAt: new Date(),
                })
                .where(eq(donationTargets.id, updated.donationTargetId));
        }

        return updated;
    },

    /**
     * Get client key for frontend
     */
    getClientKey() {
        return process.env.MIDTRANS_CLIENT_KEY || '';
    },

    /**
     * Check if Midtrans is in production mode
     */
    isProduction() {
        return process.env.MIDTRANS_IS_PRODUCTION === 'true';
    },
};
