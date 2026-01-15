import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { StatsCard } from '../components/StatsCard';
import { TransactionTable } from '../components/TransactionTable';
import { ChartSection } from '../components/ChartSection';
import { DonationTargetSection } from '../components/DonationTargetSection';
import { BudgetSection } from '../components/BudgetSection';
import { FeedbackSection } from '../components/FeedbackSection';
import { useDashboardStats } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export const Dashboard = () => {
    const { data: stats, isLoading } = useDashboardStats();
    const { isAdmin, user } = useAuth();

    // Display user's name if logged in, otherwise "Alumni"
    const displayName = user?.name || 'Alumni';

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col transition-colors duration-200 dark">
            <Navbar />

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-10 py-8">
                {/* Page Heading & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Dashboard Keuangan</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base font-normal">Halo, {displayName}. Berikut ringkasan arus kas alumni terkini.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 h-11 px-5 rounded-lg border border-gray-200 dark:border-card-border bg-transparent hover:bg-gray-100 dark:hover:bg-card-border text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors">
                            <span className="material-symbols-outlined text-[20px]">file_download</span>
                            <span className="hidden sm:inline">Export Laporan</span>
                        </button>
                        <Link to="/transactions" className="flex items-center gap-2 h-11 px-5 rounded-lg bg-primary hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all">
                            <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            <span>Tambah Transaksi</span>
                        </Link>
                    </div>
                </div>

                {/* Quick Actions - Only visible for admin */}
                {isAdmin && (
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">Akses Cepat:</p>
                        <Link to="/settings" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-lg">category</span>
                            Kelola Kategori
                        </Link>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-lg">pie_chart</span>
                            Analisis Budget
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            Bulanan (PDF)
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Saldo Total"
                        amount={isLoading ? 'Loading...' : formatCurrency(stats?.totalBalance || 0)}
                        trend="+12%"
                        trendLabel="vs bulan lalu"
                        trendUp={true}
                        icon="wallet"
                        bgIcon="account_balance"
                    />
                    <StatsCard
                        title="Pemasukan Bulan Ini"
                        amount={isLoading ? 'Loading...' : formatCurrency(stats?.monthlyIncome || 0)}
                        trend="+5%"
                        trendLabel="vs bulan lalu"
                        trendUp={true}
                        icon="arrow_circle_down"
                        bgIcon="payments"
                        bgIconColor="text-green-500"
                    />
                    <StatsCard
                        title="Pengeluaran Bulan Ini"
                        amount={isLoading ? 'Loading...' : formatCurrency(stats?.monthlyExpense || 0)}
                        trend="-2%"
                        trendLabel="lebih hemat"
                        trendUp={false} // False means "Down", which is usually bad, but for expense it might be good? The simple logic in StatsCard is Red if !trendUp. But actually for Expense, "Down" is green (good). 
                        // However, StatsCard logic is: trendUp ? Green : Red. 
                        // If expense went DOWN (-2%), that's GOOD (Green). But standard logic says "Down" is Red pill? 
                        // Let's look at StatsCard again.
                        // trendUp ? 'bg-green text-green' : 'bg-red text-red'.
                        // So if I want Green pill for Expense Down, I should pass trendUp={true} physically, but logical meaning is mixed.
                        // Let's stick to conventional: Up = Green, Down = Red(or Orange). 
                        // Actually, for expense, if it's DOWN, it's GOOD -> Green.
                        // If I pass trendUp={true}, it shows GREEN + Arrow UP. Which is confusing if value is "-2%".
                        // I probably need `trendColor` prop to override.
                        // For now I'll just set it to `trendUp={false}` (Red/Down) to match the arrow direction, even if contextually "saving money" is good. Or I can mock it as "+8%" (Spending rose).
                        icon="arrow_circle_up"
                        bgIcon="shopping_cart_checkout"
                        bgIconColor="text-red-500"
                    />
                </div>

                <ChartSection />

                <BudgetSection />

                <DonationTargetSection />

                <TransactionTable />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-card-border mt-auto bg-white dark:bg-card-dark py-8">
                <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">© 2023 AlumniFinance. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
                        <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Syarat &amp; Ketentuan</a>
                        <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Bantuan</a>
                    </div>
                </div>
            </footer>

            {/* Floating Feedback Button */}
            <FeedbackSection />
        </div>
    );
};
