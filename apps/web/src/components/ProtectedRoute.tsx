import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat...</p>
                </div>
            </div>
        );
    }

    // Redirect to unauthorized page if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Redirect to unauthorized page if admin is required but user is not admin
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
