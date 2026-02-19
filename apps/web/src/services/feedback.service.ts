import { apiClient } from '../lib/api-client';

export interface Feedback {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    isAnonymous: boolean;
    message: string;
    category: 'kategori_baru' | 'fitur' | 'kritik' | 'lainnya';
    status: 'pending' | 'approved' | 'rejected';
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFeedbackData {
    name?: string;
    email?: string;
    phone?: string;
    isAnonymous: boolean;
    message: string;
    category: 'kategori_baru' | 'fitur' | 'kritik' | 'lainnya';
}

export const feedbackService = {
    getAll: async (status?: string) => {
        const response = await apiClient.get<{ success: boolean; data: Feedback[] }>('/feedbacks', {
            params: { status },
        });
        return response.data.data;
    },

    create: async (data: CreateFeedbackData) => {
        const response = await apiClient.post<{ success: boolean; data: Feedback }>('/feedbacks', data);
        return response.data.data;
    },

    updateStatus: async (id: string, status: 'pending' | 'approved' | 'rejected') => {
        const response = await apiClient.put<{ success: boolean; data: Feedback }>(`/feedbacks/${id}/status`, {
            status,
        });
        return response.data.data;
    },

    markAsRead: async (id: string) => {
        const response = await apiClient.put<{ success: boolean; data: Feedback }>(`/feedbacks/${id}/read`);
        return response.data.data;
    },

    getUnreadCount: async () => {
        const response = await apiClient.get<{ success: boolean; data: number }>('/feedbacks/unread-count');
        return response.data.data;
    },
};

// Category labels
export const FEEDBACK_CATEGORY_LABELS: Record<Feedback['category'], string> = {
    kategori_baru: 'Kategori Baru',
    fitur: 'Usulan Fitur',
    kritik: 'Kritik & Saran',
    lainnya: 'Lainnya',
};

// Status labels
export const FEEDBACK_STATUS_LABELS: Record<Feedback['status'], string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};
