import { authClient, signIn, signOut } from '../lib/auth-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
    id: string;
    username?: string; // Optional in better-auth default? I added it to schema.
    email: string;
    name: string;
    role?: string; // I added this to schema
    image?: string;
}

export const AuthService = {
    login: async (emailOrUsername: string, password: string) => {
        let email = emailOrUsername;

        // Check if input is not an email (doesn't contain @)
        if (!emailOrUsername.includes('@')) {
            // It's a username, fetch the email from backend
            try {
                const response = await fetch(`${API_URL}/api/profile/get-email-by-username/${emailOrUsername}`, {
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.email) {
                    email = data.email;
                } else {
                    throw new Error('Username tidak ditemukan');
                }
            } catch (err) {
                throw new Error('Username tidak ditemukan');
            }
        }

        const { data, error } = await signIn.email({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data?.user as User;
    },

    loginWithGoogle: async () => {
        const { data, error } = await signIn.social({
            provider: "google",
            callbackURL: "http://localhost:5173/complete-profile"
        });

        if (error) {
            throw error;
        }

        return data;
    },

    logout: async (): Promise<void> => {
        await signOut();
    },

    getSession: async (): Promise<User | null> => {
        const { data } = await authClient.getSession();
        return data?.user as User || null;
    },

    forgotPassword: async (email: string) => {
        const { data, error } = await authClient.requestPasswordReset({
            email,
            redirectTo: "/reset-password",
        });

        if (error) {
            throw error;
        }

        return data;
    },

    resetPassword: async (newPassword: string, token: string) => {
        const { data, error } = await authClient.resetPassword({
            newPassword,
            token
        });

        if (error) {
            throw error;
        }

        return data;
    }
};

