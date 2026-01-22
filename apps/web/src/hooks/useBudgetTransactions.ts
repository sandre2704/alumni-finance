import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface Transaction {
    id: string;
    amount: string;
    description: string;
    transactionDate: string;
    categoryId: string;
    type: 'income' | 'expense';
    userId: string;
    createdAt: string;
    user?: {
        id: string;
        username: string;
    };
}

interface BudgetTransactionsResponse {
    data: Transaction[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    stats: {
        totalSpent: number;
        transactionCount: number;
    };
}

interface UseBudgetTransactionsOptions {
    page?: number;
    limit?: number;
    search?: string;
    sortOrder?: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export const useBudgetTransactions = (
    categoryId: string,
    options: UseBudgetTransactionsOptions = {}
) => {
    const { page = 1, limit = 5, search = '', sortOrder = 'date-desc' } = options;

    return useQuery({
        queryKey: ['budget-transactions', categoryId, page, limit, search, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('categoryId', categoryId);
            params.append('type', 'expense');
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (search) params.append('search', search);

            // Filter by current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            params.append('startDate', startOfMonth.toISOString().split('T')[0]);
            params.append('endDate', endOfMonth.toISOString().split('T')[0]);

            // Map sort order to API parameters
            if (sortOrder === 'date-desc') {
                params.append('sortBy', 'transactionDate');
                params.append('sortOrder', 'desc');
            } else if (sortOrder === 'date-asc') {
                params.append('sortBy', 'transactionDate');
                params.append('sortOrder', 'asc');
            } else if (sortOrder === 'amount-desc') {
                params.append('sortBy', 'amount');
                params.append('sortOrder', 'desc');
            } else if (sortOrder === 'amount-asc') {
                params.append('sortBy', 'amount');
                params.append('sortOrder', 'asc');
            }

            const { data } = await apiClient.get<BudgetTransactionsResponse>(
                `/transactions?${params.toString()}`
            );
            return data;
        },
        enabled: !!categoryId,
    });
};
