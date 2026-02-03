import { apiClient } from '../lib/api-client';

export interface CreateDonationParams {
    donorName: string;
    donorEmail: string;
    amount: number;
    donationTargetId?: string | null;
    categoryId?: string | null;
    message?: string;
    isAnonymous?: boolean;
}

export interface CreateDonationResponse {
    transactionId: string;
    orderId: string;
    snapToken: string;
    redirectUrl: string;
}

export interface MidtransConfig {
    clientKey: string;
    isProduction: boolean;
}

export const DonationsService = {
    /**
     * Create a new donation and get Snap token
     */
    async create(params: CreateDonationParams): Promise<CreateDonationResponse> {
        const { data } = await apiClient.post<{ success: boolean; data: CreateDonationResponse }>(
            '/donations/create',
            params
        );
        return data.data;
    },

    /**
     * Update transaction status after payment
     */
    async updateStatus(transactionId: string, status: 'paid' | 'processing'): Promise<void> {
        await apiClient.post('/donations/update-status', { transactionId, status });
    },

    /**
     * Get Midtrans client configuration
     */
    async getClientConfig(): Promise<MidtransConfig> {
        const { data } = await apiClient.get<{ success: boolean; data: MidtransConfig }>(
            '/donations/client-key'
        );
        return data.data;
    },
};
