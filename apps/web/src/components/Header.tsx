import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFeedbacks, useFeedbackUnreadCount } from '../hooks/useFeedback';
import { Feedback } from '../services/feedback.service';

interface HeaderProps {
    onOpenSidebar: () => void;
    isCollapsed?: boolean;
}

export const Header = ({ onOpenSidebar, isCollapsed }: HeaderProps) => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Notification Data
    const { data: unreadCount = 0 } = useFeedbackUnreadCount();
    const { data: feedbacksData } = useFeedbacks('pending');
    const pendingFeedbacks = feedbacksData?.slice(0, 5) || [];

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

        if (diffMins < 60) return `${diffMins} mnt lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        return `${diffDays} hari lalu`;
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-card-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-card-border px-4 py-3 md:px-8 md:py-4 flex items-center justify-between">
            {/* Left Side: Mobile Toggle & Brand (Mobile Only) / Title (Desktop) */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isCollapsed ? 'menu_open' : 'menu'}
                    </span>
                </button>

                {/* Mobile Brand */}
                <div className="flex md:hidden items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">AlumniFinance</h1>
                </div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-3 md:gap-4 ml-auto">
                {/* Notification Bell (Admin Only) */}
                {isAdmin && (
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all relative"
                        >
                            <span className="material-symbols-outlined text-[24px]">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-card-dark"></span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotifOpen && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-card-border overflow-hidden z-[60] origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-card-border flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Notifikasi</h4>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                                            {unreadCount} baru
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {pendingFeedbacks.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">notifications_off</span>
                                            <p className="text-sm text-gray-500">Tidak ada notifikasi baru</p>
                                        </div>
                                    ) : (
                                        pendingFeedbacks.map((feedback: Feedback) => (
                                            <div
                                                key={feedback.id}
                                                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors ${!feedback.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                onClick={() => {
                                                    setIsNotifOpen(false);
                                                    navigate('/feedback');
                                                }}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!feedback.isRead ? 'bg-primary' : 'bg-transparent'}`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            Saran Baru: {feedback.category.replace('_', ' ')}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                                                            {feedback.message}
                                                        </p>
                                                        <span className="text-[10px] text-gray-400 mt-1.5 block">
                                                            {formatTimeAgo(feedback.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-2 border-t border-gray-200 dark:border-card-border bg-gray-50 dark:bg-gray-800/50 text-center">
                                    <Link
                                        to="/feedback"
                                        onClick={() => setIsNotifOpen(false)}
                                        className="text-xs font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1"
                                    >
                                        Lihat Semua <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                {/* User Profile */}
                {user ? (
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 md:gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full md:rounded-xl p-1 md:pr-4 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                            <div className="size-8 md:size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm md:text-base border border-primary/20">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm leading-none">{user.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.role}</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 hidden md:block">expand_more</span>
                        </button>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-card-border overflow-hidden z-[60] origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-gray-200 dark:border-card-border md:hidden">
                                    <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        to="/settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">settings</span>
                                        Pengaturan
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">logout</span>
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/25"
                    >
                        <span className="material-symbols-outlined text-[20px]">login</span>
                        <span>Login</span>
                    </Link>
                )}
            </div>
        </header>
    );
};
