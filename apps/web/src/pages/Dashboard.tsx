import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../components/StatsCard';
import { TransactionTable } from '../components/TransactionTable';
import { ChartSection } from '../components/ChartSection';
import { DonationTargetSection } from '../components/DonationTargetSection';
import { BudgetSection } from '../components/BudgetSection';
import { FeedbackSection } from '../components/FeedbackSection';
import { useDashboardStats } from '../hooks/useDashboard';
import { TransactionModal } from '../components/TransactionModal';

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
    const { user } = useAuth();
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // Display user's name if logged in, otherwise "Alumni"
    const displayName = user?.name || 'Alumni';

    return (
        <div className="bg-background-light dark:bg-background-dark font-display flex flex-col transition-colors duration-200 dark">
            <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-10 py-8">
                {/* Page Heading & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Dashboard Keuangan</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base font-normal">Halo, {displayName}. Berikut ringkasan arus kas alumni terkini.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to="/reports" className="flex items-center gap-2 h-11 px-5 rounded-lg border border-gray-200 dark:border-card-border bg-transparent hover:bg-gray-100 dark:hover:bg-card-border text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors">
                            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                            <span className="hidden sm:inline">Laporan Detail</span>
                        </Link>
                        {user && (
                            <button
                                onClick={() => setIsTransactionModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium h-11 px-5 rounded-lg transition-colors shadow-lg shadow-primary/25"
                            >
                                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                <span>Tambah Transaksi</span>
                            </button>
                        )}
                    </div>
                </div>


                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Saldo Total"
                        amount={isLoading ? 'Loading...' : formatCurrency(stats?.totalBalance || 0)}
                        trend={`${stats?.totalBalanceTrend && stats.totalBalanceTrend > 0 ? '+' : ''}${stats?.totalBalanceTrend || 0}%`}
                        trendLabel="vs bulan lalu"
                        trendUp={(stats?.totalBalanceTrend || 0) >= 0}
                        icon="wallet"
                        bgIcon="account_balance"
                    />
                    <StatsCard
                        title="Pemasukan Bulan Ini"
                        amount={isLoading ? 'Loading...' : formatCurrency(stats?.monthlyIncome || 0)}
                        trend={`${stats?.monthlyIncomeTrend && stats.monthlyIncomeTrend > 0 ? '+' : ''}${stats?.monthlyIncomeTrend || 0}%`}
                        trendLabel="vs bulan lalu"
                        trendUp={(stats?.monthlyIncomeTrend || 0) >= 0}
                        icon="arrow_circle_down"
                        bgIcon="payments"
                        bgIconColor="text-green-500"
                    />
                    <StatsCard
                        title="Pengeluaran Bulan Ini"
                        amount={isLoading ? 'Loading...' : formatCurrency(stats?.monthlyExpense || 0)}
                        trend={`${stats?.monthlyExpenseTrend && stats.monthlyExpenseTrend > 0 ? '+' : ''}${stats?.monthlyExpenseTrend || 0}%`}
                        trendLabel="vs bulan lalu"
                        trendUp={(stats?.monthlyExpenseTrend || 0) >= 0}
                        inverse={true} // Expense: Up is Bad (Red), Down is Good (Green)
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



            {/* Floating Feedback Button */}
            <FeedbackSection />

            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
            />
        </div>
    );
};
