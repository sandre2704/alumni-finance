import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Approvals } from './pages/Approvals';
import { Reports } from './pages/Reports';
import { Donations } from './pages/Donations';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CompleteProfile } from './pages/CompleteProfile';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import { FeedbackManagement } from './pages/FeedbackManagement';
import { VerifyEmail } from './pages/VerifyEmail';
import { DonationInfo } from './pages/DonationInfo';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

const BackendError = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Gagal Terhubung ke Server</h1>
            <p className="text-gray-600 mb-6">
                Tidak dapat menghubungi backend. Pastikan server backend sedang berjalan.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Coba Lagi
            </button>
        </div>
    </div>
);

import { Layout } from './components/Layout';

import { AuthWatcher } from './components/AuthWatcher';

const AppContent = () => {
    const { error } = useAuth();

    if (error) {
        // Check if it's a connection error (fetch blocked/network error)
        // Better-auth might return specific errors, but usually network errors result in undefined data or explicit error object
        console.error("Auth Error details:", error);
        return <BackendError />;
    }

    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthWatcher />
            <Routes>
                {/* Routes with Sidebar Layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/approvals" element={<Approvals />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/donations" element={<Donations />} />
                    <Route path="/donation-info" element={<DonationInfo />} />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/feedback"
                        element={
                            <ProtectedRoute requireAdmin>
                                <FeedbackManagement />
                            </ProtectedRoute>
                        }
                    />
                    {/* Catch-all for 404 inside layout if preferred, or outside */}
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Public Routes without Sidebar */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* 404 can technically be here too if we want full page 404 */}
            </Routes>
        </BrowserRouter>
    );
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;

