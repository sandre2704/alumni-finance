import { useState } from "react";

import { SiteSettingsService } from "../services/site-settings.service";
import { useQuery } from "@tanstack/react-query";
import { PublicDonationModal } from "../components/PublicDonationModal";

export const DonationInfo = () => {
    const { data: transferInfo, isLoading } = useQuery({
        queryKey: ["transferInfo"],
        queryFn: () => SiteSettingsService.getTransferInfo(),
    });

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
    const [isManualTransferExpanded, setIsManualTransferExpanded] = useState(false);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="bg-background-light dark:bg-background-dark flex items-center justify-center h-full min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const bankAccounts = transferInfo?.bankAccounts?.filter(account => account.isActive !== false) || [];
    const hasBankAccounts = bankAccounts.length > 0;

    // Gradient patterns for bank cards
    const cardGradients = [
        "linear-gradient(135deg, #2424eb 0%, #111122 100%)",
        "linear-gradient(135deg, #6d28d9 0%, #111122 100%)",
        "linear-gradient(135deg, #0d9488 0%, #111122 100%)",
        "linear-gradient(135deg, #be123c 0%, #111122 100%)",
    ];

    return (
        <div className="relative flex h-auto w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white">

            <main className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-8">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

                        {/* Hero Section - Primary CTA */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 md:p-12 mb-8 shadow-2xl shadow-primary/20">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-medium mb-4">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        <span>Aman & Terverifikasi</span>
                                    </div>
                                    <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-4">
                                        Donasi untuk Alumni
                                    </h1>
                                    <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                                        Berkontribusi untuk kegiatan alumni dengan mudah dan aman. Pilih target donasi atau donasi umum untuk kas organisasi.
                                    </p>
                                    <button
                                        onClick={() => setIsDonationModalOpen(true)}
                                        className="inline-flex items-center justify-center gap-3 rounded-xl h-14 px-8 bg-white text-primary font-bold text-base shadow-xl shadow-black/20 transition-all hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1 hover:bg-gray-50"
                                    >
                                        <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
                                        <span>Donasi Sekarang</span>
                                    </button>
                                </div>
                                <div className="hidden md:flex items-center justify-center">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-6xl text-white/80">favorite</span>
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-400 flex items-center justify-center shadow-lg">
                                            <span className="material-symbols-outlined text-white text-lg">check</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark">
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">speed</span>
                                </div>
                                <div>
                                    <p className="text-gray-900 dark:text-white font-semibold text-sm">Proses Cepat</p>
                                    <p className="text-gray-500 dark:text-text-secondary text-xs">Konfirmasi otomatis</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark">
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">verified_user</span>
                                </div>
                                <div>
                                    <p className="text-gray-900 dark:text-white font-semibold text-sm">Aman & Terpercaya</p>
                                    <p className="text-gray-500 dark:text-text-secondary text-xs">Via payment gateway</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark">
                                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">payments</span>
                                </div>
                                <div>
                                    <p className="text-gray-900 dark:text-white font-semibold text-sm">Banyak Metode</p>
                                    <p className="text-gray-500 dark:text-text-secondary text-xs">QRIS, VA, E-Wallet</p>
                                </div>
                            </div>
                        </div>

                        {/* Manual Transfer Section - Collapsible */}
                        {hasBankAccounts && (
                            <div className="rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark overflow-hidden">
                                <button
                                    onClick={() => setIsManualTransferExpanded(!isManualTransferExpanded)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10">
                                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">account_balance</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-gray-900 dark:text-white font-semibold text-sm">Preferensi Transfer Manual?</p>
                                            <p className="text-gray-500 dark:text-text-secondary text-xs">Lihat rekening tujuan untuk transfer bank</p>
                                        </div>
                                    </div>
                                    <span className={`material-symbols-outlined text-gray-400 transition-transform ${isManualTransferExpanded ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>

                                {isManualTransferExpanded && (
                                    <div className="border-t border-gray-200 dark:border-border-dark p-5 space-y-6 bg-gray-50 dark:bg-black/20">
                                        {/* Bank Accounts */}
                                        <div className="space-y-4">
                                            <h3 className="text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-lg">credit_card</span>
                                                Rekening Tujuan
                                            </h3>
                                            <div className="grid gap-3">
                                                {bankAccounts.map((account, index) => (
                                                    <div key={index} className="flex flex-col sm:flex-row items-stretch justify-between gap-3 rounded-lg bg-white dark:bg-card-dark p-4 border border-gray-200 dark:border-border-dark">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-500 dark:text-text-secondary text-xs font-medium uppercase tracking-wider">
                                                                    {account.bankName}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-900 dark:text-white text-lg font-bold tracking-wide font-mono">
                                                                {account.accountNumber}
                                                            </p>
                                                            <p className="text-gray-500 dark:text-text-secondary text-sm">
                                                                a.n {account.accountHolder}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy(account.accountNumber, index)}
                                                            className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-gray-100 dark:bg-border-dark text-gray-700 dark:text-white hover:bg-primary hover:text-white transition-colors text-sm font-medium self-start sm:self-center"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">
                                                                {copiedIndex === index ? 'check' : 'content_copy'}
                                                            </span>
                                                            <span>{copiedIndex === index ? 'Tersalin' : 'Salin'}</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* QRIS if available */}
                                        {transferInfo?.qrCodeUrl && (
                                            <div className="space-y-3">
                                                <h3 className="text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-lg">qr_code_2</span>
                                                    Scan QRIS
                                                </h3>
                                                <div className="flex justify-center">
                                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                                        <img src={transferInfo.qrCodeUrl} alt="QRIS Code" className="w-40 h-40 object-contain" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Steps */}
                                        <div className="space-y-3">
                                            <h3 className="text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                                                Langkah Transfer
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="flex gap-3 p-3 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</div>
                                                    <p className="text-gray-600 dark:text-text-secondary text-sm">Salin nomor rekening di atas</p>
                                                </div>
                                                <div className="flex gap-3 p-3 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</div>
                                                    <p className="text-gray-600 dark:text-text-secondary text-sm">Transfer sesuai nominal</p>
                                                </div>
                                                <div className="flex gap-3 p-3 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</div>
                                                    <p className="text-gray-600 dark:text-text-secondary text-sm">Simpan bukti transfer</p>
                                                </div>
                                                <div className="flex gap-3 p-3 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">4</div>
                                                    <p className="text-gray-600 dark:text-text-secondary text-sm">Konfirmasi via WhatsApp</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* WhatsApp Confirmation */}
                                        {transferInfo?.whatsappNumber && (
                                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">chat</span>
                                                    <p className="text-green-800 dark:text-green-300 text-sm">Sudah transfer? Konfirmasi ke Admin</p>
                                                </div>
                                                <a
                                                    href={`https://wa.me/${transferInfo.whatsappNumber.replace(/^0/, '62').replace(/\D/g, '')}?text=Halo%20Admin,%20saya%20sudah%20melakukan%20transfer%20donasi.%20Mohon%20dikonfirmasi.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 rounded-lg h-10 px-5 bg-green-600 hover:bg-green-700 text-white transition-all font-medium text-sm shadow-md"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                                    <span>WhatsApp</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </main>

            {/* Donation Modal */}
            <PublicDonationModal
                isOpen={isDonationModalOpen}
                onClose={() => setIsDonationModalOpen(false)}
            />
        </div>
    );
};
