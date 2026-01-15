import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoriesService, CreateCategoryInput, UpdateCategoryInput } from '../services/categories.service';

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: CategoriesService.getAll,
    });
};

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: () => CategoriesService.getById(id),
        enabled: !!id,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryInput) => CategoriesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
            CategoriesService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories', data.id] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => CategoriesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
