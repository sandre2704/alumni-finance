import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check if this is a callback from verification
        const error = searchParams.get('error');
        const verified = searchParams.get('verified');

        if (error) {
            setStatus('error');
            setMessage(error === 'invalid_token'
                ? 'Link verifikasi tidak valid atau sudah kadaluarsa.'
                : 'Terjadi kesalahan saat verifikasi email.');
        } else if (verified === 'true') {
            setStatus('success');
            setMessage('Email Anda berhasil diverifikasi!');
        } else {
            // Default success (auto-redirected from better-auth)
            setStatus('success');
            setMessage('Email Anda berhasil diverifikasi!');
        }
    }, [searchParams]);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col items-center justify-center p-4 relative">
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, #2424eb15 0%, transparent 60%)' }}>
            </div>
            <div className="relative z-10 w-full max-w-[480px] bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
                <div className="px-8 py-10 text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center animate-pulse">
                                <span className="material-symbols-outlined text-blue-600 text-3xl">hourglass_top</span>
                            </div>
                            <h1 className="text-2xl font-bold mb-4">Memverifikasi Email...</h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Mohon tunggu sebentar.
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                            </div>
                            <h1 className="text-2xl font-bold mb-4 text-green-600">Verifikasi Berhasil!</h1>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                {message} Silakan login untuk melanjutkan.
                            </p>
                            <Link
                                to="/login"
                                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-blue-700 text-white text-base font-bold transition-all"
                            >
                                Login Sekarang
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
                            </div>
                            <h1 className="text-2xl font-bold mb-4 text-red-600">Verifikasi Gagal</h1>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <Link
                                    to="/register"
                                    className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-blue-700 text-white text-base font-bold transition-all"
                                >
                                    Daftar Ulang
                                </Link>
                                <Link
                                    to="/login"
                                    className="w-full h-12 flex items-center justify-center rounded-lg border border-slate-300 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-input-dark text-slate-700 dark:text-slate-300 text-base font-medium transition-all"
                                >
                                    Kembali ke Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 relative z-10">
                <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors text-sm font-medium group">
                    <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Kembali ke Dashboard
                </Link>
            </div>
        </div>
    );
};
