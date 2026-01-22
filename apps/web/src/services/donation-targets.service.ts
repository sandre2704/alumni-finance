import { apiClient } from '../lib/api-client';

export interface DonationTarget {
    id: string;
    name: string;
    description?: string;
    targetAmount: string;
    currentAmount: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDonationTargetInput {
    name: string;
    description?: string;
    targetAmount: number;
    startDate?: string;
    endDate?: string;
}

export interface UpdateDonationTargetInput extends Partial<CreateDonationTargetInput> { }

export const DonationTargetsService = {
    getAll: async () => {
        const { data } = await apiClient.get<{ data: DonationTarget[] }>('/donation-targets');
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await apiClient.get<{ data: DonationTarget }>(`/donation-targets/${id}`);
        return data.data;
    },

    create: async (target: CreateDonationTargetInput) => {
        const { data } = await apiClient.post<{ data: DonationTarget }>('/donation-targets', target);
        return data.data;
    },

    update: async (id: string, target: UpdateDonationTargetInput) => {
        const { data } = await apiClient.put<{ data: DonationTarget }>(`/donation-targets/${id}`, target);
        return data.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/donation-targets/${id}`);
    },

    getDonors: async (id: string, params?: any) => {
        const queryParams = new URLSearchParams(params).toString();
        const { data } = await apiClient.get<{
            data: any[],
            meta: { page: number, limit: number, total: number, totalPages: number },
            stats: { totalCollected: number, donorCount: number }
        }>(`/donation-targets/${id}/donors?${queryParams}`);
        return data;
    },
};
