import { useState } from "react";

import { SiteSettingsService } from "../services/site-settings.service";
import { useQuery } from "@tanstack/react-query";

export const DonationInfo = () => {
    const { data: transferInfo, isLoading } = useQuery({
        queryKey: ["transferInfo"],
        queryFn: () => SiteSettingsService.getTransferInfo(),
    });

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

    // Gradient patterns for bank cards to add visual variety
    const cardGradients = [
        "linear-gradient(135deg, #2424eb 0%, #111122 100%)", // Blue
        "linear-gradient(135deg, #6d28d9 0%, #111122 100%)", // Purple
        "linear-gradient(135deg, #0d9488 0%, #111122 100%)", // Teal
        "linear-gradient(135deg, #be123c 0%, #111122 100%)", // Rose
    ];

    return (
        <div className="relative flex h-auto w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white">


            <main className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-8">
                    <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">

                        {/* Page Header */}
                        <div className="flex flex-wrap justify-between gap-3 p-4 mb-4">
                            <div className="flex flex-col gap-3">
                                <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                                    Panduan Transfer Donasi
                                </h1>
                                <p className="text-gray-600 dark:text-text-secondary text-base font-normal leading-normal max-w-2xl">
                                    Ikuti panduan di bawah ini untuk melakukan transfer donasi. Pastikan nomor rekening tujuan sudah sesuai sebelum melakukan transaksi.
                                </p>
                            </div>
                        </div>

                        {/* Main Content Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">

                            {/* Left Column: Bank Accounts */}
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                <div className="flex items-center gap-2 pb-2">
                                    <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                                    <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                        Rekening Tujuan
                                    </h2>
                                </div>

                                {!hasBankAccounts ? (
                                    <div className="p-6 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm text-center">
                                        <p className="text-gray-500 dark:text-text-secondary italic">Belum ada informasi rekening.</p>
                                    </div>
                                ) : (
                                    bankAccounts.map((account, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-card-dark p-6 shadow-lg border border-gray-200 dark:border-border-dark hover:border-primary/50 transition-colors group relative overflow-hidden">
                                            <div className="flex flex-[2_2_0px] flex-col justify-between gap-4 z-10">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="bg-gray-100 dark:bg-white/10 p-1.5 rounded text-gray-700 dark:text-white">
                                                            <span className="material-symbols-outlined text-[20px]">account_balance</span>
                                                        </div>
                                                        <p className="text-gray-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">
                                                            {account.bankName}
                                                        </p>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-wide font-mono">
                                                        {account.accountNumber}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-text-secondary text-sm font-normal leading-normal">
                                                        a.n {account.accountHolder}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(account.accountNumber, index)}
                                                    className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-gray-100 dark:bg-border-dark text-gray-700 dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors text-sm font-medium leading-normal w-fit group-hover:bg-gray-200 dark:group-hover:bg-border-dark/80 dark:group-hover:hover:bg-primary"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {copiedIndex === index ? 'check' : 'content_copy'}
                                                    </span>
                                                    <span>{copiedIndex === index ? 'Tersalin' : 'Salin No. Rek'}</span>
                                                </button>
                                            </div>
                                            {/* Decorative Gradient Background */}
                                            <div
                                                className="hidden sm:block w-32 bg-center bg-no-repeat bg-cover rounded-lg opacity-80 mix-blend-overlay absolute right-6 top-6 bottom-6"
                                                style={{ backgroundImage: cardGradients[index % cardGradients.length] }}
                                            ></div>
                                        </div>
                                    ))
                                )}

                                {/* QRIS Section if available */}
                                {transferInfo?.qrCodeUrl && (
                                    <div className="rounded-xl bg-white dark:bg-card-dark p-6 shadow-lg border border-gray-200 dark:border-border-dark flex flex-col items-center text-center">
                                        <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Scan QRIS</h3>
                                        <div className="bg-white p-4 rounded-xl inline-block border border-gray-200">
                                            <img src={transferInfo.qrCodeUrl} alt="QRIS Code" className="w-48 h-48 object-contain" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Guide & Info */}
                            <div className="lg:col-span-5 flex flex-col gap-8">

                                {/* Steps Section */}
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-2 pb-2">
                                        <span className="material-symbols-outlined text-primary">format_list_numbered</span>
                                        <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                            Langkah Transfer
                                        </h2>
                                    </div>

                                    <div className="relative flex flex-col gap-0 pl-2">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-border-dark"></div>

                                        {/* Step 1 */}
                                        <div className="relative flex gap-4 pb-8 group">
                                            <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-card-dark border-2 border-primary text-primary font-bold shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                1
                                            </div>
                                            <div className="flex flex-col pt-1.5">
                                                <p className="text-gray-900 dark:text-white text-base font-bold leading-tight">Pilih Bank Tujuan</p>
                                                <p className="text-gray-500 dark:text-text-secondary text-sm mt-1">Salin salah satu nomor rekening yang tersedia di samping kiri.</p>
                                            </div>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="relative flex gap-4 pb-8 group">
                                            <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-card-dark border-2 border-primary text-primary font-bold shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                2
                                            </div>
                                            <div className="flex flex-col pt-1.5">
                                                <p className="text-gray-900 dark:text-white text-base font-bold leading-tight">Masukkan Nominal</p>
                                                <p className="text-gray-500 dark:text-text-secondary text-sm mt-1">Input nominal donasi sesuai keikhlasan Anda pada aplikasi banking.</p>
                                            </div>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="relative flex gap-4 pb-8 group">
                                            <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-card-dark border-2 border-primary text-primary font-bold shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                3
                                            </div>
                                            <div className="flex flex-col pt-1.5">
                                                <p className="text-gray-900 dark:text-white text-base font-bold leading-tight">
                                                    Berita Transfer <span className="text-xs font-normal text-gray-500 dark:text-text-secondary bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded ml-2">Opsional</span>
                                                </p>
                                                <p className="text-gray-500 dark:text-text-secondary text-sm mt-1">Tambahkan keterangan "Donasi Alumni" jika memungkinkan.</p>
                                            </div>
                                        </div>

                                        {/* Step 4 */}
                                        <div className="relative flex gap-4 group">
                                            <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-card-dark border-2 border-primary text-primary font-bold shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                4
                                            </div>
                                            <div className="flex flex-col pt-1.5">
                                                <p className="text-gray-900 dark:text-white text-base font-bold leading-tight">Simpan Bukti</p>
                                                <p className="text-gray-500 dark:text-text-secondary text-sm mt-1">Screenshot atau simpan resi transfer untuk keperluan konfirmasi jika dibutuhkan.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Info Box: Auto Confirmation */}
                                <div className="rounded-xl bg-blue-50 dark:bg-primary/10 border border-blue-100 dark:border-primary/20 p-5 mt-2">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            <span className="material-symbols-outlined text-blue-600 dark:text-primary">verified_user</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-gray-900 dark:text-white text-base font-bold">Konfirmasi Otomatis</p>
                                            <p className="text-gray-600 dark:text-text-secondary text-sm leading-relaxed">
                                                Sistem kami akan memverifikasi mutasi rekening secara berkala. Status donasi Anda akan diperbarui setelah verifikasi.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Confirmation & Support Section */}
                                <div className="rounded-xl bg-white dark:bg-card-dark p-6 border border-gray-200 dark:border-border-dark flex flex-col gap-4 items-start shadow-sm">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-gray-900 dark:text-white text-lg font-bold">Sudah Transfer?</h3>
                                        <p className="text-gray-500 dark:text-text-secondary text-sm">
                                            Segera lakukan konfirmasi agar donasi Anda dapat kami catat.
                                        </p>
                                    </div>
                                    {transferInfo?.whatsappNumber ? (
                                        <div className="w-full flex flex-col gap-3">
                                            <a
                                                href={`https://wa.me/${transferInfo.whatsappNumber.replace(/^0/, '62').replace(/\D/g, '')}?text=Halo%20Admin,%20saya%20sudah%20melakukan%20transfer%20donasi.%20Mohon%20dikonfirmasi.`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center w-full gap-2 rounded-lg h-10 px-6 bg-green-600 hover:bg-green-700 text-white transition-all font-medium text-sm shadow-md shadow-green-600/20"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                <span>Konfirmasi via WhatsApp</span>
                                            </a>
                                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                                <span>atau butuh bantuan?</span>
                                                <a
                                                    href={`https://wa.me/${transferInfo.whatsappNumber.replace(/^0/, '62').replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline hover:text-primary-dark"
                                                >
                                                    Hubungi Admin
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <button disabled className="flex items-center justify-center w-full gap-2 rounded-lg h-10 px-6 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium text-sm cursor-not-allowed">
                                            <span>Kontak belum tersedia</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
