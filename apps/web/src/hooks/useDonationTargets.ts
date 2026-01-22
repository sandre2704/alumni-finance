import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DonationTargetsService, CreateDonationTargetInput, UpdateDonationTargetInput } from '../services/donation-targets.service';

export const useDonationTargets = () => {
    return useQuery({
        queryKey: ['donation-targets'],
        queryFn: DonationTargetsService.getAll,
    });
};

export const useDonationTarget = (id: string) => {
    return useQuery({
        queryKey: ['donation-targets', id],
        queryFn: () => DonationTargetsService.getById(id),
        enabled: !!id,
    });
};

export const useCreateDonationTarget = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDonationTargetInput) => DonationTargetsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donation-targets'] });
        },
    });
};

export const useUpdateDonationTarget = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDonationTargetInput }) =>
            DonationTargetsService.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['donation-targets'] });
            queryClient.invalidateQueries({ queryKey: ['donation-targets', data.id] });
        },
    });
};

export const useDeleteDonationTarget = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => DonationTargetsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donation-targets'] });
        },
    });
};
export const useDonationDonors = (id: string, params?: any) => {
    return useQuery({
        queryKey: ['donation-donors', id, params],
        queryFn: () => DonationTargetsService.getDonors(id, params),
        enabled: !!id,
    });
};
