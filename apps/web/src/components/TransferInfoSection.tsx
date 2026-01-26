import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteSettingsService, TransferInfo, BankAccount } from "../services/site-settings.service";
import Swal from "sweetalert2";

export const TransferInfoSection = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'accounts' | 'general'>('accounts');
    const [formData, setFormData] = useState<TransferInfo>({
        bankAccounts: [],
        whatsappNumber: "",
        email: "",
        instructions: "",
        qrCodeUrl: "",
    });

    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccountIndex, setEditingAccountIndex] = useState<number | null>(null);
    const [accountForm, setAccountForm] = useState<BankAccount>({
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        isActive: true
    });

    const { data: transferInfo, isLoading } = useQuery({
        queryKey: ["transferInfo"],
        queryFn: () => SiteSettingsService.getTransferInfo(),
    });

    useEffect(() => {
        if (transferInfo) {
            setFormData(transferInfo);
        }
    }, [transferInfo]);

    const mutation = useMutation({
        mutationFn: SiteSettingsService.updateTransferInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transferInfo"] });
            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Pengaturan berhasil disimpan!",
                confirmButtonColor: "#3085d6",
            });
        },
        onError: (error: any) => {
            console.error("Failed to update transfer info:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Gagal menyimpan pengaturan.",
                confirmButtonColor: "#d33",
            });
        },
    });

    // --- Bank Account Management ---

    const handleOpenAddAccount = () => {
        setAccountForm({ bankName: "", accountNumber: "", accountHolder: "", isActive: true });
        setEditingAccountIndex(null);
        setIsAccountModalOpen(true);
    };

    const handleEditAccount = (index: number) => {
        setAccountForm({ ...formData.bankAccounts[index] });
        setEditingAccountIndex(index);
        setIsAccountModalOpen(true);
    };

    const handleDeleteAccount = (index: number) => {
        Swal.fire({
            title: 'Hapus Rekening?',
            text: "Rekening ini tidak akan tampil lagi di halaman donasi.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                const newAccounts = [...formData.bankAccounts];
                newAccounts.splice(index, 1);
                const updatedData = { ...formData, bankAccounts: newAccounts };
                setFormData(updatedData);
                mutation.mutate(updatedData); // Auto-save on delete
            }
        });
    };

    const handleSaveAccount = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccounts = [...formData.bankAccounts];

        if (editingAccountIndex !== null) {
            newAccounts[editingAccountIndex] = accountForm;
        } else {
            newAccounts.push(accountForm);
        }

        const updatedData = { ...formData, bankAccounts: newAccounts };
        setFormData(updatedData);
        mutation.mutate(updatedData); // Auto-save on account change
        setIsAccountModalOpen(false);
    };

    // --- General Settings Management ---

    const handleSaveGeneralSettings = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isLoading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Info Transfer & Donasi</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Kelola informasi rekening bank dan kontak.
                </p>
            </div>

            {/* Internal Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`
                            whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2
                            ${activeTab === 'accounts'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                        `}
                    >
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">account_balance</span>
                        <span className="hidden sm:inline">Daftar</span> Rekening
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`
                            whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2
                            ${activeTab === 'general'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                        `}
                    >
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">settings_applications</span>
                        <span className="hidden sm:inline">Konfigurasi</span> Umum
                    </button>
                </nav>
            </div>

            {/* Tab Content: Accounts */}
            {activeTab === 'accounts' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={handleOpenAddAccount}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
                        >
                            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add</span>
                            Tambah Rekening
                        </button>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-3">
                        {formData.bankAccounts.length === 0 ? (
                            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-4 text-center text-gray-500 dark:text-gray-400 italic text-sm">
                                Belum ada data rekening.
                            </div>
                        ) : (
                            formData.bankAccounts.map((account, index) => (
                                <div key={index} className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded bg-gray-100 dark:bg-white flex items-center justify-center overflow-hidden p-1 shadow-sm">
                                                <span className="text-[10px] font-bold text-primary truncate">
                                                    {account.bankName.substring(0, 4).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-medium text-sm text-gray-700 dark:text-gray-200">{account.bankName}</span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${account.isActive !== false
                                            ? "bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-500/20"
                                            : "bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20"
                                            }`}>
                                            {account.isActive !== false ? "Aktif" : "Non-Aktif"}
                                        </span>
                                    </div>
                                    <div className="space-y-1 mb-3">
                                        <p className="font-mono text-sm text-gray-600 dark:text-gray-300">{account.accountNumber}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">a.n. {account.accountHolder}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => handleEditAccount(index)}
                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAccount(index)}
                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-card-dark/50 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-card-border">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4">Nama Bank</th>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4">Nomor Rekening</th>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Atas Nama</th>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Status</th>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-card-border text-sm">
                                    {formData.bankAccounts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 italic">
                                                Belum ada data rekening. Silakan tambah rekening baru.
                                            </td>
                                        </tr>
                                    ) : (
                                        formData.bankAccounts.map((account, index) => (
                                            <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className="size-7 sm:size-8 rounded bg-gray-100 dark:bg-white flex items-center justify-center overflow-hidden p-1 shadow-sm">
                                                            <span className="text-[10px] font-bold text-primary truncate max-w-full">
                                                                {account.bankName.substring(0, 4).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-200">{account.bankName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <span className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 tracking-wide">{account.accountNumber}</span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{account.accountHolder}</span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium border ${account.isActive !== false
                                                        ? "bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-500/20"
                                                        : "bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20"
                                                        }`}>
                                                        {account.isActive !== false ? "Aktif" : "Non-Aktif"}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                        <button
                                                            onClick={() => handleEditAccount(index)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAccount(index)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: General Settings */}
            {activeTab === 'general' && (
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-4 sm:p-6 shadow-sm">
                    <form onSubmit={handleSaveGeneralSettings} className="grid grid-cols-1 gap-4 sm:gap-6">
                        {/* Contact Info */}
                        <div className="space-y-3 sm:space-y-4">
                            <h5 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Kontak & QRIS</h5>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor WhatsApp Admin</label>
                                <input
                                    type="text"
                                    value={formData.whatsappNumber}
                                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white text-xs sm:text-sm"
                                    placeholder="08123456789"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Admin</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white text-xs sm:text-sm"
                                    placeholder="admin@alumni.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL QRIS (Gambar)</label>
                                <input
                                    type="text"
                                    value={formData.qrCodeUrl}
                                    onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white text-xs sm:text-sm"
                                    placeholder="https://example.com/qris.jpg"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">save</span>
                                        Simpan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Add/Edit Account */}
            {isAccountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-card-border">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-card-border">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingAccountIndex !== null ? 'Edit Rekening' : 'Tambah Rekening'}
                            </h3>
                            <button onClick={() => setIsAccountModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveAccount} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Bank</label>
                                <input
                                    type="text"
                                    required
                                    value={accountForm.bankName}
                                    onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                                    placeholder="Contoh: BCA"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Rekening</label>
                                <input
                                    type="text"
                                    required
                                    value={accountForm.accountNumber}
                                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white font-mono"
                                    placeholder="Contoh: 1234567890"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Atas Nama</label>
                                <input
                                    type="text"
                                    required
                                    value={accountForm.accountHolder}
                                    onChange={(e) => setAccountForm({ ...accountForm, accountHolder: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                                    placeholder="Contoh: Yayasan Alumni"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={accountForm.isActive !== false}
                                        onChange={(e) => setAccountForm({ ...accountForm, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary bg-gray-50 dark:bg-background-dark dark:border-gray-700"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rekening Aktif</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1 ml-8">Jika non-aktif, rekening tidak akan muncul di halaman publik.</p>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAccountModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
                                >
                                    Simpan Rekening
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
