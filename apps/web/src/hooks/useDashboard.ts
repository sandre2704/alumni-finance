
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface DashboardStats {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    totalBalanceTrend: number;
    monthlyIncomeTrend: number;
    monthlyExpenseTrend: number;
}

interface CashFlowData {
    month: string;
    year: number;
    income: number;
    expense: number;
    net: number;
    balance: number;
}

// Rename ExpenseBreakdown to CategoryBreakdown as they are identical structure, or just duplicate for clarity.
// Let's duplicate to match the requested pattern for income.

export interface ExpenseBreakdown {
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
}

export interface IncomeBreakdown {
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
}

interface DonationProgress {
    id: string;
    name: string;
    targetAmount: string;
    currentAmount: string;
    description: string;
    deadline?: string;
    percentage: number;
}

export const useDashboardStats = (month?: number, year?: number) => {
    return useQuery({
        queryKey: ['dashboard-stats', month, year],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (month) params.append('month', month.toString());
            if (year) params.append('year', year.toString());
            const queryString = params.toString() ? `?${params.toString()}` : '';

            const { data } = await apiClient.get<{ data: DashboardStats }>('/dashboard/stats' + queryString);
            return data.data;
        },
    });
};

export const useCashFlow = (months = 6) => {
    return useQuery({
        queryKey: ['cashflow', months],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: CashFlowData[] }>(`/dashboard/cashflow?months=${months}`);
            return data.data;
        },
    });
};

export const useIncomeBreakdown = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['income-breakdown', startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            const query = params.toString() ? `?${params.toString()}` : '';
            const { data } = await apiClient.get<{ data: IncomeBreakdown[] }>(`/dashboard/income-breakdown${query}`);
            return data.data;
        },
    });
};

export const useExpenseBreakdown = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['expense-breakdown', startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            const query = params.toString() ? `?${params.toString()}` : '';
            const { data } = await apiClient.get<{ data: ExpenseBreakdown[] }>(`/dashboard/expense-breakdown${query}`);
            return data.data;
        },
    });
};

export const useDonationProgress = () => {
    return useQuery({
        queryKey: ['donation-progress'],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: DonationProgress | null }>('/dashboard/donation-progress');
            return data.data;
        },
    });
};

export interface BudgetStatus {
    id: string;
    category: string;
    budget: number;
    actual: number;
    percentage: number;
}

export const useBudgetStatus = () => {
    return useQuery({
        queryKey: ['budget-status'],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: BudgetStatus[] }>('/dashboard/budget-status');
            return data.data;
        },
    });
};
