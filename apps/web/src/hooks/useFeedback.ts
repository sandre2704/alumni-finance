import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackService, CreateFeedbackData } from '../services/feedback.service';

export const useFeedbacks = (status?: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['feedbacks', status],
        queryFn: () => feedbackService.getAll(status),
        // Refresh every minute
        refetchInterval: 60000,
        enabled: options?.enabled,
    });
};

export const useFeedbackUnreadCount = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['feedbacks', 'unread-count'],
        queryFn: () => feedbackService.getUnreadCount(),
        refetchInterval: 30000,
        enabled: options?.enabled,
    });
};

export const useCreateFeedback = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFeedbackData) => feedbackService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
            queryClient.invalidateQueries({ queryKey: ['feedbacks', 'unread-count'] });
        },
    });
};

export const useUpdateFeedbackStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'pending' | 'approved' | 'rejected' }) =>
            feedbackService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
            queryClient.invalidateQueries({ queryKey: ['feedbacks', 'unread-count'] });
        },
    });
};

export const useMarkFeedbackAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => feedbackService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
            queryClient.invalidateQueries({ queryKey: ['feedbacks', 'unread-count'] });
        },
    });
};
