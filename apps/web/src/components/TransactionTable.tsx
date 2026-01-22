

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export const TransactionTable = () => {
    const { data: transactions, isLoading } = useTransactions();
    const { data: categories } = useCategories();
    const [searchTerm, setSearchTerm] = useState('');

    if (isLoading) {
        return <div className="w-full h-64 flex items-center justify-center text-gray-500">Loading transactions...</div>;
    }

    // Sort by date descending
    const sortedTransactions = transactions
        ? [...transactions].sort((a, b) => {
            const dateDiff = new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
            if (dateDiff !== 0) return dateDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        : [];

    const getCategoryName = (id?: string) => {
        if (!id) return '-';
        return categories?.find(c => c.id === id)?.name || '-';
    };

    // Filter and slice (Limit to 5)
    // IMPORTANT: Filter FIRST, then slice, so we can search older records if we want, or just search within the latest?
    // Usually "Latest Transactions" widget shows top 5. Searching usually implies searching WITHIN that list or searching broadly?
    // Given the request "search di tabel widget", it likely implies searching whatever is available in the full list but displaying in this widget view.
    // However, if we filter the entire list and then take top 5, it acts like a mini-search. That's probably better usage.

    const filteredTransactions = sortedTransactions.filter(t => {
        const term = searchTerm.toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const donor = (t.donorName || '').toLowerCase();
        const catName = getCategoryName(t.categoryId).toLowerCase();
        const amountStr = t.amount.toString();

        return desc.includes(term) || donor.includes(term) || catName.includes(term) || amountStr.includes(term);
    }).slice(0, 5);

    return (
        <div className="w-full rounded-xl border border-gray-200 dark:border-card-border bg-white dark:bg-card-dark shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-gray-900 dark:text-white text-lg font-bold">Transaksi Terbaru</h3>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-card-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary w-full sm:w-64 placeholder-gray-400"
                            placeholder="Cari transaksi..."
                            type="text"
                        />
                    </div>
                </div>
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-background-dark/50 border-b border-gray-200 dark:border-card-border">
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tanggal</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nama</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Kategori</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Nominal</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Jenis</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-card-border">
                        {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-card-border/30 transition-colors">
                                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(t.transactionDate)}</td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {t.type === 'income' ? (t.donorName || '-') : (t.description || '-')}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {t.type === 'income' ? (t.description || '-') : '-'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{getCategoryName(t.categoryId)}</td>
                                <td className={`py-4 px-6 text-sm font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'} text-right`}>
                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                        {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    {searchTerm ? 'Tidak ditemukan transaksi yang cocok.' : 'Belum ada transaksi.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-gray-200 dark:divide-card-border">
                {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{formatDate(t.transactionDate)}</span>
                                <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                    {t.type === 'income' ? (t.donorName || '-') : (t.description || '-')}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {t.type === 'income' ? (t.description || '-') : '-'}
                                </span>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                {t.type === 'income' ? 'Masuk' : 'Keluar'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-gray-400">category</span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">{getCategoryName(t.categoryId)}</span>
                            </div>
                            <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        {searchTerm ? 'Tidak ditemukan transaksi yang cocok.' : 'Belum ada transaksi.'}
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-card-border flex justify-center">
                <Link to="/transactions" className="text-primary text-sm font-semibold hover:underline">Lihat Semua Transaksi</Link>
            </div>
        </div>
    );
};
