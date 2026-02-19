import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService, CreateCategoryInput, UpdateCategoryInput } from '../services/category.service';

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => CategoryService.getAll(),
    });
};

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: () => CategoryService.getById(id),
        enabled: !!id,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryInput) => CategoryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
            CategoryService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories', data.id] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => CategoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
