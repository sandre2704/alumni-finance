import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CompleteProfile } from './pages/CompleteProfile';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import { FeedbackManagement } from './pages/FeedbackManagement';
import { VerifyEmail } from './pages/VerifyEmail';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                        {/* Public Routes - Accessible without login */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/settings" element={<Settings />} />

                        {/* Protected Admin Routes */}
                        <Route
                            path="/feedback"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <FeedbackManagement />
                                </ProtectedRoute>
                            }
                        />

                        {/* Public Routes */}

                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/complete-profile" element={<CompleteProfile />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Catch-all Route for 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;

