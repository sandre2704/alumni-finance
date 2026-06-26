import React, { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions';
import { useDonationTargets } from '../hooks/useDonationTargets';
import { Transaction } from '../services/transactions.service';
import { useAuth } from '../context/AuthContext';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
    const [transactionType, setTransactionType] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [itemName, setItemName] = useState(''); // Added for Expense item name
    const [donorName, setDonorName] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDonation, setIsDonation] = useState(false);
    const [donationTargetId, setDonationTargetId] = useState('');

    // Hooks
    const { data: categories } = useCategories();
    const { mutate: createTransaction, isPending: isCreatePending } = useCreateTransaction();
    const { mutate: updateTransaction, isPending: isUpdatePending } = useUpdateTransaction();
    const { data: donationTargets } = useDonationTargets();
    const { user } = useAuth();

    const isPending = isCreatePending || isUpdatePending;

    useEffect(() => {
        if (isOpen) {
            if (transaction) {
                // Edit Mode
                setTransactionType(transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran');
                setCategoryId(transaction.categoryId || '');
                setDonationTargetId(transaction.donationTargetId || '');
                setAmount(transaction.amount.toString());
                setDate(new Date(transaction.transactionDate).toISOString().split('T')[0]);

                if (transaction.type === 'income') {
                    setDonorName(transaction.donorName || '');
                    setDescription(transaction.description || '');
                } else {
                    setItemName(transaction.description || '');
                    setDescription('');
                }

                setIsAnonymous(transaction.isAnonymous || false);
                setIsDonation(!!transaction.donationTargetId);
                setFile(null);
            } else {
                // Create Mode
                setAmount('');
                setDescription('');
                setItemName('');
                setCategoryId('');
                setDonorName('');
                setIsAnonymous(false);
                setFile(null);
                setIsUploading(false);
                setIsDonation(false);
                setDonationTargetId('');
                setDate(new Date().toISOString().split('T')[0]); // Default to today
                if (user?.role === 'alumni') {
                    setTransactionType('Pengeluaran');
                }
            }
        }
    }, [isOpen, transaction, user]);

    if (!isOpen) return null;

    const filteredCategories = categories?.filter(cat =>
        transactionType === 'Pemasukan' ? cat.type === 'income' : cat.type === 'expense'
    ) || [];

    const handleSave = async () => {
        // For donation transactions, require donationTargetId instead of categoryId
        if (isDonation && transactionType === 'Pemasukan') {
            if (!donationTargetId || !amount || !date) {
                alert('Mohon lengkapi data wajib (Target Donasi, Jumlah, Tanggal)');
                return;
            }
        } else {
            if (!categoryId || !amount || !date) {
                alert('Mohon lengkapi data wajib (Kategori, Jumlah, Tanggal)');
                return;
            }
        }

        const today = new Date().toISOString().split('T')[0];
        if (date > today) {
            alert('Tanggal tidak boleh lebih dari hari ini');
            return;
        }

        const type: 'income' | 'expense' = transactionType === 'Pemasukan' ? 'income' : 'expense';

        try {
            let receiptUrl: string | undefined = undefined;

            if (file) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', file);

                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || 'Upload failed');
                }
                receiptUrl = result.data.url;
            }

            const payload = {
                type,
                categoryId: isDonation ? undefined : categoryId,
                donationTargetId: isDonation ? donationTargetId : undefined,
                amount: Number(amount),
                transactionDate: date,
                description: type === 'income' ? description : (itemName + (description ? ` - ${description}` : '')),
                donorName: type === 'income' ? donorName : undefined,
                status: 'paid' as const, // Default status
                isAnonymous,
                receiptUrl: receiptUrl || (transaction?.receiptUrl ?? undefined)
            };

            if (transaction) {
                updateTransaction({
                    id: transaction.id,
                    data: payload
                }, {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (err) => {
                        alert('Gagal mengupdate transaksi: ' + err.message);
                    }
                });
            } else {
                createTransaction(payload, {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (err) => {
                        alert('Gagal menyimpan transaksi: ' + err.message);
                    }
                });
            }
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 1 * 1024 * 1024) {
                alert('Ukuran file maksimal 1MB');
                return;
            }
            setFile(selectedFile);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative z-20 w-full max-w-[640px] flex flex-col max-h-[95vh] bg-white dark:bg-[#111122] rounded-xl border border-gray-200 dark:border-[#333366] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up transition-colors duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-[#333366]">
                    <h3 className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                        {transaction ? 'Edit Transaksi' : (user?.role === 'alumni' ? 'Ajukan Pengeluaran' : 'Catat Transaksi Baru')}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-[#9292c8] dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-white dark:bg-[#111122]">
                    {/* Transaction Type Toggle (Hidden for Alumni) */}
                    {user?.role !== 'alumni' && (
                        <div className="flex">
                            <div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#242447] p-1">
                                <label className={`group flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 transition-all ${transactionType === 'Pemasukan' ? 'bg-white dark:bg-primary shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-[#9292c8] hover:text-gray-900 dark:hover:text-white'}`}>
                                    <span className="truncate text-sm font-medium">Pemasukan</span>
                                    <input
                                        className="hidden"
                                        name="transaction_type"
                                        type="radio"
                                        value="Pemasukan"
                                        checked={transactionType === 'Pemasukan'}
                                        onChange={() => {
                                            setTransactionType('Pemasukan');
                                            setCategoryId('');
                                        }}
                                    />
                                </label>
                                <label className={`group flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 transition-all ${transactionType === 'Pengeluaran' ? 'bg-white dark:bg-primary shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-[#9292c8] hover:text-gray-900 dark:hover:text-white'}`}>
                                    <span className="truncate text-sm font-medium">Pengeluaran</span>
                                    <input
                                        className="hidden"
                                        name="transaction_type"
                                        type="radio"
                                        value="Pengeluaran"
                                        checked={transactionType === 'Pengeluaran'}
                                        onChange={() => {
                                            setTransactionType('Pengeluaran');
                                            setCategoryId('');
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Dynamic input based on type */}
                    <label className="flex flex-col w-full">
                        <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">
                            {transactionType === 'Pemasukan' ? 'Nama Alumni / Donatur' : 'Nama Barang/Keperluan'}
                        </p>
                        <input
                            value={transactionType === 'Pemasukan' ? donorName : itemName}
                            onChange={(e) => transactionType === 'Pemasukan' ? setDonorName(e.target.value) : setItemName(e.target.value)}
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a33] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#333366] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#5a5a89] px-4 text-base font-normal leading-normal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder={transactionType === 'Pemasukan' ? "Masukkan nama alumni" : "Contoh: Nasi Kotak Rapat"}
                            type="text"
                            disabled={transactionType === 'Pemasukan' && isAnonymous}
                        />

                        {transactionType === 'Pemasukan' && (
                            <label className="flex items-center gap-2 mt-2 cursor-pointer group w-fit">
                                <div className="relative flex items-center">
                                    <input
                                        checked={isAnonymous}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setIsAnonymous(checked);
                                            if (checked) {
                                                setDonorName('Anonim');
                                            } else {
                                                setDonorName('');
                                            }
                                        }}
                                        className="peer h-4 w-4 rounded border-gray-300 dark:border-[#333366] border bg-gray-50 dark:bg-[#1a1a33] text-primary focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer checked:bg-primary checked:border-primary"
                                        type="checkbox"
                                    />
                                </div>
                                <span className="text-gray-500 dark:text-[#9292c8] group-hover:text-gray-900 dark:group-hover:text-white text-xs transition-colors">sebagai anonim</span>
                            </label>
                        )}
                    </label>

                    {/* Donation Checkbox - Only for Pemasukan */}
                    {transactionType === 'Pemasukan' && (
                        <label className="flex items-center gap-3 cursor-pointer group w-fit p-3 rounded-lg border border-gray-300 dark:border-[#333366] bg-gray-50 dark:bg-[#1a1a33] hover:border-primary/50 transition-all">
                            <div className="relative flex items-center">
                                <input
                                    checked={isDonation}
                                    onChange={(e) => {
                                        setIsDonation(e.target.checked);
                                        if (e.target.checked) {
                                            setCategoryId('');
                                        } else {
                                            setDonationTargetId('');
                                        }
                                    }}
                                    className="peer h-5 w-5 rounded border-gray-300 dark:border-[#333366] border bg-gray-50 dark:bg-[#1a1a33] text-primary focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer checked:bg-primary checked:border-primary"
                                    type="checkbox"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-900 dark:text-white text-sm font-medium group-hover:text-primary transition-colors">Untuk Donasi</span>
                                <span className="text-gray-500 dark:text-[#9292c8] text-xs">Tautkan ke target donasi yang aktif</span>
                            </div>
                        </label>
                    )}

                    {/* Donation Target Dropdown - Only when isDonation is checked */}
                    {transactionType === 'Pemasukan' && isDonation ? (
                        <label className="flex flex-col w-full relative">
                            <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Target Donasi</p>
                            <div className="relative">
                                <select
                                    value={donationTargetId}
                                    onChange={(e) => setDonationTargetId(e.target.value)}
                                    className="appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a33] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#333366] focus:border-primary h-12 px-4 pr-10 text-base font-normal leading-normal transition-all cursor-pointer"
                                >
                                    <option disabled value="">Pilih Target Donasi</option>
                                    {donationTargets?.map((target) => (
                                        <option key={target.id} value={target.id}>{target.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-[#9292c8]">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </label>
                    ) : (
                        /* Category Dropdown - Hidden when isDonation is checked for Pemasukan */
                        <label className="flex flex-col w-full relative">
                            <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Kategori</p>
                            <div className="relative">
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a33] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#333366] focus:border-primary h-12 px-4 pr-10 text-base font-normal leading-normal transition-all cursor-pointer"
                                >
                                    <option disabled value="">Pilih Kategori</option>
                                    {filteredCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-[#9292c8]">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </label>
                    )}

                    {/* Amount & Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col w-full">
                            <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Jumlah yang Dibayarkan</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#9292c8] font-medium">Rp</span>
                                <input
                                    value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a33] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#333366] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#5a5a89] pl-10 pr-4 text-base font-normal leading-normal transition-all"
                                    placeholder="0"
                                    type="text"
                                    inputMode="numeric"
                                />
                            </div>
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Tanggal</p>
                            <div className="relative">
                                <input
                                    value={date}
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a33] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#333366] focus:border-primary h-12 placeholder:text-gray-400 dark:placeholder:text-[#5a5a89] px-4 text-base font-normal leading-normal transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                    type="date"
                                />
                            </div>
                        </label>
                    </div>

                    {/* Description */}
                    <label className="flex flex-col w-full">
                        <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">
                            {transactionType === 'Pemasukan' ? 'Keterangan (Opsional)' : 'Keterangan Tambahan'}
                        </p>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1a1a33] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#333366] focus:border-primary min-h-[100px] placeholder:text-gray-400 dark:placeholder:text-[#5a5a89] p-4 text-base font-normal leading-normal transition-all"
                            placeholder="Tambahkan detail transaksi..."
                        ></textarea>
                    </label>

                    {/* File Upload */}
                    <div className="flex flex-col w-full">
                        <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal pb-2">Unggah Foto Nota/Kuitansi</p>
                        <div className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-[#333366] rounded-lg bg-gray-50 dark:bg-[#1a1a33]/50 hover:bg-white dark:hover:bg-[#1a1a33] hover:border-primary/50 transition-all cursor-pointer">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="p-2 rounded-full bg-gray-100 dark:bg-[#242447] text-primary group-hover:scale-110 transition-transform mb-3">
                                    <span className="material-symbols-outlined">cloud_upload</span>
                                </div>
                                <p className="mb-1 text-sm text-gray-500 dark:text-[#9292c8]"><span className="font-semibold text-primary">Klik untuk unggah</span> atau seret file</p>
                                <p className="text-xs text-gray-400 dark:text-[#5a5a89]">SVG, PNG, JPG (MAX. 1MB)</p>
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                            />
                            {file && (
                                <div className="absolute inset-0 bg-white/90 dark:bg-[#111122]/90 flex flex-col items-center justify-center rounded-lg z-10 transition-colors">
                                    <p className="text-gray-900 dark:text-white text-sm mb-2">{file.name}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-semibold"
                                    >
                                        Hapus File
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-[#333366] bg-gray-50 dark:bg-[#151525] rounded-b-xl">
                    <button onClick={onClose} disabled={isPending} className="px-5 h-11 flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#333366] bg-white dark:bg-transparent text-gray-700 dark:text-white text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#242447] transition-colors focus:ring-2 focus:ring-gray-200 dark:focus:ring-[#333366]">
                        Batal
                    </button>
                    <button onClick={handleSave} disabled={isPending || isUploading} className="px-5 h-11 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-bold shadow-lg hover:bg-primary/90 transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#111122]">
                        {isPending || isUploading ? 'Menyimpan...' : (transaction ? 'Update Transaksi' : 'Simpan Transaksi')}
                    </button>
                </div>
            </div>
        </div>
    );
};
