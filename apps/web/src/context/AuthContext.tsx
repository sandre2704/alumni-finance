import { createContext, useContext, ReactNode } from 'react'; // Removed useState, useEffect as we use useSession
import { User, AuthService } from '../services/auth.service';
import { useSession } from '../lib/auth-client';
import { MOCK_USER } from '../services/mockData';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, pass: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, isPending: isLoading, error } = useSession();

    // Convert better-auth user to our User interface if necessary, usually it matches
    let user = session?.user as User | null;
    console.log('AuthContext user:', user);

    if (error) {
        console.warn('Auth error (likely backend down), using mock user');
        user = MOCK_USER;
    }

    const login = async (email: string, pass: string) => {
        await AuthService.login(email, pass);
        // useSession should automatically update
    };

    const loginWithGoogle = async () => {
        await AuthService.loginWithGoogle();
    };

    const logout = async () => {
        await AuthService.logout();
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated, isAdmin, login, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
