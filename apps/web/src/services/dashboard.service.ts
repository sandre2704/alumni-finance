import { apiClient } from '../lib/api-client';

export interface DashboardStats {
    totalBalance: number;
    income: {
        total: number;
        trend: number; // percentage
    };
    expense: {
        total: number;
        trend: number; // percentage
    };
    monthlyChart: {
        labels: string[];
        income: number[];
        expense: number[];
    };
}

export const DashboardService = {
    getStats: async () => {
        const { data } = await apiClient.get<{ data: DashboardStats }>('/dashboard/stats');
        return data.data;
    }
};
