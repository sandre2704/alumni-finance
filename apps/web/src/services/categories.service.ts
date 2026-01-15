import { apiClient } from '../lib/api-client';

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    isCustom: boolean;
    userId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryInput {
    name: string;
    isCustom?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> { }

export const CategoriesService = {
    getAll: async () => {
        const { data } = await apiClient.get<{ data: Category[] }>('/categories');
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await apiClient.get<{ data: Category }>(`/categories/${id}`);
        return data.data;
    },

    create: async (category: CreateCategoryInput) => {
        const { data } = await apiClient.post<{ data: Category }>('/categories', category);
        return data.data;
    },

    update: async (id: string, category: UpdateCategoryInput) => {
        const { data } = await apiClient.put<{ data: Category }>(`/categories/${id}`, category);
        return data.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/categories/${id}`);
    },
};
