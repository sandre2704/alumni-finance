

import { useState } from 'react';
import { useCashFlow, useExpenseBreakdown, useIncomeBreakdown } from '../hooks/useDashboard';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const ChartSection = () => {
    const [months, setMonths] = useState(6);
    const [breakdownTab, setBreakdownTab] = useState<'expense' | 'income'>('expense');

    // Calculate dates for breakdown
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data: cashFlow } = useCashFlow(months);
    const { data: expenseBreakdown } = useExpenseBreakdown(startDateStr, endDateStr);
    const { data: incomeBreakdown } = useIncomeBreakdown(startDateStr, endDateStr);

    const breakdownData = breakdownTab === 'expense' ? expenseBreakdown : incomeBreakdown;

    // Chart logic
    const maxVal = Math.max(...(cashFlow?.map(d => Math.max(d.income, d.expense)) || [1]));
    const totalNet = cashFlow?.reduce((acc, curr) => acc + curr.net, 0) || 0;

    const timeRanges = [
        { label: '1 Bln', value: 1 },
        { label: '3 Bln', value: 3 },
        { label: '6 Bln', value: 6 },
        { label: '1 Thn', value: 12 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Main Chart */}
            <div className="lg:col-span-3 rounded-xl border border-gray-200 dark:border-card-border bg-white dark:bg-card-dark p-6 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-gray-900 dark:text-white text-lg font-bold">Arus Kas</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Periode {months} Bulan Terakhir</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-card-border/30 p-1 rounded-lg">
                        {timeRanges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setMonths(range.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${months === range.value
                                        ? 'bg-white dark:bg-card-dark text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <div className="hidden sm:block text-right">
                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">Net Income</p>
                        <p className={`text-xl font-bold ${totalNet >= 0 ? 'text-primary' : 'text-red-500'}`}>
                            {totalNet >= 0 ? '+' : ''}{formatCurrency(totalNet)}
                        </p>
                    </div>
                </div>

                {/* CSS Bar Chart */}
                <div className="flex-1 w-full min-h-[240px] flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2">
                    {cashFlow?.length === 0 ? (
                        <div className="w-full text-center text-gray-400 self-center">Belum ada data visualisasi untuk periode ini</div>
                    ) : (
                        cashFlow?.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                    <div className="font-bold">{item.month} {item.year}</div>
                                    <div className="text-green-400">In: {formatCurrency(item.income)}</div>
                                    <div className="text-red-400">Out: {formatCurrency(item.expense)}</div>
                                </div>

                                <div className="w-full flex justify-center gap-1 items-end h-[200px]">
                                    {/* Income Bar */}
                                    <div
                                        style={{ height: `${Math.max((item.income / maxVal) * 100, 2)}%` }}
                                        className="w-1/2 bg-blue-500 rounded-t-sm transition-all hover:bg-blue-400"
                                    ></div>
                                    {/* Expense Bar */}
                                    <div
                                        style={{ height: `${Math.max((item.expense / maxVal) * 100, 2)}%` }}
                                        className="w-1/2 bg-red-500 rounded-t-sm transition-all hover:bg-red-400"
                                    ></div>
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 truncate w-full text-center">{item.month}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Breakdown Section */}
            <div className="lg:col-span-1 rounded-xl border border-gray-200 dark:border-card-border bg-white dark:bg-card-dark p-6 shadow-sm flex flex-col">
                <div className="flex bg-gray-100 dark:bg-card-border/30 rounded-lg p-1 mb-4">
                    <button
                        onClick={() => setBreakdownTab('expense')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${breakdownTab === 'expense'
                                ? 'bg-white dark:bg-card-dark text-red-500 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Pengeluaran
                    </button>
                    <button
                        onClick={() => setBreakdownTab('income')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${breakdownTab === 'income'
                                ? 'bg-white dark:bg-card-dark text-green-500 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Pemasukan
                    </button>
                </div>

                {(!breakdownData || breakdownData.length === 0) ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-gray-400 text-center py-8">Belum ada data {breakdownTab === 'income' ? 'pemasukan' : 'pengeluaran'}.</p>
                    </div>
                ) : (
                    <div
                        className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(99, 102, 241, 0.4) transparent'
                        }}
                    >
                        {[...breakdownData].sort((a, b) => b.total - a.total).map((cat, idx) => {
                            const isExpense = breakdownTab === 'expense';
                            const expenseColors = [
                                'bg-red-500/10 border-l-red-500 text-red-500',
                                'bg-orange-500/10 border-l-orange-500 text-orange-500',
                                'bg-yellow-500/10 border-l-yellow-500 text-yellow-600',
                                'bg-pink-500/10 border-l-pink-500 text-pink-500',
                            ];
                            const incomeColors = [
                                'bg-green-500/10 border-l-green-500 text-green-500',
                                'bg-teal-500/10 border-l-teal-500 text-teal-500',
                                'bg-cyan-500/10 border-l-cyan-500 text-cyan-600',
                                'bg-blue-500/10 border-l-blue-500 text-blue-500',
                            ];

                            const palette = isExpense ? expenseColors : incomeColors;
                            const styleClass = palette[idx % palette.length];

                            return (
                                <div
                                    key={cat.categoryId}
                                    className={`group flex items-center gap-3 p-3 rounded-lg ${styleClass.split(' ')[0]} ${styleClass.split(' ')[1]} border-l-4 hover:translate-x-1 transition-all duration-200 cursor-pointer`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate" title={cat.categoryName}>
                                            {cat.categoryName}
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(cat.total)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-bold ${styleClass.split(' ')[2]}`}>{Math.round(cat.percentage)}%</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
