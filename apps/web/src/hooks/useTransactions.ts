import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionsService, CreateTransactionInput, UpdateTransactionInput } from '../services/transactions.service';

export const useTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: TransactionsService.getAll,
    });
};

export const useTransaction = (id: string) => {
    return useQuery({
        queryKey: ['transactions', id],
        queryFn: () => TransactionsService.getById(id),
        enabled: !!id,
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTransactionInput) => TransactionsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['donation-targets'] });
        },
    });
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
            TransactionsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['donation-targets'] });
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => TransactionsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['donation-targets'] });
        },
    });
};
