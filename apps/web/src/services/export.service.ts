import { apiClient } from '../lib/api-client';

export const ExportService = {
    async downloadPDF(startDate: string, endDate: string) {
        const response = await apiClient.get('/export/pdf', {
            params: { startDate, endDate },
            responseType: 'blob',
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `laporan-${startDate}-to-${endDate}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    async downloadExcel(startDate: string, endDate: string) {
        const response = await apiClient.get('/export/excel', {
            params: { startDate, endDate },
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `laporan-${startDate}-to-${endDate}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
