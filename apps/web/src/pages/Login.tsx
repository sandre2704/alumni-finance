
import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, loginWithGoogle, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for success message from navigation state (e.g., after registration)
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the state to prevent showing message on reload
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            // Extract error message
            const errorMessage = err?.message || '';

            // Check for inactive account error
            if (errorMessage === 'ACCOUNT_INACTIVE' ||
                errorMessage.includes('dinonaktifkan') ||
                errorMessage.includes('tidak aktif')) {
                setError('Akun Anda tidak aktif. Silakan hubungi administrator.');
            } else if (errorMessage.includes('tidak ditemukan')) {
                setError(errorMessage);
            } else {
                setError('Email/username atau password salah');
            }
        }
    };


    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col items-center justify-center p-4 relative">
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, #2424eb15 0%, transparent 60%)' }}>
            </div>
            <div className="relative z-10 w-full max-w-[480px] bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
                <div className="px-8 pt-10 pb-2 text-center">
                    <div className="inline-flex items-center gap-3 mb-6 justify-center text-primary dark:text-white">
                        <div className="size-8 text-primary dark:text-white">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                                <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight">Alumni Finance</h2>
                    </div>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight mb-2">Admin Portal</h1>
                    <p className="text-slate-500 dark:text-[#9292c8] text-base font-normal">Please enter your credentials to access financial records.</p>
                </div>

                <div className="px-8 pb-10 pt-4">
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        {successMessage && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                {successMessage}
                            </div>
                        )}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}
                        <label className="flex flex-col w-full">
                            <span className="text-sm font-medium leading-normal pb-2 text-slate-900 dark:text-white">Email atau Username</span>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 material-symbols-outlined text-[#9292c8]">person</span>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex w-full min-w-0 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-input-dark focus:border-primary h-14 placeholder:text-[#9292c8] pl-12 pr-4 text-base font-normal leading-normal transition-all"
                                    placeholder="Masukkan email atau username"
                                    type="text"
                                    required
                                />
                            </div>
                        </label>

                        <label className="flex flex-col w-full">
                            <div className="flex justify-between items-baseline pb-2">
                                <span className="text-sm font-medium leading-normal text-slate-900 dark:text-white">Password</span>
                                <Link to="/forgot-password" className="text-sm text-primary hover:text-blue-400 transition-colors font-medium">Forgot Password?</Link>
                            </div>
                            <div className="flex w-full items-stretch rounded-lg group">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#9292c8]">lock</span>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex w-full min-w-0 resize-none overflow-hidden rounded-lg rounded-r-none border-r-0 focus:outline-0 focus:ring-0 border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-input-dark focus:border-border-dark h-14 placeholder:text-[#9292c8] pl-12 pr-4 text-base font-normal leading-normal z-0"
                                        placeholder="Enter your password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                    />
                                </div>
                                <button
                                    className="flex items-center justify-center px-4 rounded-r-lg border border-l-0 border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-input-dark text-[#9292c8] hover:text-white transition-colors cursor-pointer group-focus-within:border-border-dark"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                        </label>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 flex items-center justify-center rounded-lg bg-primary hover:bg-blue-700 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Belum punya akun?{' '}
                            <Link to="/register" className="text-primary hover:text-blue-400 font-medium transition-colors">
                                Daftar di sini
                            </Link>
                        </p>

                        <div className="relative flex py-5 items-center">
                            <div className="flex-grow border-t border-slate-300 dark:border-border-dark"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-gray-500 text-sm">Or continue with</span>
                            <div className="flex-grow border-t border-slate-300 dark:border-border-dark"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => loginWithGoogle()}
                            disabled={isLoading}
                            className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-input-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-base font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 relative z-10">
                <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors text-sm font-medium group">
                    <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
};
