

interface StatsCardProps {
    title: string;
    amount: string;
    trend: string;
    trendUp?: boolean;
    trendLabel?: string;
    icon: string;
    bgIcon?: string;
    bgIconColor?: string;
    inverse?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, amount, trend, trendUp = true, trendLabel, icon, bgIcon, bgIconColor, inverse = false }) => {
    // Determine color based on trendUp and inverse
    // Standard: Up=Green (Good), Down=Red (Bad)
    // Inverse: Up=Red (Bad), Down=Green (Good)
    const isPositive = inverse ? !trendUp : trendUp;
    const colorClass = isPositive
        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
        : 'bg-red-500/10 text-red-600 dark:text-red-400';

    return (
        <div className="relative overflow-hidden rounded-xl p-6 bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border shadow-sm group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className={`material-symbols-outlined text-8xl ${bgIconColor || 'text-primary'}`}>{bgIcon || icon}</span>
            </div>
            <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                    <p className="text-sm font-semibold uppercase tracking-wider">{title}</p>
                </div>
                <p className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">{amount}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`${colorClass} text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-sm">{trendUp ? 'trending_up' : 'trending_down'}</span>
                        {trend}
                    </span>
                    {trendLabel && <span className="text-gray-400 text-xs">{trendLabel}</span>}
                </div>
            </div>
        </div>
    );
};
