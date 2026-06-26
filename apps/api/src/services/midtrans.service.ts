import midtransClient from 'midtrans-client';
import { db } from '../db/index.js';
import { transactions } from '../db/schema/transactions.js';
import { donationTargets } from '../db/schema/donation-targets.js';
import { categories } from '../db/schema/categories.js';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { emailService } from './email.service.js';

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
    custom_field1?: string;
    customer_details?: {
        email?: string;
        first_name?: string;
    };
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
                orderId: orderId,
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
            // Custom fields are returned in webhook notifications
            custom_field1: donorEmail,
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

            // Send pending donation receipt email
            try {
                await emailService.sendDonationReceiptEmail({
                    to: donorEmail,
                    donorName: isAnonymous ? 'Donatur Anonim' : donorName,
                    amount,
                    targetName,
                    orderId,
                    transactionDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    status: 'pending',
                });
            } catch (emailErr) {
                console.error('[Midtrans] Failed to send receipt email (non-blocking):', emailErr);
            }

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

        let newStatus: 'paid' | 'processing' = 'processing';

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                newStatus = 'paid';
            }
        } else if (transactionStatus === 'pending') {
            newStatus = 'processing';
        }

        // Lookup transaction by order_id and update status
        const [existingTransaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.orderId, orderId))
            .limit(1);

        if (!existingTransaction) {
            console.warn(`[Midtrans] No transaction found for order_id: ${orderId}`);
            return { success: false, status: newStatus, orderId };
        }

        // Update transaction status
        const [updated] = await db
            .update(transactions)
            .set({ status: newStatus, updatedAt: new Date() })
            .where(eq(transactions.id, existingTransaction.id))
            .returning();

        // If paid and linked to a donation target, update currentAmount
        if (newStatus === 'paid' && updated.donationTargetId) {
            await db
                .update(donationTargets)
                .set({
                    currentAmount: sql`${donationTargets.currentAmount} + ${updated.amount}`,
                    updatedAt: new Date(),
                })
                .where(eq(donationTargets.id, updated.donationTargetId));
        }

        console.log(`[Midtrans] Payment ${orderId} -> ${newStatus} (transaction: ${updated.id})`);

        // Send success receipt email when payment confirmed
        if (newStatus === 'paid' && updated.donorName) {
            try {
                // Get donor email from custom_field1 (we sent it during creation) or fallback
                const targetName = updated.description || 'Donasi Umum';
                const donorEmail = notification.custom_field1 || statusResponse.custom_field1 || statusResponse.customer_details?.email || '';
                
                if (donorEmail) {
                    await emailService.sendDonationReceiptEmail({
                        to: donorEmail,
                        donorName: updated.donorName,
                        amount: Number(updated.amount),
                        targetName,
                        orderId,
                        transactionDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                        status: 'success',
                    });
                }
            } catch (emailErr) {
                console.error('[Midtrans] Failed to send success receipt email (non-blocking):', emailErr);
            }
        }

        return {
            success: true,
            status: newStatus,
            orderId,
            transactionId: updated.id,
        };
    },

    /**
     * Update transaction status after frontend callback
     */
    async updateTransactionStatus(transactionId: string, status: 'paid' | 'processing', donorEmail?: string) {
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

        // Send success receipt email
        if (status === 'paid' && donorEmail) {
            try {
                await emailService.sendDonationReceiptEmail({
                    to: donorEmail,
                    donorName: updated.donorName || 'Donatur',
                    amount: Number(updated.amount),
                    targetName: updated.description || 'Donasi Umum',
                    orderId: updated.orderId || updated.id,
                    transactionDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    status: 'success',
                });
            } catch (emailErr) {
                console.error('[Donation] Failed to send success receipt email (non-blocking):', emailErr);
            }
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
