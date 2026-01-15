import { apiClient } from '../lib/api-client';

export interface ReportData {
    // Define types based on backend response shape
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    categoryBreakdown: { category: string; amount: number }[];
}

export const ReportsService = {
    getFinancialSummary: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const { data } = await apiClient.get<{ data: ReportData }>(`/reports/summary?${params.toString()}`);
        return data.data;
    },

    getIncomeByCategory: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const { data } = await apiClient.get<{ data: { categoryId: string; categoryName: string; total: number; percentage: number }[] }>(`/reports/income-by-category?${params.toString()}`);
        return data.data;
    },

    getExpenseByCategory: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const { data } = await apiClient.get<{ data: { categoryId: string; categoryName: string; total: number; percentage: number }[] }>(`/reports/expense-by-category?${params.toString()}`);
        return data.data;
    },

    getDailyCashFlow: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const { data } = await apiClient.get<{ data: { date: string; income: number; expense: number }[] }>(`/reports/daily-cashflow?${params.toString()}`);
        return data.data;
    },

    getMonthlyComparison: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const { data } = await apiClient.get<{ data: { month: string; year: number; income: number; expense: number; net: number }[] }>(`/reports/monthly-comparison?${params.toString()}`);
        return data.data;
    },

    getExportUrl: (format: 'pdf' | 'excel', startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `${apiClient.defaults.baseURL}/reports/export/${format}?${params.toString()}`;
    }
};
