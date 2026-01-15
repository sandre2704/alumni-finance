import { useQuery } from '@tanstack/react-query';
import { ReportsService } from '../services/reports.service';

export const useFinancialSummary = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['financial-summary', startDate, endDate],
        queryFn: () => ReportsService.getFinancialSummary(startDate, endDate),
    });
};

export const useReportIncomeBreakdown = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['report-income-breakdown', startDate, endDate],
        queryFn: () => ReportsService.getIncomeByCategory(startDate, endDate),
    });
};

export const useReportExpenseBreakdown = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['report-expense-breakdown', startDate, endDate],
        queryFn: () => ReportsService.getExpenseByCategory(startDate, endDate),
    });
};

export const useReportDailyCashFlow = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['report-daily-cashflow', startDate, endDate],
        queryFn: () => ReportsService.getDailyCashFlow(startDate, endDate),
    });
};

export const useReportMonthlyComparison = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['report-monthly-comparison', startDate, endDate],
        queryFn: () => ReportsService.getMonthlyComparison(startDate, endDate),
    });
};
