import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    value: jsonb("value"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Type definitions for transfer info
export interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

export interface TransferInfo {
    bankAccounts: BankAccount[];
    whatsappNumber: string;
    email: string;
    instructions: string;
    qrCodeUrl?: string;
}

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
