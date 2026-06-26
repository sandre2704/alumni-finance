import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';



interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed?: boolean;
}

export const Sidebar = ({ isOpen, onClose, isCollapsed = false }: SidebarProps) => {
    const location = useLocation();
    const { user } = useAuth();
    const isActive = (path: string) => location.pathname === path;






    const navLinks = [
        { path: '/', label: 'Dashboard', icon: 'dashboard' },
        { path: '/reports', label: 'Laporan', icon: 'bar_chart' },
        { path: '/transactions', label: 'Transaksi', icon: 'receipt_long' },
        ...(user ? [{ path: '/approvals', label: 'Persetujuan', icon: 'fact_check' }] : []),
        { path: '/donations', label: 'Donasi', icon: 'volunteer_activism' },
        { path: '/donation-info', label: 'Info Transfer', icon: 'info' },
        ...(user ? [{ path: '/settings', label: 'Pengaturan', icon: 'settings' }] : []),
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-card-dark border-r border-gray-200 dark:border-card-border transform transition-all duration-300 ease-in-out 
                    ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}
                    md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={`flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ${isCollapsed ? 'p-4 justify-center' : 'p-6'}`}>
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                        </div>
                        <h2 className={`text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            AlumniFinance
                        </h2>
                        <button
                            onClick={onClose}
                            className="ml-auto md:hidden p-1 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className={`flex-1 overflow-y-auto overflow-x-hidden py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={onClose}
                                    title={isCollapsed ? link.label : ''}
                                    className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
                                        } ${isActive(link.path)
                                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${isActive(link.path) ? 'text-white' : ''}`}>
                                        {link.icon}
                                    </span>
                                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                                        {link.label}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Footer Area */}
                    <div className={`p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 p-0' : 'opacity-100'}`}>
                        <p className="text-xs text-center text-gray-400">
                            AlumniFinance v1.0
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};
