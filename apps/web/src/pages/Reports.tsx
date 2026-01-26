import { useState } from 'react';

import { ReportCharts } from '../components/ReportCharts';
import { useFinancialSummary } from '../hooks/useReports';
import { ExportService } from '../services/export.service';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDateForInput = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const getDefaultDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        startDate: formatDateForInput(startOfMonth),
        endDate: formatDateForInput(endOfMonth)
    };
};

export const Reports = () => {
    const [dateRange, setDateRange] = useState(getDefaultDateRange());
    const [tempDateRange, setTempDateRange] = useState(getDefaultDateRange());
    const [isExporting, setIsExporting] = useState(false);

    const { data: stats, isLoading } = useFinancialSummary(dateRange.startDate, dateRange.endDate);

    const handleApplyFilter = () => {
        setDateRange(tempDateRange);
    };

    const handleExport = async (type: 'pdf' | 'excel') => {
        setIsExporting(true);
        try {
            if (type === 'pdf') {
                await ExportService.downloadPDF(dateRange.startDate, dateRange.endDate);
            } else {
                await ExportService.downloadExcel(dateRange.startDate, dateRange.endDate);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Gagal mengunduh laporan. Pastikan server backend berjalan.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-10 py-8 flex flex-col gap-8">
            {/* Page Heading & Filters */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Laporan Keuangan</h1>
                        <p className="text-slate-500 dark:text-text-secondary text-base font-normal mt-1">Pantau kesehatan finansial dan arus kas alumni periode ini.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting}
                            className="flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-border-dark transition-colors text-slate-700 dark:text-white text-sm font-bold shadow-sm disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                            <span>{isExporting ? 'Mengunduh...' : 'Unduh PDF'}</span>
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={isExporting}
                            className="flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-border-dark transition-colors text-slate-700 dark:text-white text-sm font-bold shadow-sm disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[20px]">table_view</span>
                            <span>{isExporting ? 'Mengunduh...' : 'Ekspor Excel'}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Start Date */}
                        <div className="w-full sm:w-auto sm:min-w-[180px]">
                            <label className="block text-xs font-medium text-slate-500 dark:text-text-secondary mb-1.5 sm:hidden">Dari Tanggal</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-secondary pointer-events-none text-lg">calendar_today</span>
                                <input
                                    className="w-full rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-border-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-3 h-11 text-sm"
                                    type="date"
                                    value={tempDateRange.startDate}
                                    onChange={(e) => setTempDateRange({ ...tempDateRange, startDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Separator - hidden on mobile */}
                        <span className="hidden sm:block text-slate-400 dark:text-text-secondary text-sm font-medium">—</span>

                        {/* End Date */}
                        <div className="w-full sm:w-auto sm:min-w-[180px]">
                            <label className="block text-xs font-medium text-slate-500 dark:text-text-secondary mb-1.5 sm:hidden">Sampai Tanggal</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-secondary pointer-events-none text-lg">event</span>
                                <input
                                    className="w-full rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-border-dark text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-3 h-11 text-sm"
                                    type="date"
                                    value={tempDateRange.endDate}
                                    onChange={(e) => setTempDateRange({ ...tempDateRange, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Filter Button - inline on desktop, full width on mobile */}
                        <button
                            onClick={handleApplyFilter}
                            className="h-11 px-5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25 whitespace-nowrap w-full sm:w-auto"
                        >
                            <span className="material-symbols-outlined text-lg">filter_list</span>
                            <span>Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-text-secondary mb-2">
                        <div className="bg-primary/20 p-1.5 rounded-md text-primary">
                            <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                        </div>
                        <span className="text-sm font-medium">Saldo Bersih</span>
                    </div>
                    <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                        {isLoading ? 'Loading...' : formatCurrency(stats?.netBalance || 0)}
                    </p>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        <span>Saldo bersih periode ini</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-text-secondary mb-2">
                        <div className="bg-emerald-500/10 p-1.5 rounded-md text-emerald-500 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-xl">arrow_downward</span>
                        </div>
                        <span className="text-sm font-medium">Total Pemasukan</span>
                    </div>
                    <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                        {isLoading ? 'Loading...' : formatCurrency(stats?.totalIncome || 0)}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-xs font-medium mt-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>Periode Terpilih</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-text-secondary mb-2">
                        <div className="bg-rose-500/10 p-1.5 rounded-md text-rose-500 dark:text-rose-400">
                            <span className="material-symbols-outlined text-xl">arrow_upward</span>
                        </div>
                        <span className="text-sm font-medium">Total Pengeluaran</span>
                    </div>
                    <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                        {isLoading ? 'Loading...' : formatCurrency(stats?.totalExpense || 0)}
                    </p>
                    <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400 text-xs font-medium mt-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>Periode Terpilih</span>
                    </div>
                </div>
            </div>

            <ReportCharts startDate={dateRange.startDate} endDate={dateRange.endDate} />


        </div>
    );
};
