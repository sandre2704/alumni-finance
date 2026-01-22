import { db } from '../db';
import { siteSettings, TransferInfo } from '../db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const TRANSFER_INFO_KEY = 'transfer_info';

export class SiteSettingsService {
    // Get transfer info (public)
    static async getTransferInfo(): Promise<TransferInfo | null> {
        const result = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, TRANSFER_INFO_KEY))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return result[0].value as TransferInfo;
    }

    // Update transfer info (admin only)
    static async updateTransferInfo(data: TransferInfo): Promise<TransferInfo> {
        const existing = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, TRANSFER_INFO_KEY))
            .limit(1);

        if (existing.length === 0) {
            // Insert new record
            await db.insert(siteSettings).values({
                id: nanoid(),
                key: TRANSFER_INFO_KEY,
                value: data,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else {
            // Update existing record
            await db
                .update(siteSettings)
                .set({
                    value: data,
                    updatedAt: new Date(),
                })
                .where(eq(siteSettings.key, TRANSFER_INFO_KEY));
        }

        return data;
    }
}
