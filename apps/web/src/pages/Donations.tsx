import { Link } from 'react-router-dom';

import { useDonationTargets } from '../hooks/useDonationTargets';
import { DonationTarget } from '../services/donation-targets.service';
import { FeedbackSection } from '../components/FeedbackSection';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Icon and color mapping
const iconColors = [
    { iconColor: 'text-blue-600 dark:text-blue-400', iconBgColor: 'bg-blue-100 dark:bg-blue-900/30', progressBarColor: 'bg-gradient-to-r from-blue-500 to-primary', cardBorder: 'border-blue-200 dark:border-blue-800/50' },
    { iconColor: 'text-emerald-600 dark:text-emerald-400', iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/30', progressBarColor: 'bg-gradient-to-r from-emerald-500 to-green-400', cardBorder: 'border-emerald-200 dark:border-emerald-800/50' },
    { iconColor: 'text-orange-600 dark:text-orange-400', iconBgColor: 'bg-orange-100 dark:bg-orange-900/30', progressBarColor: 'bg-gradient-to-r from-orange-500 to-amber-400', cardBorder: 'border-orange-200 dark:border-orange-800/50' },
    { iconColor: 'text-purple-600 dark:text-purple-400', iconBgColor: 'bg-purple-100 dark:bg-purple-900/30', progressBarColor: 'bg-gradient-to-r from-purple-500 to-pink-400', cardBorder: 'border-purple-200 dark:border-purple-800/50' },
    { iconColor: 'text-rose-600 dark:text-rose-400', iconBgColor: 'bg-rose-100 dark:bg-rose-900/30', progressBarColor: 'bg-gradient-to-r from-rose-500 to-red-400', cardBorder: 'border-rose-200 dark:border-rose-800/50' },
    { iconColor: 'text-cyan-600 dark:text-cyan-400', iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/30', progressBarColor: 'bg-gradient-to-r from-cyan-500 to-teal-400', cardBorder: 'border-cyan-200 dark:border-cyan-800/50' },
];

const icons = ['campaign', 'school', 'mosque', 'medical_services', 'volunteer_activism', 'biotech'];

const getColorIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % iconColors.length;
};

export const Donations = () => {
    const { data: donations, isLoading } = useDonationTargets();
    const donationList = donations || [];

    // Calculate total stats
    const totalTarget = donationList.reduce((sum, d) => sum + parseFloat(d.targetAmount), 0);
    const totalCollected = donationList.reduce((sum, d) => sum + parseFloat(d.currentAmount), 0);
    const overallPercentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display flex flex-col transition-colors duration-200 dark">

            <main className="flex-1 w-full">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary via-blue-600 to-purple-700 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 py-16 md:py-24">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 text-center md:text-left">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-semibold mb-4">
                                    <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                                    Program Donasi Alumni
                                </span>
                                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                                    Mari Berbagi untuk<br className="hidden md:block" /> Masa Depan Lebih Baik
                                </h1>
                                <p className="text-white/80 text-lg max-w-xl mb-8">
                                    Setiap kontribusi Anda membantu program pendidikan, beasiswa, dan kegiatan sosial alumni.
                                    Bersama kita bisa memberikan dampak nyata.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <a href="#programs" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                        <span className="material-symbols-outlined">campaign</span>
                                        Lihat Program
                                    </a>
                                    <Link to="/transactions" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">
                                        <span className="material-symbols-outlined">receipt_long</span>
                                        Riwayat Transaksi
                                    </Link>
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="w-full md:w-auto">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8 text-white min-w-[300px]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl">trending_up</span>
                                        </div>
                                        <div>
                                            <p className="text-white/70 text-sm font-medium">Total Terkumpul</p>
                                            <p className="text-2xl font-black">{formatCurrency(totalCollected)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/70">Target Keseluruhan</span>
                                            <span className="font-semibold">{formatCurrency(totalTarget)}</span>
                                        </div>
                                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-emerald-400 to-green-300 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${overallPercentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/70">{donationList.length} Program Aktif</span>
                                            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-300 rounded-full font-bold">{overallPercentage}% tercapai</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Programs Section */}
                <section id="programs" className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 md:py-16">
                    <div className="text-center mb-10">
                        <h2 className="text-gray-900 dark:text-white text-3xl font-black mb-3">Program Donasi Aktif</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Pilih program yang ingin Anda dukung. Setiap donasi akan digunakan sesuai peruntukan dan dilaporkan secara transparan.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="flex items-center gap-3 text-gray-500">
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                <span>Memuat program...</span>
                            </div>
                        </div>
                    ) : donationList.length === 0 ? (
                        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-card-border p-12 text-center">
                            <div className="size-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <span className="material-symbols-outlined text-4xl">campaign</span>
                            </div>
                            <h3 className="text-gray-900 dark:text-white text-xl font-bold mb-2">Belum Ada Program Aktif</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Saat ini belum ada program donasi yang sedang berjalan. Silakan cek kembali nanti atau hubungi pengurus alumni.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {donationList.map((donation: DonationTarget) => {
                                const colorIndex = getColorIndex(donation.id);
                                const colors = iconColors[colorIndex];
                                const icon = icons[colorIndex];
                                const currentAmount = parseFloat(donation.currentAmount);
                                const targetAmount = parseFloat(donation.targetAmount);
                                const percentage = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;

                                return (
                                    <div
                                        key={donation.id}
                                        className={`group rounded-2xl border-2 ${colors.cardBorder} bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`size-14 rounded-xl ${colors.iconBgColor} flex items-center justify-center ${colors.iconColor} group-hover:scale-110 transition-transform`}>
                                                <span className="material-symbols-outlined text-2xl">{icon}</span>
                                            </div>
                                            {percentage === 100 && (
                                                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                                                    Tercapai ✓
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-2 line-clamp-1">{donation.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                            {donation.description || 'Program donasi untuk kegiatan dan pengembangan alumni.'}
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Terkumpul</p>
                                                    <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(currentAmount)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Target</p>
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{formatCurrency(targetAmount)}</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`${colors.progressBarColor} h-full rounded-full transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-sm font-bold ${colors.iconColor}`}>{percentage}% tercapai</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* How to Donate Section */}
                <section className="bg-gray-50 dark:bg-card-dark/50 py-12 md:py-16">
                    <div className="max-w-[1280px] mx-auto px-6 md:px-10">
                        <div className="text-center mb-10">
                            <h2 className="text-gray-900 dark:text-white text-3xl font-black mb-3">Cara Berdonasi</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                                Ikuti langkah mudah berikut untuk menyalurkan donasi Anda.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-card-border">
                                <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                                    <span className="material-symbols-outlined text-3xl">person_add</span>
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">1. Login / Daftar</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Masuk ke akun alumni Anda atau daftar jika belum memiliki akun.
                                </p>
                            </div>
                            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-card-border">
                                <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                                    <span className="material-symbols-outlined text-3xl">payments</span>
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">2. Input Transaksi</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Pilih menu Transaksi, lalu input pemasukan dengan memilih target donasi.
                                </p>
                            </div>
                            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-card-border">
                                <div className="size-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
                                    <span className="material-symbols-outlined text-3xl">verified</span>
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">3. Selesai!</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Donasi Anda tercatat dan dapat dilihat di laporan transaksi secara transparan.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-10">
                            <Link
                                to="/transactions"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Mulai Berdonasi Sekarang
                            </Link>
                        </div>
                    </div>
                </section>
            </main>



            {/* Floating Feedback Button */}
            <FeedbackSection />
        </div>
    );
};
