import { createAuthClient } from "better-auth/react"

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, '');

export const authClient = createAuthClient({
    baseURL: `${API_URL}/api/auth`
})

export const { useSession } = authClient;
export const { signIn, signUp, signOut } = authClient;
