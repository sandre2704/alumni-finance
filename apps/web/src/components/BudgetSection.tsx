import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStatus, BudgetStatus } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import { BudgetDetailModal } from './BudgetDetailModal';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const BudgetSection = () => {
    const navigate = useNavigate();
    const { data: budgets, isLoading } = useBudgetStatus();
    const { isAdmin } = useAuth();
    const [selectedBudget, setSelectedBudget] = useState<BudgetStatus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = (budget: BudgetStatus) => {
        setSelectedBudget(budget);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBudget(null);
    };

    if (isLoading) return <div className="text-center py-4 text-gray-400">Loading budget data...</div>;

    if (!budgets || budgets.length === 0) {
        return (
            <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900 dark:text-white text-xl font-bold">Anggaran vs Realisasi</h3>
                    {isAdmin && (
                        <button onClick={() => navigate('/settings')} className="text-sm text-primary font-semibold hover:underline">Atur Anggaran</button>
                    )}
                </div>
                <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border p-6 rounded-xl shadow-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Belum ada anggaran yang diatur.</p>
                    <p className="text-sm text-gray-400">Pergi ke menu Pengaturan &gt; Kategori untuk mengatur budget bulanan.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 dark:text-white text-xl font-bold">Anggaran vs Realisasi</h3>
                {isAdmin && (
                    <button onClick={() => navigate('/settings')} className="text-sm text-primary font-semibold hover:underline">Atur Anggaran</button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.map((item) => {
                    const percentage = Math.min(100, item.percentage);
                    const isOverBudget = item.actual > item.budget;

                    return (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border p-5 rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                            onClick={() => handleCardClick(item)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">{item.category}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {item.percentage}%
                                </span>
                            </div>

                            <div className="flex justify-between text-sm mb-2 text-gray-500 dark:text-gray-400">
                                <span>Terpakai: <span className={isOverBudget ? 'text-red-500 font-semibold' : 'text-gray-700 dark:text-gray-300'}>{formatCurrency(item.actual)}</span></span>
                                <span>Budget: {formatCurrency(item.budget)}</span>
                            </div>

                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            {isOverBudget && <p className="text-xs text-red-500 mt-2 font-medium">Melebihi anggaran sebesar {formatCurrency(item.actual - item.budget)}</p>}
                        </div>
                    );
                })}
            </div>

            <BudgetDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                budget={selectedBudget}
            />
        </section>
    );
};
