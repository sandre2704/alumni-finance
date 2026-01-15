import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { TransactionModal } from '../components/TransactionModal';
import { AttachmentModal } from '../components/AttachmentModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { Transaction } from '../services/transactions.service';

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

export const Transactions = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewAttachment, setViewAttachment] = useState<{ isOpen: boolean; url: string; type: 'image' | 'pdf' }>({
        isOpen: false,
        url: '',
        type: 'image'
    });
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });
    const { data: transactions, isLoading } = useTransactions();
    const { mutate: deleteTransaction } = useDeleteTransaction();
    const { data: categories } = useCategories();

    // Date initialization
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

    const startOfMonth = `${year}-${month}-01`;
    const endOfMonth = `${year}-${month}-${lastDay}`;

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        categoryId: '',
        startDate: startOfMonth,
        endDate: endOfMonth
    });

    // Temporary state for inputs (applied when clicking Filter)
    const [tempFilters, setTempFilters] = useState({
        search: '',
        type: '',
        categoryId: '',
        startDate: startOfMonth,
        endDate: endOfMonth
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const getCategoryName = (id?: string) => {
        if (!id) return '-';
        return categories?.find(c => c.id === id)?.name || '-';
    };

    // Filter Logic
    const filteredTransactions = transactions?.filter(t => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchDesc = t.description?.toLowerCase().includes(searchLower);
            const matchDonor = t.donorName?.toLowerCase().includes(searchLower);
            const matchAmount = t.amount.toString().includes(searchLower);
            if (!matchDesc && !matchDonor && !matchAmount) return false;
        }
        if (filters.type && t.type !== filters.type) return false;
        if (filters.categoryId && t.categoryId !== filters.categoryId) return false;

        if (filters.startDate) {
            const tDate = new Date(t.transactionDate).toISOString().split('T')[0];
            if (tDate < filters.startDate) return false;
        }
        if (filters.endDate) {
            const tDate = new Date(t.transactionDate).toISOString().split('T')[0];
            if (tDate > filters.endDate) return false;
        }
        return true;
    }) || [];

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleApplyFilter = () => {
        setFilters(tempFilters);
        setCurrentPage(1); // Reset to first page
    };

    const handleResetFilter = () => {
        const resetState = { search: '', type: '', categoryId: '', startDate: '', endDate: '' };
        setTempFilters(resetState);
        setFilters(resetState);
        setCurrentPage(1);
    };

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmation({ isOpen: true, id });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.id) {
            deleteTransaction(deleteConfirmation.id, {
                onError: (err) => alert('Gagal menghapus transaksi: ' + err.message)
            });
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Heading & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Daftar Transaksi</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Kelola pemasukan dan pengeluaran dana alumni.</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedTransaction(null);
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium h-10 px-5 rounded-lg transition-colors shadow-lg shadow-primary/25"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Tambah Baru</span>
                    </button>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">search</span>
                            <input
                                className="w-full h-10 pl-10 pr-3 rounded-lg border-0 bg-gray-50 dark:bg-background-dark ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary text-sm transition-all"
                                placeholder="Cari transaksi..."
                                type="text"
                                value={tempFilters.search}
                                onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                className="h-10 px-3 pr-8 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2212%22%20height%3d%2212%22%20viewBox%3d%220%200%2012%2012%22%3e%3cpath%20fill%3d%22%239ca3af%22%20d%3d%22M2%204l4%204%204-4%22%2f%3e%3c%2fsvg%3e')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat"
                                value={tempFilters.type}
                                onChange={(e) => setTempFilters({ ...tempFilters, type: e.target.value })}
                            >
                                <option value="">Semua Tipe</option>
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>

                            <select
                                className="h-10 px-3 pr-8 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2212%22%20height%3d%2212%22%20viewBox%3d%220%200%2012%2012%22%3e%3cpath%20fill%3d%22%239ca3af%22%20d%3d%22M2%204l4%204%204-4%22%2f%3e%3c%2fsvg%3e')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat"
                                value={tempFilters.categoryId}
                                onChange={(e) => setTempFilters({ ...tempFilters, categoryId: e.target.value })}
                            >
                                <option value="">Semua Kategori</option>
                                {categories?.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    className="h-10 px-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={tempFilters.startDate}
                                    onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
                                />
                                <span className="text-slate-400 text-sm">—</span>
                                <input
                                    type="date"
                                    className="h-10 px-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={tempFilters.endDate}
                                    onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleApplyFilter}
                                className="h-10 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-primary/25"
                            >
                                <span className="material-symbols-outlined text-lg">filter_list</span>
                                <span>Filter</span>
                            </button>
                            <button
                                onClick={handleResetFilter}
                                className="h-10 px-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-[#252538] border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[180px] whitespace-nowrap cursor-pointer hover:text-primary transition-colors group">
                                        <div className="flex items-center gap-1">
                                            Tanggal
                                            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_downward</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[300px]">
                                        Nama
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[180px]">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[200px] text-right cursor-pointer hover:text-primary transition-colors group">
                                        <div className="flex items-center gap-1 justify-end">
                                            Nominal
                                            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">unfold_more</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[150px] text-center">
                                        Jenis
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[120px] text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Memuat transaksi...</td>
                                    </tr>
                                ) : paginatedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            {transactions?.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi yang sesuai filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions.map((t) => (
                                        <tr key={t.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(t.transactionDate)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {t.type === 'income'
                                                            ? (t.donorName || '-')
                                                            : (t.description?.split(' - ')[0] || '-')}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {t.type === 'income'
                                                            ? (t.description || '-')
                                                            : (t.description?.split(' - ').slice(1).join(' - ') || '-')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                                    {getCategoryName(t.categoryId)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'} border`}>
                                                    {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {t.receiptUrl && (
                                                        <button
                                                            onClick={() => setViewAttachment({
                                                                isOpen: true,
                                                                url: t.receiptUrl!,
                                                                type: t.receiptUrl!.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
                                                            })}
                                                            className="p-1 text-slate-400 hover:text-primary transition-colors"
                                                            title="Lihat Bukti"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(t)}
                                                        className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-surface-dark">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Menampilkan <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> dari <span className="font-medium text-slate-900 dark:text-white">{filteredTransactions.length}</span> transaksi
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-slate-400 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`flex items-center justify-center size-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                                        : 'border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="flex items-center justify-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-slate-400 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTransaction(null);
                }}
                transaction={selectedTransaction}
            />
            <AttachmentModal
                isOpen={viewAttachment.isOpen}
                onClose={() => setViewAttachment(prev => ({ ...prev, isOpen: false }))}
                fileUrl={viewAttachment.url}
                fileType={viewAttachment.type}
            />
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Hapus Transaksi"
                message="Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan."
                confirmText="Hapus"
                isDestructive
            />
        </div>
    );
};
