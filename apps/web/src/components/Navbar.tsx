import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    FEEDBACK_CATEGORY_LABELS,
} from '../services/feedbackMockData';
import { Feedback } from '../services/feedback.service';
import { useFeedbacks, useFeedbackUnreadCount } from '../hooks/useFeedback';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const isActive = (path: string) => location.pathname === path;
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Use hooks
    const { data: unreadCount = 0 } = useFeedbackUnreadCount();
    const { data: feedbacksData } = useFeedbacks('pending');

    // Get top 5 pending feedbacks
    const pendingFeedbacks = feedbacksData?.slice(0, 5) || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        return `${diffDays} hari lalu`;
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-card-border bg-white dark:bg-card-dark/80 backdrop-blur-md">
            <div className="px-6 md:px-10 py-3 flex items-center justify-between mx-auto max-w-[1280px]">
                <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                    </div>
                    <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">AlumniFinance</h2>
                </div>
                <div className="hidden md:flex flex-1 justify-center gap-8">
                    <Link
                        to="/"
                        onClick={() => window.scrollTo(0, 0)}
                        className={`font-semibold text-sm leading-normal ${isActive('/') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/reports"
                        onClick={() => window.scrollTo(0, 0)}
                        className={`font-medium text-sm leading-normal transition-colors ${isActive('/reports') ? 'text-primary font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Laporan
                    </Link>
                    <Link
                        to="/transactions"
                        onClick={() => window.scrollTo(0, 0)}
                        className={`font-medium text-sm leading-normal transition-colors ${isActive('/transactions') ? 'text-primary font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Transaksi
                    </Link>
                    <Link
                        to="/settings"
                        onClick={() => window.scrollTo(0, 0)}
                        className={`font-medium text-sm leading-normal transition-colors ${isActive('/settings') ? 'text-primary font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Pengaturan
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {/* Notification Bell - Only for Admin */}
                    {isAdmin && (
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-card-dark">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {isNotifOpen && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-card-border overflow-hidden z-50">
                                    {/* Header */}
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-card-border flex items-center justify-between">
                                        <h4 className="font-bold text-gray-900 dark:text-white">Kotak Saran</h4>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                                                {unreadCount} baru
                                            </span>
                                        )}
                                    </div>

                                    {/* Feedback List */}
                                    <div className="max-h-[280px] overflow-y-auto">
                                        {pendingFeedbacks.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">inbox</span>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada saran baru</p>
                                            </div>
                                        ) : (
                                            pendingFeedbacks.map((feedback: Feedback) => (
                                                <div
                                                    key={feedback.id}
                                                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 ${!feedback.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                    onClick={() => {
                                                        setIsNotifOpen(false);
                                                        navigate('/feedback');
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!feedback.isRead ? 'bg-primary' : 'bg-transparent'}`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                                    {feedback.isAnonymous ? 'Anonim' : feedback.name}
                                                                </span>
                                                                <span className="text-xs text-gray-400 flex-shrink-0">
                                                                    {formatTimeAgo(feedback.createdAt)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                {feedback.message}
                                                            </p>
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                                                                {FEEDBACK_CATEGORY_LABELS[feedback.category]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-4 py-3 border-t border-gray-200 dark:border-card-border bg-gray-50 dark:bg-gray-800/50">
                                        <Link
                                            to="/feedback"
                                            onClick={() => setIsNotifOpen(false)}
                                            className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                                        >
                                            Lihat Semua Saran
                                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium hidden sm:block text-gray-700 dark:text-gray-300">
                                {user.name}
                            </span>
                            <div className="relative group cursor-pointer">
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBRMMW95In2XS4t7klb8q9bFtmIllw4SmO3qgAD1D-iMo5bl4vNMHwCkLr8h1eDeBttSH9h77rqSLZTe_aw-RbAE_-ikxW6oUa3oIGfIRwWSJJiSVJeGXydiYjPZz8CHhqidYU-XXXil_CwPxIN_-xNd1QmWxVTupd03C8Mg8RSBcUXc2n1cvVuBTkZxHteqvWlJWPHZKGz5Ufq1L76KIQIMqbZOfRIa82kyUMa-oU5shH1dAOBALjD5wAQiJ_GRW6KvRc4SpSqed7_")' }}>
                                </div>
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                                    <div className="bg-white dark:bg-card-dark rounded-lg shadow-lg border border-gray-200 dark:border-card-border overflow-hidden">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/25">
                            <span className="material-symbols-outlined text-[20px]">login</span>
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

