import { apiClient } from '../lib/api-client';

export interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    isActive?: boolean;
}

export interface TransferInfo {
    bankAccounts: BankAccount[];
    whatsappNumber: string;
    email: string;
    instructions: string;
    qrCodeUrl?: string;
}

export class SiteSettingsService {
    static async getTransferInfo(): Promise<TransferInfo> {
        const response = await apiClient.get<TransferInfo>('/site-settings/transfer-info');
        return response.data;
    }

    static async updateTransferInfo(data: TransferInfo): Promise<TransferInfo> {
        const response = await apiClient.put<TransferInfo>('/site-settings/transfer-info', data);
        return response.data;
    }
}
