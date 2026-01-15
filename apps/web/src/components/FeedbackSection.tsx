import { useState } from 'react';
import { FEEDBACK_CATEGORY_LABELS, Feedback } from '../services/feedbackMockData';
import { useAuth } from '../hooks/useAuth';
import { useCreateFeedback } from '../hooks/useFeedback';

interface FeedbackFormData {
    name: string;
    email: string;
    phone: string;
    isAnonymous: boolean;
    message: string;
    category: Feedback['category'];
}

export const FeedbackSection = () => {
    const { isAdmin } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const createFeedbackMutation = useCreateFeedback();

    const [formData, setFormData] = useState<FeedbackFormData>({
        name: '',
        email: '',
        phone: '',
        isAnonymous: false,
        message: '',
        category: 'lainnya',
    });

    // Hide feedback button for admin users
    if (isAdmin) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        createFeedbackMutation.mutate({
            ...formData,
        }, {
            onSuccess: () => {
                setIsSubmitted(true);
                setTimeout(() => {
                    setIsModalOpen(false);
                    setIsSubmitted(false);
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        isAnonymous: false,
                        message: '',
                        category: 'lainnya',
                    });
                }, 2000);
            },
            onError: (error) => {
                console.error('Failed to submit feedback:', error);
                alert('Gagal mengirim saran. Silakan coba lagi.');
            }
        });
    };

    const handleAnonymousChange = (checked: boolean) => {
        setFormData({
            ...formData,
            isAnonymous: checked,
            name: checked ? 'Anonim' : '',
            email: checked ? '' : formData.email,
            phone: checked ? '' : formData.phone,
        });
    };

    return (
        <>
            {/* Floating Feedback Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold rounded-full shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 group"
            >
                <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">
                    rate_review
                </span>
                <span className="hidden sm:inline">Beri Saran</span>
            </button>

            {/* Feedback Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-primary to-blue-600 px-6 py-5">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <span className="material-symbols-outlined text-white text-2xl">feedback</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Kotak Saran</h3>
                                    <p className="text-white/80 text-sm">Bantu kami menjadi lebih baik</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        {isSubmitted ? (
                            <div className="p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Terima Kasih!</h4>
                                <p className="text-gray-500 dark:text-gray-400">Saran Anda telah kami terima dan akan segera ditinjau.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Anonymous checkbox */}
                                <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAnonymous}
                                        onChange={(e) => handleAnonymousChange(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">Kirim sebagai Anonim</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Identitas Anda tidak akan ditampilkan</p>
                                    </div>
                                </label>

                                {/* Name field - hidden if anonymous */}
                                {!formData.isAnonymous && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nama <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required={!formData.isAnonymous}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-11 px-4 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                                                placeholder="Masukkan nama Anda"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Email <span className="text-gray-400">(opsional)</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full h-11 px-4 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                                                    placeholder="email@contoh.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    No. HP <span className="text-gray-400">(opsional)</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full h-11 px-4 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                                                    placeholder="08xxxxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Kategori Saran
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Feedback['category'] })}
                                        className="w-full h-11 px-4 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white transition-all"
                                    >
                                        {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Saran / Pesan <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 resize-none transition-all"
                                        placeholder="Tulis saran, kritik, atau masukan Anda di sini..."
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-bold rounded-lg shadow-lg shadow-primary/25 transition-all duration-300"
                                >
                                    Kirim Saran
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
