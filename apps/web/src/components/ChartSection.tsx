

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
    const [chartType, setChartType] = useState<'cashflow' | 'balance'>('cashflow');

    const breakdownData = breakdownTab === 'expense' ? expenseBreakdown : incomeBreakdown;

    // Chart logic
    // For Bar Chart
    const maxVal = Math.max(...(cashFlow?.map(d => Math.max(d.income, d.expense)) || [1]));

    // For Line Chart
    // Assuming cashFlow now has 'balance' field from backend update
    const balanceData = cashFlow?.map(d => d.balance) || [];
    const minBalance = Math.min(...balanceData, 0);
    const maxBalance = Math.max(...balanceData, 1000000); // Default scale if empty
    const balanceRange = maxBalance - minBalance;

    // Helper to get coordinates for 600x200 viewBox
    const getCoordinates = (index: number, value: number) => {
        if (!cashFlow || cashFlow.length === 0) return [0, 0];

        // X: 0 to 600
        const x = (index / (cashFlow.length - 1)) * 600;

        // Y: 0 to 200 (20 padding top/bottom)
        // Invert Y so higher value is lower Y coordinate
        const normalizedValue = (value - minBalance) / (balanceRange || 1);
        const y = 180 - (normalizedValue * 160); // 180 (bottom) to 20 (top)

        return [x, y];
    };

    // Helper to generate smooth SVG path (Catmull-Rom spline logic adapted for simple cubic bezier)
    const generateSmoothPath = (points: number[][]) => {
        if (points.length === 0) return '';
        if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;

        let d = `M ${points[0][0]},${points[0][1]}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i === 0 ? 0 : i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;

            const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
            const cp1y = p1[1] + (p2[1] - p0[1]) / 6;

            const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
            const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
        }
        return d;
    };

    const points = cashFlow?.map((d, i) => getCoordinates(i, d.balance)) || [];
    const linePath = generateSmoothPath(points);

    // Area closes to the bottom (200)
    const areaPath = points.length ? `${linePath} V 200 H ${points[0][0]} Z` : '';

    const totalNet = cashFlow?.reduce((acc, curr) => acc + curr.net, 0) || 0;

    // Date Range String
    const startMonth = cashFlow?.[0];
    const endMonth = cashFlow?.[cashFlow?.length - 1];
    const periodString = startMonth && endMonth
        ? `${startMonth.month} ${startMonth.year} - ${endMonth.month} ${endMonth.year}`
        : '';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Main Chart */}
            <div className="lg:col-span-3 rounded-xl border border-gray-200 dark:border-card-border bg-white dark:bg-card-dark p-6 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold">
                                {chartType === 'cashflow' ? 'Arus Kas' : 'Tren Saldo'}
                            </h3>
                            {/* Chart Toggle */}
                            <div className="flex bg-gray-100 dark:bg-card-border/30 p-0.5 rounded-lg">
                                <button
                                    onClick={() => setChartType('cashflow')}
                                    className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold transition-all ${chartType === 'cashflow'
                                        ? 'bg-white dark:bg-card-dark text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    Bar
                                </button>
                                <button
                                    onClick={() => setChartType('balance')}
                                    className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold transition-all ${chartType === 'balance'
                                        ? 'bg-white dark:bg-card-dark text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    Line
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {months} Bulan Terakhir {periodString && `(${periodString})`}
                        </p>
                    </div>


                    {/* Period Toggle & Net Income moved/kept */}
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="hidden sm:block text-right">
                            {chartType === 'cashflow' ? (
                                <>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">Net Income</p>
                                    <p className={`text-xl font-bold ${totalNet >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                        {totalNet >= 0 ? '+' : ''}{formatCurrency(totalNet)}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">End Balance</p>
                                    <p className={`text-xl font-bold ${(balanceData[balanceData.length - 1] || 0) >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                        {formatCurrency(balanceData[balanceData.length - 1] || 0)}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 w-full relative pt-4">
                    {cashFlow?.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 min-h-[240px]">Belum ada data</div>
                    ) : (
                        <>
                            {chartType === 'cashflow' ? (
                                <div className="flex flex-col h-full min-h-[240px]">
                                    <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 pb-2">
                                        {cashFlow?.map((item, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                                    <div className="font-bold">{item.month} {item.year}</div>
                                                    <div className="text-green-400">In: {formatCurrency(item.income)}</div>
                                                    <div className="text-red-400">Out: {formatCurrency(item.expense)}</div>
                                                </div>
                                                <div className="w-full flex justify-center gap-1 items-end h-[85%]">
                                                    <div style={{ height: `${Math.max((item.income / maxVal) * 100, 2)}%` }} className="w-1/2 bg-blue-500 rounded-t-sm hover:bg-blue-400 transition-all"></div>
                                                    <div style={{ height: `${Math.max((item.expense / maxVal) * 100, 2)}%` }} className="w-1/2 bg-red-500 rounded-t-sm hover:bg-red-400 transition-all"></div>
                                                </div>
                                                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 truncate w-full text-center">{item.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full">
                                    {/* SVG Line Chart */}
                                    <svg className="w-full h-[85%] overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                                        {/* Grid Lines */}
                                        <line className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeWidth="1" x1="0" x2="600" y1="40" y2="40"></line>
                                        <line className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeWidth="1" x1="0" x2="600" y1="80" y2="80"></line>
                                        <line className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeWidth="1" x1="0" x2="600" y1="120" y2="120"></line>
                                        <line className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeWidth="1" x1="0" x2="600" y1="160" y2="160"></line>

                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#2424eb" stopOpacity="0.3"></stop>
                                                <stop offset="100%" stopColor="#2424eb" stopOpacity="0"></stop>
                                            </linearGradient>
                                        </defs>

                                        {/* Paths */}
                                        <path d={areaPath} fill="url(#chartGradient)"></path>
                                        <path d={linePath} fill="none" stroke="#2424eb" strokeLinecap="round" strokeWidth="3" className="drop-shadow-sm"></path>

                                        {/* Dots */}
                                        {points.map((p, i) => {
                                            const data = cashFlow ? cashFlow[i] : null;
                                            // Tooltip positioning logic to prevent clipping
                                            let translateX = -60; // Default center (120/2)
                                            if (i === 0) translateX = -10; // First item: slight left shift but mostly right-aligned
                                            if (i === points.length - 1) translateX = -110; // Last item: shift left

                                            return (
                                                <g key={i} className="group">
                                                    <circle className="fill-white dark:fill-card-dark stroke-primary cursor-pointer hover:stroke-[3px] transition-all" cx={p[0]} cy={p[1]} r="4" strokeWidth="2"></circle>
                                                    {/* Tooltip on hover */}
                                                    <foreignObject x={p[0]} y={0} width="120" height="100" className="overflow-visible pointer-events-none" style={{ transform: `translate(${translateX}px, ${p[1] - 50}px)` }}>
                                                        <div className={`hidden group-hover:flex flex-col justify-center bg-gray-900 text-white text-xs rounded-lg py-1.5 px-3 shadow-xl whitespace-nowrap w-max ${i === 0 ? 'items-start' : i === points.length - 1 ? 'items-end' : 'items-center mx-auto'}`}>
                                                            <div className="font-semibold">{data?.month} {data?.year}</div>
                                                            <div className="font-bold text-green-300">
                                                                {formatCurrency(data?.balance || 0)}
                                                            </div>
                                                        </div>
                                                    </foreignObject>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                    <div className="flex justify-between mt-4 px-2">
                                        {cashFlow?.map((d, i) => (
                                            <span
                                                key={i}
                                                className={`text-[10px] sm:text-xs font-semibold text-gray-400 ${i === 0 ? 'text-left' : i === cashFlow.length - 1 ? 'text-right' : 'text-center'}`}
                                                style={{ width: `${100 / cashFlow.length}%` }}
                                            >
                                                {d.month}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
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
