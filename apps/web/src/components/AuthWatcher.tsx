import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthWatcher = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Only run check if not loading and user is authenticated
        if (!isLoading && isAuthenticated && user) {
            // Check if user needs to complete profile (missing username)
            // And ensure we don't redirect if already on the completion page
            // We also exclude logout/login pages to prevent loops during transitions
            if (!user.username && location.pathname !== '/complete-profile' && location.pathname !== '/logout') {
                navigate('/complete-profile');
            }
        }
    }, [isLoading, isAuthenticated, user, location, navigate]);

    return null;
};
