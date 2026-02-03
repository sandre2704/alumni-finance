import { useEffect, useState, useCallback } from 'react';
import { DonationsService, MidtransConfig } from '../services/donations.service';

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options: {
                    onSuccess?: (result: any) => void;
                    onPending?: (result: any) => void;
                    onError?: (result: any) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}

interface UseMidtransReturn {
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;
    pay: (snapToken: string) => Promise<{ status: 'success' | 'pending' | 'error' | 'closed'; result?: any }>;
}

export const useMidtrans = (): UseMidtransReturn => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<MidtransConfig | null>(null);

    useEffect(() => {
        const loadMidtrans = async () => {
            // Check if already loaded
            if (window.snap) {
                setIsLoaded(true);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Get client config from backend
                const clientConfig = await DonationsService.getClientConfig();
                setConfig(clientConfig);

                // Determine Snap URL based on environment
                const snapUrl = clientConfig.isProduction
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js';

                // Load Snap.js script
                const script = document.createElement('script');
                script.src = snapUrl;
                script.setAttribute('data-client-key', clientConfig.clientKey);
                script.async = true;

                script.onload = () => {
                    setIsLoaded(true);
                    setIsLoading(false);
                };

                script.onerror = () => {
                    setError('Gagal memuat Midtrans Snap');
                    setIsLoading(false);
                };

                document.body.appendChild(script);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat konfigurasi Midtrans');
                setIsLoading(false);
            }
        };

        loadMidtrans();
    }, []);

    const pay = useCallback((snapToken: string): Promise<{ status: 'success' | 'pending' | 'error' | 'closed'; result?: any }> => {
        return new Promise((resolve) => {
            if (!window.snap) {
                resolve({ status: 'error', result: { message: 'Midtrans tidak tersedia' } });
                return;
            }

            window.snap.pay(snapToken, {
                onSuccess: (result) => {
                    console.log('[Midtrans] Payment success:', result);
                    resolve({ status: 'success', result });
                },
                onPending: (result) => {
                    console.log('[Midtrans] Payment pending:', result);
                    resolve({ status: 'pending', result });
                },
                onError: (result) => {
                    console.log('[Midtrans] Payment error:', result);
                    resolve({ status: 'error', result });
                },
                onClose: () => {
                    console.log('[Midtrans] Popup closed');
                    resolve({ status: 'closed' });
                },
            });
        });
    }, []);

    return {
        isLoaded,
        isLoading,
        error,
        pay,
    };
};
