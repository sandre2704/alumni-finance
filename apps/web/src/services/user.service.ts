import { apiClient } from '../lib/api-client';

export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserData {
    username: string;
    email: string;
    name: string;
    password: string;
}

export interface UpdateUserData {
    username?: string;
    email?: string;
    name?: string;
    password?: string;
}

export const UserService = {
    getAll: async (): Promise<User[]> => {
        const { data } = await apiClient.get('/users');
        return data.data;
    },

    getById: async (id: string): Promise<User> => {
        const { data } = await apiClient.get(`/users/${id}`);
        return data.data;
    },

    create: async (userData: CreateUserData): Promise<User> => {
        const { data } = await apiClient.post('/users', userData);
        return data.data;
    },

    update: async (id: string, userData: UpdateUserData): Promise<User> => {
        const { data } = await apiClient.put(`/users/${id}`, userData);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};
