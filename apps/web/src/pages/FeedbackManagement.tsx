import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import {
    FEEDBACK_CATEGORY_LABELS,
    FEEDBACK_STATUS_LABELS,
} from '../services/feedbackMockData';
import { Feedback } from '../services/feedback.service';
import { useFeedbacks, useUpdateFeedbackStatus, useMarkFeedbackAsRead } from '../hooks/useFeedback';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const StatusBadge = ({ status }: { status: Feedback['status'] }) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const icons = {
        pending: 'schedule',
        approved: 'check_circle',
        rejected: 'cancel',
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
            <span className="material-symbols-outlined text-[14px]">{icons[status]}</span>
            {FEEDBACK_STATUS_LABELS[status]}
        </span>
    );
};

const CategoryBadge = ({ category }: { category: Feedback['category'] }) => {
    const colors = {
        kategori_baru: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        fitur: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        kritik: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        lainnya: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[category]}`}>
            {FEEDBACK_CATEGORY_LABELS[category]}
        </span>
    );
};

export const FeedbackManagement = () => {
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | Feedback['status']>('all');

    // Use React Query hooks
    const { data: feedbacksData, isLoading } = useFeedbacks();
    const feedbacks = feedbacksData || [];
    const updateStatusMutation = useUpdateFeedbackStatus();
    const markAsReadMutation = useMarkFeedbackAsRead();

    const filteredFeedbacks = filterStatus === 'all'
        ? feedbacks
        : feedbacks.filter(f => f.status === filterStatus);

    const pendingCount = feedbacks.filter(f => f.status === 'pending').length;
    const approvedCount = feedbacks.filter(f => f.status === 'approved').length;
    const rejectedCount = feedbacks.filter(f => f.status === 'rejected').length;

    const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected') => {
        updateStatusMutation.mutate({ id, status: newStatus }, {
            onSuccess: () => {
                if (selectedFeedback?.id === id) {
                    setSelectedFeedback(prev => prev ? { ...prev, status: newStatus, isRead: true } : null);
                }
            }
        });
    };

    const handleMarkAsRead = (id: string, currentIsRead: boolean) => {
        if (!currentIsRead) {
            markAsReadMutation.mutate(id);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col transition-colors duration-200 dark">
            <Navbar />

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-10 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Kotak Saran
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal">
                        Kelola saran dan masukan dari alumni
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">schedule</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Menunggu Review</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedCount}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Disetujui</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400">cancel</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rejectedCount}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ditolak</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Semua ({feedbacks.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Pending ({pendingCount})
                    </button>
                    <button
                        onClick={() => setFilterStatus('approved')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'approved'
                            ? 'bg-green-500 text-white'
                            : 'bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Disetujui ({approvedCount})
                    </button>
                    <button
                        onClick={() => setFilterStatus('rejected')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        Ditolak ({rejectedCount})
                    </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Feedback List */}
                    <div className="lg:col-span-1 space-y-3">
                        {filteredFeedbacks.length === 0 ? (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-xl p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">inbox</span>
                                <p className="text-gray-500 dark:text-gray-400">Tidak ada saran</p>
                            </div>
                        ) : (
                            filteredFeedbacks.map(feedback => (
                                <button
                                    key={feedback.id}
                                    onClick={() => {
                                        setSelectedFeedback(feedback);
                                        handleMarkAsRead(feedback.id, feedback.isRead);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedFeedback?.id === feedback.id
                                        ? 'bg-primary/5 border-primary dark:bg-primary/10'
                                        : 'bg-white dark:bg-card-dark border-gray-200 dark:border-card-border hover:border-primary/50'
                                        } ${!feedback.isRead ? 'ring-2 ring-primary/30' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            {!feedback.isRead && (
                                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                                            )}
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {feedback.isAnonymous ? 'Anonim' : feedback.name}
                                            </span>
                                        </div>
                                        <StatusBadge status={feedback.status} />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                        {feedback.message}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <CategoryBadge category={feedback.category} />
                                        <span className="text-xs text-gray-400">
                                            {new Date(feedback.createdAt).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-2">
                        {selectedFeedback ? (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-xl overflow-hidden">
                                {/* Detail Header */}
                                <div className="p-6 border-b border-gray-200 dark:border-card-border">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                {selectedFeedback.isAnonymous ? 'Anonim' : selectedFeedback.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(selectedFeedback.createdAt)}
                                            </p>
                                        </div>
                                        <StatusBadge status={selectedFeedback.status} />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <CategoryBadge category={selectedFeedback.category} />
                                        {selectedFeedback.isAnonymous && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-[12px] mr-1">visibility_off</span>
                                                Anonim
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Info */}
                                {!selectedFeedback.isAnonymous && (selectedFeedback.email || selectedFeedback.phone) && (
                                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-card-border">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Kontak</p>
                                        <div className="flex flex-wrap gap-4">
                                            {selectedFeedback.email && (
                                                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="material-symbols-outlined text-[18px] text-gray-400">mail</span>
                                                    {selectedFeedback.email}
                                                </div>
                                            )}
                                            {selectedFeedback.phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="material-symbols-outlined text-[18px] text-gray-400">phone</span>
                                                    {selectedFeedback.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Message */}
                                <div className="p-6">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Pesan</p>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {selectedFeedback.message}
                                    </p>
                                </div>

                                {/* Actions */}
                                {selectedFeedback.status === 'pending' && (
                                    <div className="p-6 border-t border-gray-200 dark:border-card-border bg-gray-50 dark:bg-gray-800/50">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            Tindakan untuk saran ini:
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStatusChange(selectedFeedback.id, 'approved')}
                                                className="flex-1 flex items-center justify-center gap-2 h-11 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">check</span>
                                                Setujui
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(selectedFeedback.id, 'rejected')}
                                                className="flex-1 flex items-center justify-center gap-2 h-11 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">close</span>
                                                Tolak
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border rounded-xl p-12 text-center">
                                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">feedback</span>
                                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                    Pilih Saran
                                </h3>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    Klik salah satu saran di samping untuk melihat detail
                                </p>
                            </div>
                        )}
                    </div>
                </div>
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
        </div>
    );
};
