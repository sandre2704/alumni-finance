import { apiClient } from '../lib/api-client';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    transactionDate: string;
    categoryId?: string;
    type: 'income' | 'expense';
    donorName?: string;
    isAnonymous?: boolean;
    donationTargetId?: string | null;
    receiptUrl?: string | null;
    userId: string;
    status: 'paid' | 'processing' | 'pending_bendahara' | 'pending_admin' | 'rejected';
    approvedByBendaharaId?: string | null;
    approvedByAdminId?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTransactionCommon {
    amount: number;
    description?: string;
    transactionDate: string;
    categoryId?: string;
    donationTargetId?: string;
    type: 'income' | 'expense';
    donorName?: string;
    isAnonymous?: boolean;
    receiptUrl?: string;
    status?: 'paid' | 'processing' | 'pending_bendahara' | 'pending_admin' | 'rejected';
}

export type CreateTransactionInput = CreateTransactionCommon | CreateTransactionCommon[];

export interface UpdateTransactionInput extends Partial<CreateTransactionCommon> { }

export const TransactionsService = {
    getAll: async () => {
        const { data } = await apiClient.get<{ data: Transaction[] }>('/transactions?limit=10000');
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await apiClient.get<{ data: Transaction }>(`/transactions/${id}`);
        return data.data;
    },

    create: async (transaction: CreateTransactionInput) => {
        const { data } = await apiClient.post<{ data: Transaction | Transaction[] }>('/transactions', transaction);
        return data.data;
    },

    update: async (id: string, transaction: UpdateTransactionInput) => {
        const { data } = await apiClient.put<{ data: Transaction }>(`/transactions/${id}`, transaction);
        return data.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/transactions/${id}`);
    },

    approve: async (id: string) => {
        const { data } = await apiClient.post<{ data: Transaction }>(`/transactions/${id}/approve`, {});
        return data.data;
    },

    reject: async (id: string, reason: string) => {
        const { data } = await apiClient.post<{ data: Transaction }>(`/transactions/${id}/reject`, { reason });
        return data.data;
    },
};
