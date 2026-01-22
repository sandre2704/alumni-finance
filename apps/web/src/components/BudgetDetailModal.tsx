import React, { useState } from 'react';
import { BudgetStatus } from '../hooks/useDashboard';
import { useBudgetTransactions } from '../hooks/useBudgetTransactions';
import { useDebounce } from '../hooks/useDebounce';

interface BudgetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    budget: BudgetStatus | null;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const BudgetDetailModal: React.FC<BudgetDetailModalProps> = ({
    isOpen,
    onClose,
    budget,
}) => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: transactionsData, isLoading } = useBudgetTransactions(budget?.id || '', {
        page,
        limit: 5,
        search: debouncedSearch,
        sortOrder
    });

    if (!isOpen || !budget) return null;

    const percentage = Math.min(100, budget.percentage);
    const isOverBudget = budget.actual > budget.budget;
    const remaining = budget.budget - budget.actual;

    const totalPages = transactionsData?.meta?.totalPages || 1;
    const totalTransactions = transactionsData?.meta?.total || 0;
    const currentPageStart = ((page - 1) * 5) + 1;
    const currentPageEnd = Math.min(page * 5, totalTransactions);

    return (
        <div aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog">
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl transform rounded-xl bg-white dark:bg-card-dark shadow-2xl transition-all border border-gray-200 dark:border-card-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-card-border">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        Detail Anggaran - {budget.category}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-card-border"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {/* Summary Section */}
                    <div className="mb-8 bg-gray-50 dark:bg-background-dark/50 p-6 rounded-xl border border-gray-100 dark:border-card-border">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Penggunaan</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(budget.actual)}</span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">dari {formatCurrency(budget.budget)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${isOverBudget
                                    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                    : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                    }`}>
                                    {budget.percentage}% Terpakai
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full relative transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${percentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            <span>0%</span>
                            <span className={isOverBudget ? 'text-red-500' : ''}>
                                {isOverBudget ? `Melebihi: ${formatCurrency(Math.abs(remaining))}` : `Sisa: ${formatCurrency(remaining)}`}
                            </span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Transaksi</h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                                <input
                                    className="pl-9 pr-4 py-2 bg-white dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary w-full sm:w-64 placeholder-gray-400"
                                    placeholder="Cari transaksi..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-card-border transition-colors cursor-pointer outline-none"
                            >
                                <option value="date-desc">Terbaru</option>
                                <option value="date-asc">Terlama</option>
                                <option value="amount-desc">Nominal Tertinggi</option>
                                <option value="amount-asc">Nominal Terendah</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border border-gray-200 dark:border-card-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse bg-white dark:bg-card-dark">
                                <thead className="bg-gray-50 dark:bg-background-dark/80">
                                    <tr>
                                        <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-card-border">Tanggal</th>
                                        <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-card-border">Nama Barang/Keperluan</th>
                                        <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-card-border text-right">Nominal</th>
                                        <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-card-border">PIC/Admin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-card-border">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                                                    <span>Memuat data...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : !transactionsData?.data || transactionsData.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="material-symbols-outlined text-4xl text-gray-300">inbox</span>
                                                    <span>Belum ada transaksi untuk kategori ini.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactionsData.data.map((t) => {
                                            // Parse description to extract item name and details
                                            const descParts = t.description?.split(' - ') || [];
                                            const itemName = descParts[0] || 'Tanpa nama';
                                            const itemDesc = descParts.slice(1).join(' - ') || '';

                                            return (
                                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-card-border/30 transition-colors">
                                                    <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                        {formatDate(t.transactionDate)}
                                                    </td>
                                                    <td className="py-3 px-5">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {itemName}
                                                        </p>
                                                        {itemDesc && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {itemDesc}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-5 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                        {formatCurrency(parseFloat(t.amount))}
                                                    </td>
                                                    <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">
                                                        {t.user?.username || 'Admin'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalTransactions > 0 && (
                        <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                            <p>Menampilkan {currentPageStart}-{currentPageEnd} dari {totalTransactions} transaksi</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 rounded border border-gray-200 dark:border-card-border hover:bg-gray-100 dark:hover:bg-card-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1 rounded border border-gray-200 dark:border-card-border hover:bg-gray-100 dark:hover:bg-card-border text-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-card-border bg-gray-50 dark:bg-card-dark flex justify-end gap-3 rounded-b-xl">
                    <button
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-card-border text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-card-border transition-colors"
                        onClick={() => alert('Fitur export akan datang segera!')}
                    >
                        Unduh PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-blue-700 shadow-lg shadow-primary/25 transition-all"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};
