import React, { useState } from 'react';
import { DonationTarget } from '../services/donation-targets.service';
import { useDonationDonors } from '../hooks/useDonationTargets';
import { useDebounce } from '../hooks/useDebounce';

interface DonationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    donationTarget: DonationTarget | null;
}

export const DonationDetailModal: React.FC<DonationDetailModalProps> = ({
    isOpen,
    onClose,
    donationTarget,
}) => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

    // Debounce search term to avoid too many API calls
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: donorsData, isLoading } = useDonationDonors(donationTarget?.id || '', {
        page,
        limit: 5,
        search: debouncedSearch,
        sortOrder
    });

    if (!isOpen || !donationTarget) return null;

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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const targetAmount = parseFloat(donationTarget.targetAmount);
    // Use stats from API if available, otherwise fallback to target's currentAmount
    const currentAmount = donorsData?.stats?.totalCollected ?? parseFloat(donationTarget.currentAmount);
    const donorCount = donorsData?.stats?.donorCount ?? 0;
    const percentage = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;

    const totalPages = donorsData?.meta?.totalPages || 1;

    const handleExport = () => {
        // Simple CSV export for current page (or better, trigger a full download endpoint if available later)
        // For now, let's just print window as a basic "export" or maybe just alert
        alert("Fitur export akan datang segera!");
    };

    return (
        <div aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog">
            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl transform rounded-xl bg-white dark:bg-card-dark shadow-2xl transition-all border border-gray-200 dark:border-card-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-card-border">
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white leading-tight pr-2">
                        Detail Donatur - {donationTarget.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-card-border flex-shrink-0"
                    >
                        <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-left">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-3 sm:p-5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 shadow-sm flex flex-col">
                            <p className="text-[10px] sm:text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">Total Terkumpul</p>
                            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentAmount)}</p>
                            <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-1.5 sm:px-2 py-0.5 rounded-full inline-flex items-center gap-1 self-start">
                                <span className="material-symbols-outlined text-xs sm:text-sm">trending_up</span> {percentage}%
                            </div>
                        </div>
                        <div className="p-3 sm:p-5 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 shadow-sm flex flex-col">
                            <p className="text-[10px] sm:text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Jumlah Donatur</p>
                            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{donorCount} <span className="text-xs sm:text-lg font-normal text-gray-500 dark:text-gray-400">orang</span></p>
                            <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-100 dark:bg-blue-900/30 px-1.5 sm:px-2 py-0.5 rounded-full inline-flex items-center gap-1 self-start">
                                <span className="material-symbols-outlined text-xs sm:text-sm">group</span> Total
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">search</span>
                            <input
                                className="pl-9 sm:pl-10 pr-4 py-2 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-lg text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary w-full placeholder-gray-400 transition-colors"
                                placeholder="Cari donatur..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as any)}
                                className="flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-lg hover:bg-gray-100 dark:hover:bg-card-border transition-colors cursor-pointer outline-none"
                            >
                                <option value="date-desc">Terbaru</option>
                                <option value="date-asc">Terlama</option>
                                <option value="amount-desc">Nominal ↑</option>
                                <option value="amount-asc">Nominal ↓</option>
                            </select>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-lg hover:bg-gray-100 dark:hover:bg-card-border transition-colors"
                            >
                                <span className="material-symbols-outlined text-base sm:text-lg">download</span>
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border border-gray-200 dark:border-card-border overflow-hidden">
                        <div className="overflow-x-auto min-h-[200px] sm:min-h-[300px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-background-dark/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Tanggal
                                        </th>
                                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Nama Donatur
                                        </th>
                                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right hidden sm:table-cell">
                                            Nominal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-card-border bg-white dark:bg-card-dark">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={3} className="py-8 sm:py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="material-symbols-outlined animate-spin text-2xl sm:text-3xl">sync</span>
                                                    <span className="text-xs sm:text-sm">Memuat data...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : !donorsData?.data || donorsData.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-8 sm:py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-gray-300">inbox</span>
                                                    <span className="text-xs sm:text-sm">Belum ada data transaksi donasi.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        donorsData.data.map((t: any) => (
                                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-card-border/30 transition-colors">
                                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-[11px] sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                    {formatDate(t.transactionDate)}
                                                </td>
                                                <td className="py-2 sm:py-3 px-2 sm:px-4">
                                                    <div className="flex flex-col">
                                                        <span className={`text-[11px] sm:text-sm font-medium text-gray-900 dark:text-white ${t.isAnonymous ? 'italic' : ''}`}>
                                                            {t.isAnonymous ? 'Hamba Allah' : t.donorName || 'Tanpa Nama'}
                                                        </span>
                                                        {t.description && (
                                                            <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[200px]">{t.description}</span>
                                                        )}
                                                        {/* Show amount on mobile below name */}
                                                        <span className="sm:hidden text-[11px] font-bold text-primary mt-0.5">
                                                            {formatCurrency(parseFloat(t.amount))}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm font-bold text-gray-900 dark:text-white text-right hidden sm:table-cell">
                                                    {formatCurrency(parseFloat(t.amount))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 border-t border-gray-200 dark:border-card-border pt-3 sm:pt-4 gap-2">
                            <div className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
                                Halaman <span className="font-semibold text-gray-900 dark:text-white">{page}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                            </div>
                            <div className="flex gap-2 self-end sm:self-auto">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
