import { apiClient } from '../lib/api-client';

export interface Category {
    id: string;
    name: string;
    slug: string;
    type: 'income' | 'expense';
    monthlyBudget?: string | null;
    createdAt: string;
}

export type CreateCategoryDTO = Pick<Category, 'name' | 'type' | 'monthlyBudget'>;

export const CategoryService = {
    getAll: async (type?: 'income' | 'expense') => {
        const response = await apiClient.get<{ data: Category[] }>('/categories', {
            params: { type },
        });
        return response.data.data;
    },

    create: async (data: CreateCategoryDTO) => {
        const response = await apiClient.post<{ data: Category }>('/categories', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<CreateCategoryDTO>) => {
        const response = await apiClient.put<{ data: Category }>(`/categories/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/categories/${id}`);
    },
};
