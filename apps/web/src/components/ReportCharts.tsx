

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useReportIncomeBreakdown, useReportExpenseBreakdown, useReportDailyCashFlow } from '../hooks/useReports';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

const getConicGradient = (data: { percentage: number }[]) => {
    let current = 0;
    const parts = data.map((item, index) => {
        const start = current;
        current += item.percentage;
        const color = COLORS[index % COLORS.length];
        return `${color} ${start}% ${current}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

interface ReportChartsProps {
    startDate?: string;
    endDate?: string;
}

export const ReportCharts = ({ startDate, endDate }: ReportChartsProps) => {
    const { data: cashFlow, isLoading } = useReportDailyCashFlow(startDate, endDate);
    const { data: incomeBreakdown } = useReportIncomeBreakdown(startDate, endDate);
    const { data: expenseBreakdown } = useReportExpenseBreakdown(startDate, endDate);

    // Calculate totals for center text
    const totalIncome = incomeBreakdown?.reduce((acc, curr) => acc + curr.total, 0) || 0;
    const totalExpense = expenseBreakdown?.reduce((acc, curr) => acc + curr.total, 0) || 0;

    // Chart Options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#94a3b8', // text-slate-400
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: '#0f172a',
                titleColor: '#f8fafc',
                bodyColor: '#f8fafc',
                borderColor: '#334155',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    color: '#334155', // slate-700
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                }
            },
            y: {
                grid: {
                    color: '#334155',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    callback: function (value: any) {
                        return formatCurrency(value).replace(',00', '').replace('Rp', ''); // Shorten
                    }
                },
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    // Chart Data
    const data = {
        labels: cashFlow?.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        }) || [],
        datasets: [
            {
                label: 'Pemasukan',
                data: cashFlow?.map(item => item.income) || [],
                borderColor: '#10b981', // emerald-500
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Pengeluaran',
                data: cashFlow?.map(item => item.expense) || [],
                borderColor: '#ef4444', // rose-500
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    return (
        <>
            {/* Main Chart: Cash Flow Trend */}
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-white text-lg font-bold">Arus Kas</h3>
                        <p className="text-text-secondary text-sm">Perbandingan pemasukan dan pengeluaran</p>
                    </div>
                </div>

                {/* Chart Container */}
                <div className="relative flex-1 w-full min-h-0">
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary">Loading chart...</div>
                    ) : (
                        (!cashFlow || cashFlow.length === 0) ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary gap-2">
                                <span className="material-symbols-outlined text-4xl opacity-50">bar_chart_off</span>
                                <span className="text-sm">Data tidak tersedia untuk periode ini</span>
                            </div>
                        ) : (
                            <Line options={options} data={data} />
                        )
                    )}
                </div>
            </div>

            {/* Breakdown Charts (Pie) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Income Pie */}
                <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                    <h3 className="text-white text-lg font-bold mb-6">Pemasukan per Kategori</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="relative size-48 rounded-full flex items-center justify-center shrink-0" style={{
                            background: incomeBreakdown && incomeBreakdown.length > 0
                                ? getConicGradient(incomeBreakdown)
                                : '#374151'
                        }}>
                            <div className="absolute size-32 bg-surface-dark rounded-full flex flex-col items-center justify-center">
                                <span className="text-text-secondary text-xs">Total</span>
                                <span className="text-white font-bold text-lg">{formatCurrency(totalIncome).replace('Rp', '')}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full">
                            {incomeBreakdown?.map((item, idx) => (
                                <div key={item.categoryId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="size-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                        <span className="text-sm text-white">{item.categoryName}</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">{item.percentage}%</span>
                                </div>
                            ))}
                            {(!incomeBreakdown || incomeBreakdown.length === 0) && (
                                <p className="text-text-secondary text-sm">Belum ada data pemasukan.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expense Pie */}
                <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
                    <h3 className="text-white text-lg font-bold mb-6">Pengeluaran per Kategori</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="relative size-48 rounded-full flex items-center justify-center shrink-0" style={{
                            background: expenseBreakdown && expenseBreakdown.length > 0
                                ? getConicGradient(expenseBreakdown)
                                : '#374151'
                        }}>
                            <div className="absolute size-32 bg-surface-dark rounded-full flex flex-col items-center justify-center">
                                <span className="text-text-secondary text-xs">Total</span>
                                <span className="text-white font-bold text-lg">{formatCurrency(totalExpense).replace('Rp', '')}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full">
                            {expenseBreakdown?.map((item, idx) => (
                                <div key={item.categoryId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="size-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                        <span className="text-sm text-white">{item.categoryName}</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">{item.percentage}%</span>
                                </div>
                            ))}
                            {(!expenseBreakdown || expenseBreakdown.length === 0) && (
                                <p className="text-text-secondary text-sm">Belum ada data pengeluaran.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
