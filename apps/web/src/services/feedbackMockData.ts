// Mock data for feedback/suggestions feature

export interface Feedback {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    isAnonymous: boolean;
    message: string;
    category: 'kategori_baru' | 'fitur' | 'kritik' | 'lainnya';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    isRead: boolean;
}

export const MOCK_FEEDBACKS: Feedback[] = [
    {
        id: '1',
        name: 'Ahmad Rizki',
        email: 'ahmad@email.com',
        isAnonymous: false,
        message: 'Mohon ditambahkan kategori untuk dana pendidikan anak alumni. Ini akan sangat membantu untuk tracking pengeluaran pendidikan.',
        category: 'kategori_baru',
        status: 'pending',
        createdAt: '2026-01-14T10:30:00',
        isRead: false,
    },
    {
        id: '2',
        name: 'Anonim',
        isAnonymous: true,
        message: 'Website sudah bagus, tapi akan lebih baik jika ada fitur export ke PDF langsung dari dashboard.',
        category: 'fitur',
        status: 'pending',
        createdAt: '2026-01-14T09:15:00',
        isRead: false,
    },
    {
        id: '3',
        name: 'Siti Nurhaliza',
        email: 'siti@email.com',
        phone: '081234567890',
        isAnonymous: false,
        message: 'Tolong perbaiki tampilan mobile, kadang agak susah untuk scroll tabel transaksi.',
        category: 'kritik',
        status: 'pending',
        createdAt: '2026-01-13T14:20:00',
        isRead: true,
    },
    {
        id: '4',
        name: 'Budi Santoso',
        email: 'budi@email.com',
        isAnonymous: false,
        message: 'Bagus sekali aplikasinya! Sangat membantu untuk transparansi keuangan alumni.',
        category: 'lainnya',
        status: 'approved',
        createdAt: '2026-01-12T08:00:00',
        isRead: true,
    },
    {
        id: '5',
        name: 'Anonim',
        isAnonymous: true,
        message: 'Tambahkan dark mode dong!',
        category: 'fitur',
        status: 'approved',
        createdAt: '2026-01-11T16:45:00',
        isRead: true,
    },
];

// Helper function to get unread pending feedbacks count
export const getUnreadFeedbackCount = (): number => {
    return MOCK_FEEDBACKS.filter(f => !f.isRead && f.status === 'pending').length;
};

// Helper function to get pending feedbacks
export const getPendingFeedbacks = (): Feedback[] => {
    return MOCK_FEEDBACKS.filter(f => f.status === 'pending');
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
