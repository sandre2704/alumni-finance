import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login', { state: { from: location.state?.from } });
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4 dark">
            <div className="text-center max-w-lg">
                {/* Error illustration */}
                <div className="relative mb-8">
                    <div className="text-[180px] font-black text-gray-100 dark:text-gray-800 leading-none select-none">
                        403
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[80px] text-red-500/80">
                            lock
                        </span>
                    </div>
                </div>

                {/* Error message */}
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                    Akses Ditolak
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-8 leading-relaxed">
                    {isAuthenticated
                        ? 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini mungkin memerlukan hak akses admin.'
                        : 'Anda harus login terlebih dahulu untuk mengakses halaman ini.'
                    }
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/"
                                className="flex items-center gap-2 h-12 px-6 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg shadow-primary/25 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">home</span>
                                Kembali ke Beranda
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2 h-12 px-6 rounded-lg border border-gray-200 dark:border-card-border bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                Kembali
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleLogin}
                                className="flex items-center gap-2 h-12 px-6 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg shadow-primary/25 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">login</span>
                                Login
                            </button>
                            <Link
                                to="/"
                                className="flex items-center gap-2 h-12 px-6 rounded-lg border border-gray-200 dark:border-card-border bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">home</span>
                                Beranda
                            </Link>
                        </>
                    )}
                </div>

                {/* Help text */}
                <p className="mt-8 text-sm text-gray-400 dark:text-gray-500">
                    Butuh bantuan? <a href="#" className="text-primary hover:underline">Hubungi kami</a>
                </p>
            </div>
        </div>
    );
};
