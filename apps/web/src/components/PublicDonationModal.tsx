import React, { useState, useEffect } from 'react';
import { useDonationTargets } from '../hooks/useDonationTargets';
import { useCategories } from '../hooks/useCategories';
import { useMidtrans } from '../hooks/useMidtrans';
import { DonationTarget } from '../services/donation-targets.service';
import { DonationsService } from '../services/donations.service';

interface PublicDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedTarget?: DonationTarget | null;
}

type PaymentMethod = 'midtrans' | 'manual';
type DonationStep = 'form' | 'processing' | 'success' | 'pending';

export const PublicDonationModal: React.FC<PublicDonationModalProps> = ({
    isOpen,
    onClose,
    preselectedTarget
}) => {
    // Form State
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Toggle State
    const [isDonation, setIsDonation] = useState(false);

    // Selection State
    const [donationTargetId, setDonationTargetId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('midtrans');

    // UI State
    const [step, setStep] = useState<DonationStep>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // Hooks
    const { data: donationTargets } = useDonationTargets();
    const { data: categories } = useCategories();
    const { isLoaded: isMidtransLoaded, isLoading: isMidtransLoading, pay } = useMidtrans();

    // Data filtering
    const activeTargets = donationTargets?.filter(t => t.isActive) || [];
    const incomeCategories = categories?.filter(c => c.type === 'income') || [];

    // Quick Amount Options
    const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setDonorName('');
            setDonorEmail('');
            setAmount('');
            setMessage('');
            setIsAnonymous(false);
            setPaymentMethod('midtrans');
            setStep('form');
            setError(null);
            setTransactionId(null);

            // Logic for Preselected Target vs Default Category
            if (preselectedTarget) {
                setIsDonation(true);
                setDonationTargetId(preselectedTarget.id);
                setCategoryId('');
            } else {
                setIsDonation(false);
                setDonationTargetId('');

                // Try to find default 'Sumbangan' or 'Donasi' category
                const defaultCat = incomeCategories.find(c =>
                    c.name.toLowerCase() === 'sumbangan' ||
                    c.name.toLowerCase() === 'donasi' ||
                    c.name.toLowerCase() === 'donasi umum'
                );
                if (defaultCat) {
                    setCategoryId(defaultCat.id);
                } else if (incomeCategories.length > 0) {
                    setCategoryId(incomeCategories[0].id);
                }
            }
        }
    }, [isOpen, preselectedTarget, categories]); // Added categories dependency to set default once loaded

    if (!isOpen) return null;

    const formatCurrency = (value: string) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        setAmount(numericValue);
    };

    const handleQuickAmount = (value: number) => {
        setAmount(value.toString());
    };

    const validateForm = () => {
        if (!isAnonymous && !donorName.trim()) {
            setError('Nama donatur wajib diisi');
            return false;
        }
        if (!donorEmail.trim()) {
            setError('Email wajib diisi untuk konfirmasi pembayaran');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
            setError('Format email tidak valid');
            return false;
        }
        if (!amount || Number(amount) < 10000) {
            setError('Minimal donasi Rp 10.000');
            return false;
        }

        if (isDonation && !donationTargetId) {
            setError('Silakan pilih Target Donasi');
            return false;
        }

        if (!isDonation && !categoryId) {
            // If no categories available, maybe allow proceed? But ideally should pick one.
            if (incomeCategories.length > 0) {
                setError('Silakan pilih Kategori');
                return false;
            }
        }

        setError(null);
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            if (paymentMethod === 'midtrans') {
                if (!isMidtransLoaded) {
                    setError('Midtrans sedang dimuat, silakan tunggu...');
                    setIsSubmitting(false);
                    return;
                }

                // Create donation and get Snap token
                const result = await DonationsService.create({
                    donorName: isAnonymous ? 'Anonim' : donorName,
                    donorEmail,
                    amount: Number(amount),
                    donationTargetId: isDonation ? donationTargetId : undefined,
                    categoryId: !isDonation ? categoryId : undefined,
                    message,
                    isAnonymous,
                });

                setTransactionId(result.transactionId);
                setStep('processing');

                // Open Midtrans Snap popup
                const paymentResult = await pay(result.snapToken);

                if (paymentResult.status === 'success') {
                    // Update transaction status to paid
                    await DonationsService.updateStatus(result.transactionId, 'paid');
                    setStep('success');
                } else if (paymentResult.status === 'pending') {
                    setStep('pending');
                } else if (paymentResult.status === 'closed') {
                    // User closed the popup without completing
                    setStep('form');
                    setError('Pembayaran dibatalkan');
                } else {
                    setStep('form');
                    setError('Pembayaran gagal. Silakan coba lagi.');
                }
            } else {
                // Manual payment - open WhatsApp
                let targetName = 'Donasi Umum';

                if (isDonation) {
                    targetName = activeTargets.find(t => t.id === donationTargetId)?.name || 'Target Donasi';
                } else {
                    targetName = incomeCategories.find(c => c.id === categoryId)?.name || 'Sumbangan';
                }

                const waMessage = `Halo Admin, saya ingin konfirmasi transfer donasi:\n\n` +
                    `Nama: ${isAnonymous ? 'Anonim' : donorName}\n` +
                    `Email: ${donorEmail}\n` +
                    `Nominal: Rp ${formatCurrency(amount)}\n` +
                    `Alokasi: ${targetName}\n` +
                    `Keterangan: ${message || '-'}`;

                // You might want to get this number from site settings context if available
                const waNumber = "6281234567890"; // Fallback or fetched
                const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

                window.open(waUrl, '_blank');
                onClose();
            }
        } catch (err: any) {
            console.error('[Donation] Error:', err);
            setStep('form');
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep('form');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all" onClick={handleClose}></div>

            <div className="relative z-20 w-full max-w-[600px] flex flex-col max-h-[90vh] bg-white/95 dark:bg-[#0f0f1a]/95 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden animate-fade-in-up transition-all duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 hidden sm:block">
                            <span className="material-symbols-outlined text-primary">volunteer_activism</span>
                        </div>
                        <div>
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                                {step === 'form' && 'Form Donasi'}
                                {step === 'processing' && 'Memproses Pembayaran'}
                                {step === 'success' && 'Donasi Berhasil'}
                                {step === 'pending' && 'Menunggu Pembayaran'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                {step === 'form' ? 'Mari berkontribusi untuk kebaikan' : 'Mohon selesaikan langkah selanjutnya'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-all hover:rotate-90"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 backdrop-blur-sm animate-shake">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 mt-0.5">error</span>
                            <div className="flex-1">
                                <p className="text-red-800 dark:text-red-300 font-bold text-xs uppercase tracking-wider mb-1">Gagal Memproses</p>
                                <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="space-y-5 animate-fade-in">
                            {/* Donor Name & Anonymous Toggle */}
                            <div className="space-y-2">
                                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold ml-1">
                                    Nama Alumni / Donatur
                                </label>
                                <div className="space-y-3">
                                    <input
                                        value={donorName}
                                        onChange={(e) => setDonorName(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Masukkan nama lengkap Anda"
                                        type="text"
                                        disabled={isAnonymous}
                                    />
                                    <label className="flex items-center gap-3 cursor-pointer group w-fit select-none">
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
                                                className="w-5 h-5 rounded-md border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/5 text-primary focus:ring-offset-0 focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                                                type="checkbox"
                                            />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium group-hover:text-primary transition-colors">Sembunyikan nama saya (Anonim)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Donor Email - Wajib */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold ml-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Menerima bukti donasi</span>
                                </div>
                                <input
                                    value={donorEmail}
                                    onChange={(e) => setDonorEmail(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="contoh@email.com"
                                    type="email"
                                />
                            </div>

                            {/* Checkbox: "Untuk Donasi" */}
                            <label className="flex items-center gap-4 cursor-pointer group w-full p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent hover:border-primary/30 dark:hover:border-primary/30 transition-all shadow-sm">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        checked={isDonation}
                                        onChange={(e) => {
                                            setIsDonation(e.target.checked);
                                        }}
                                        className="w-5 h-5 rounded-md border-gray-300 dark:border-white/20 text-primary focus:ring-offset-0 cursor-pointer"
                                        type="checkbox"
                                    />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-gray-900 dark:text-white text-sm font-bold group-hover:text-primary transition-colors">Tentukan Target Spesifik?</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Centang untuk memilih program donasi tertentu (misal: Buka Puasa)</span>
                                </div>
                                <div className={`p-2 rounded-full transition-colors ${isDonation ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                    <span className="material-symbols-outlined">target</span>
                                </div>
                            </label>

                            {/* Dropdown Selection */}
                            <div className="space-y-2 animate-fade-in-up">
                                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold ml-1">
                                    {isDonation ? 'Pilih Target Donasi' : 'Pilih Kategori Donasi'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <select
                                        value={isDonation ? donationTargetId : categoryId}
                                        onChange={(e) => isDonation ? setDonationTargetId(e.target.value) : setCategoryId(e.target.value)}
                                        className="appearance-none w-full h-12 px-4 pr-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium"
                                    >
                                        <option value="" disabled>Pilih {isDonation ? 'Target' : 'Kategori'}</option>
                                        {isDonation
                                            ? activeTargets.map((target) => (
                                                <option key={target.id} value={target.id}>{target.name}</option>
                                            ))
                                            : incomeCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))
                                        }
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-3">
                                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold ml-1">
                                    Nominal Donasi <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 font-bold text-xs group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
                                        Rp
                                    </div>
                                    <input
                                        value={formatCurrency(amount)}
                                        onChange={(e) => handleAmountChange(e.target.value)}
                                        className="w-full h-14 pl-14 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xl tracking-wide"
                                        placeholder="0"
                                        type="text"
                                        inputMode="numeric"
                                    />
                                </div>
                                {/* Quick Amount Chips */}
                                <div className="flex flex-wrap gap-2">
                                    {quickAmounts.map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => handleQuickAmount(val)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:-translate-y-0.5 ${amount === val.toString()
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50'
                                                }`}
                                        >
                                            {friendlyCurrency(val)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold ml-1">
                                    Pesan / Doa <span className="text-gray-400 text-xs font-normal ml-1">(Opsional)</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full min-h-[80px] px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                                    placeholder="Tuliskan pesan atau doa Anda..."
                                ></textarea>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="space-y-3 pt-2">
                                <label className="text-gray-700 dark:text-gray-300 text-sm font-semibold ml-1">
                                    Metode Pembayaran
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('midtrans')}
                                        className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${paymentMethod === 'midtrans'
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md ring-1 ring-primary/20'
                                            : 'border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/50'
                                            }`}
                                    >
                                        <div className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${paymentMethod === 'midtrans' ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {paymentMethod === 'midtrans' && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                                        </div>
                                        <div className="flex-1 relative z-10">
                                            <span className="block text-gray-900 dark:text-white text-sm font-bold mb-0.5">Otomatis / Instan</span>
                                            <span className="block text-gray-500 dark:text-gray-400 text-xs leading-relaxed">QRIS, GoPay, ShopeePay, VA Bank (Verifikasi Otomatis)</span>
                                        </div>

                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('manual')}
                                        className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${paymentMethod === 'manual'
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md ring-1 ring-primary/20'
                                            : 'border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/50'
                                            }`}
                                    >
                                        <div className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${paymentMethod === 'manual' ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {paymentMethod === 'manual' && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                                        </div>
                                        <div className="flex-1 relative z-10">
                                            <span className="block text-gray-900 dark:text-white text-sm font-bold mb-0.5">Transfer Manual</span>
                                            <span className="block text-gray-500 dark:text-gray-400 text-xs leading-relaxed">Kirim bukti transfer ke WhatsApp Admin (Verifikasi Manual)</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center text-center py-12 animate-fade-in">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="relative w-20 h-20 bg-white dark:bg-[#1a1a33] rounded-full flex items-center justify-center shadow-xl border border-gray-100 dark:border-white/10">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            </div>
                            <h4 className="text-gray-900 dark:text-white text-xl font-bold mb-3">Menghubungkan Payment Gateway...</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                                Mohon tunggu sebentar, kami sedang menyiapkan halaman pembayaran aman untuk Anda.
                            </p>
                        </div>
                    )}

                    {step === 'pending' && (
                        <div className="flex flex-col items-center text-center py-8 animate-fade-in">
                            <div className="w-24 h-24 rounded-full bg-yellow-50 dark:bg-yellow-900/10 flex items-center justify-center mb-6 border border-yellow-100 dark:border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                                <span className="material-symbols-outlined text-5xl text-yellow-500">pending_actions</span>
                            </div>
                            <h4 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">Menunggu Pembayaran</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-sm mx-auto">
                                Silakan selesaikan pembayaran Anda. Status akan otomatis terupdate setelah pembayaran diterima.
                            </p>
                            <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/10 dark:to-transparent border border-yellow-200 dark:border-yellow-500/20 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/10 transition-colors"></div>
                                <p className="text-xs uppercase tracking-wider text-yellow-700 dark:text-yellow-400 font-bold mb-1 relative z-10">Total Donasi</p>
                                <p className="text-3xl font-black text-yellow-800 dark:text-yellow-300 relative z-10">Rp {formatCurrency(amount)}</p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center text-center py-8 animate-fade-in-up">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce-short">
                                    <span className="material-symbols-outlined text-5xl text-white">check_circle</span>
                                </div>
                            </div>
                            <h4 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">Terima Kasih!</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                                Donasi Anda telah berhasil dicatat. Bukti transaksi telah dikirim ke <strong>{donorEmail}</strong>.
                            </p>
                            <div className="grid grid-cols-2 gap-4 w-full mb-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-left">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Nominal</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">Rp {formatCurrency(amount)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-left">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Tanggal</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0f0f1a]/50 backdrop-blur-sm sticky bottom-0 z-10">
                    {step === 'form' && (
                        <>
                            <button
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 h-12 flex items-center justify-center rounded-xl bg-transparent text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-all focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/10"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || (paymentMethod === 'midtrans' && !isMidtransLoaded)}
                                className="px-8 h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:to-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#111122] disabled:opacity-50 disabled:hover:translate-y-0 min-w-[160px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{paymentMethod === 'midtrans' ? 'Lanjut Pembayaran' : 'Lanjut ke WhatsApp'}</span>
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                    {(step === 'success' || step === 'pending') && (
                        <button
                            onClick={handleClose}
                            className="w-full sm:w-auto px-10 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:to-primary text-white text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                        >
                            Selesai & Tutup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper for friendly currency display (e.g., 50rb)
function friendlyCurrency(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toLocaleString('id-ID') + ' Juta';
    }
    if (num >= 1000) {
        return (num / 1000).toLocaleString('id-ID') + 'rb';
    }
    return num.toLocaleString('id-ID');
}
