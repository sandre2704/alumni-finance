import { DashboardStats } from './dashboard.service';
import { Transaction } from './transactions.service';
import { Category } from './categories.service';
import { DonationTarget } from './donation-targets.service';
import { User } from './auth.service';

export const MOCK_USER: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    image: 'https://ui-avatars.com/api/?name=Test+User',
    username: 'testuser'
};

export const MOCK_DASHBOARD_STATS: DashboardStats = {
    totalBalance: 15000000,
    income: {
        total: 25000000,
        trend: 15.5
    },
    expense: {
        total: 10000000,
        trend: -5.2
    },
    monthlyChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        income: [2000000, 3500000, 4000000, 3000000, 5000000, 7500000],
        expense: [1500000, 2000000, 1800000, 2500000, 1000000, 1200000]
    }
};

export const MOCK_CATEGORIES: Category[] = [
    {
        id: 'cat-1',
        name: 'Gaji',
        type: 'income',
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'cat-2',
        name: 'Donasi Masuk',
        type: 'income',
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'cat-3',
        name: 'Makan & Minum',
        type: 'expense',
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'cat-4',
        name: 'Transportasi',
        type: 'expense',
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'cat-5',
        name: 'Donasi Keluar',
        type: 'expense',
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const MOCK_DONATION_TARGETS: DonationTarget[] = [
    {
        id: 'target-1',
        name: 'Pembangunan Masjid Al-Hidayah',
        description: 'Bantuan untuk renovasi atap masjid yang bocor.',
        targetAmount: '50000000',
        currentAmount: '15000000',
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'target-2',
        name: 'Beasiswa Anak Yatim',
        description: 'Program beasiswa untuk 10 anak yatim berprestasi.',
        targetAmount: '20000000',
        currentAmount: '5000000',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx-1',
        amount: 5000000,
        description: 'Gaji Bulanan',
        transactionDate: new Date().toISOString(),
        categoryId: 'cat-1',
        type: 'income',
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'tx-2',
        amount: 50000,
        description: 'Makan Siang',
        transactionDate: new Date().toISOString(),
        categoryId: 'cat-3',
        type: 'expense',
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'tx-3',
        amount: 100000,
        description: 'Donasi untuk Masjid',
        transactionDate: new Date().toISOString(),
        categoryId: 'cat-5',
        type: 'expense',
        donationTargetId: 'target-1',
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'tx-4',
        amount: 1000000,
        description: 'Sumbangan Hamba Allah',
        transactionDate: new Date().toISOString(),
        categoryId: 'cat-2',
        type: 'income',
        isAnonymous: true,
        donorName: 'Hamba Allah',
        donationTargetId: 'target-2',
        userId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
