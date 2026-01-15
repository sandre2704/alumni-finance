import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // Important for cookies (session auth)
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle global errors here (e.g., redirect to login on 401)
        if (error.response?.status === 401) {
            // Optional: logic to handle unauthorized access
        }

        // Mock Data Fallback for Network Errors or unreachable backend
        if (!error.response || error.code === 'ERR_NETWORK') {
            console.warn('Backend unreachable, using mock data for:', error.config.url);
            const { MOCK_CATEGORIES, MOCK_DASHBOARD_STATS, MOCK_DONATION_TARGETS, MOCK_TRANSACTIONS } = await import('../services/mockData');

            const url = error.config.url;

            if (url.includes('/dashboard/stats')) {
                return Promise.resolve({ data: { data: MOCK_DASHBOARD_STATS } });
            }
            if (url.includes('/transactions')) {
                // Handle getById if needed, simple mocking for now
                if (url.match(/\/transactions\/.+/)) {
                    return Promise.resolve({ data: { data: MOCK_TRANSACTIONS[0] } });
                }
                return Promise.resolve({ data: { data: MOCK_TRANSACTIONS } });
            }
            if (url.includes('/categories')) {
                return Promise.resolve({ data: { data: MOCK_CATEGORIES } });
            }
            if (url.includes('/donation-targets')) {
                return Promise.resolve({ data: { data: MOCK_DONATION_TARGETS } });
            }
        }

        return Promise.reject(error);
    }
);
