// Re-export schema types
export type { User, NewUser, Session, NewSession } from '../db/schema/auth.js';
export type { Category, NewCategory } from '../db/schema/categories.js';
export type { Transaction, NewTransaction } from '../db/schema/transactions.js';
export type { DonationTarget, NewDonationTarget } from '../db/schema/donation-targets.js';

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Auth types
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface SessionData {
    user: AuthUser;
    expiresAt: Date;
}
