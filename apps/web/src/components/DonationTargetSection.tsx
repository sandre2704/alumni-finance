import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDonationTargets, useCreateDonationTarget, useDeleteDonationTarget } from '../hooks/useDonationTargets';
import { DonationTarget } from '../services/donation-targets.service';
import { DonationDetailModal } from './DonationDetailModal';


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Icon color mapping for visual variety
const iconColors = [
    { iconColor: 'text-blue-600 dark:text-blue-400', iconBgColor: 'bg-blue-100 dark:bg-blue-900/30', progressBarColor: 'bg-primary', textColor: 'text-primary' },
    { iconColor: 'text-green-600 dark:text-green-400', iconBgColor: 'bg-green-100 dark:bg-green-900/30', progressBarColor: 'bg-green-500', textColor: 'text-green-500' },
    { iconColor: 'text-orange-600 dark:text-orange-400', iconBgColor: 'bg-orange-100 dark:bg-orange-900/30', progressBarColor: 'bg-orange-500', textColor: 'text-orange-500' },
    { iconColor: 'text-purple-600 dark:text-purple-400', iconBgColor: 'bg-purple-100 dark:bg-purple-900/30', progressBarColor: 'bg-purple-500', textColor: 'text-purple-500' },
    { iconColor: 'text-red-600 dark:text-red-400', iconBgColor: 'bg-red-100 dark:bg-red-900/30', progressBarColor: 'bg-red-500', textColor: 'text-red-500' },
    { iconColor: 'text-teal-600 dark:text-teal-400', iconBgColor: 'bg-teal-100 dark:bg-teal-900/30', progressBarColor: 'bg-teal-500', textColor: 'text-teal-500' },
];

// Available icons for selection
const availableIcons = [
    { id: 'campaign', label: 'Kampanye' },
    { id: 'school', label: 'Pendidikan' },
    { id: 'mosque', label: 'Masjid' },
    { id: 'medical_services', label: 'Kesehatan' },
    { id: 'volunteer_activism', label: 'Sosial' },
    { id: 'biotech', label: 'Riset' },
    { id: 'sports_soccer', label: 'Olahraga' },
    { id: 'nature', label: 'Lingkungan' },
    { id: 'groups', label: 'Komunitas' },
    { id: 'child_care', label: 'Anak-anak' },
    { id: 'home', label: 'Pembangunan' },
    { id: 'local_library', label: 'Perpustakaan' },
];

// Get saved icon from localStorage or use default
const getSavedIcon = (id: string): string => {
    try {
        const saved = localStorage.getItem(`donation-icon-${id}`);
        return saved || availableIcons[getColorIndex(id) % availableIcons.length].id;
    } catch {
        return availableIcons[0].id;
    }
};

// Save icon to localStorage
const saveIcon = (id: string, icon: string) => {
    try {
        localStorage.setItem(`donation-icon-${id}`, icon);
    } catch {
        // Ignore localStorage errors
    }
};

const getColorIndex = (id: string) => {
    // Generate a consistent color index based on the id
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % iconColors.length;
};

const MAX_DONATIONS = 6;

export const DonationTargetSection = () => {
    const { isAuthenticated } = useAuth();
    const { data: donations, isLoading } = useDonationTargets();
    const createMutation = useCreateDonationTarget();
    const deleteMutation = useDeleteDonationTarget();

    const [selectedDonation, setSelectedDonation] = useState<DonationTarget | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(availableIcons[0].id);
    const [newDonation, setNewDonation] = useState({
        name: '',
        description: '',
        targetAmount: '',
    });

    const donationList = donations || [];
    const canAddMore = donationList.length < MAX_DONATIONS;

    const handleDelete = (id: string) => {
        if (window.confirm('Yakin ingin menghapus target donasi ini?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleAddDonation = (e: React.FormEvent) => {
        e.preventDefault();

        if (!canAddMore) return;

        const targetAmount = parseInt(newDonation.targetAmount.replace(/\D/g, '')) || 0;

        createMutation.mutate({
            name: newDonation.name,
            description: newDonation.description || undefined,
            targetAmount,
        }, {
            onSuccess: (createdDonation) => {
                // Save icon choice to localStorage using the new donation's ID
                if (createdDonation?.id) {
                    saveIcon(createdDonation.id, selectedIcon);
                }
                setNewDonation({ name: '', description: '', targetAmount: '' });
                setSelectedIcon(availableIcons[0].id);
                setIsModalOpen(false);
            },
            onError: (error: any) => {
                alert(`Gagal menambah target: ${error.response?.data?.message || error.message}`);
            }
        });
    };

    const formatInputCurrency = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return '';
        return new Intl.NumberFormat('id-ID').format(parseInt(numericValue));
    };

    if (isLoading) {
        return (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900 dark:text-white text-xl font-bold">Target Donasi</h3>
                </div>
                <div className="text-center py-8 text-gray-500">Loading...</div>
            </section>
        );
    }

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-gray-900 dark:text-white text-xl font-bold">Target Donasi</h3>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        {donationList.length}/{MAX_DONATIONS}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isAuthenticated && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={!canAddMore}
                            title={!canAddMore ? 'Maksimal 6 target donasi' : 'Tambah target donasi baru'}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${canAddMore
                                ? 'bg-primary text-white hover:bg-blue-700'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Tambah
                        </button>
                    )}
                </div>
            </div>

            {donationList.length === 0 ? (
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-8 text-center">
                    <div className="size-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <span className="material-symbols-outlined text-3xl">campaign</span>
                    </div>
                    <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Belum ada target donasi</h4>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        {isAuthenticated
                            ? 'Buat target donasi untuk menggalang dana kegiatan atau program beasiswa.'
                            : 'Login untuk membuat target donasi baru.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donationList.map((donation: DonationTarget) => {
                        const colorIndex = getColorIndex(donation.id);
                        const colors = iconColors[colorIndex];
                        const icon = getSavedIcon(donation.id);
                        const currentAmount = parseFloat(donation.currentAmount);
                        const targetAmount = parseFloat(donation.targetAmount);
                        const percentage = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;

                        return (
                            <div
                                key={donation.id}
                                className="rounded-xl border border-gray-200 dark:border-card-border bg-white dark:bg-card-dark p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
                                onClick={() => setSelectedDonation(donation)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`size-10 rounded-lg ${colors.iconBgColor} flex items-center justify-center ${colors.iconColor}`}>
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </div>
                                    {isAuthenticated && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(donation.id);
                                            }}
                                            disabled={deleteMutation.isPending}
                                            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 z-10"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    )}
                                </div>
                                <h4 className="text-gray-900 dark:text-white font-bold mb-1">{donation.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{donation.description || 'Tidak ada deskripsi'}</p>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(currentAmount)}</span>
                                    <span className="text-xs text-gray-500">Target {formatCurrency(targetAmount)}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                                    <div className={`${colors.progressBarColor} h-full rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
                                </div>
                                <p className={`text-right text-xs font-bold ${colors.textColor}`}>{percentage}%</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Donation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-card-border">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Target Donasi</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddDonation} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Judul Target <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newDonation.name}
                                    onChange={(e) => setNewDonation({ ...newDonation, name: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Contoh: Beasiswa Alumni 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Deskripsi
                                </label>
                                <input
                                    type="text"
                                    value={newDonation.description}
                                    onChange={(e) => setNewDonation({ ...newDonation, description: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Deskripsi singkat target donasi"
                                />
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pilih Ikon
                                </label>
                                <div className="grid grid-cols-6 gap-2">
                                    {availableIcons.map((iconOption) => (
                                        <button
                                            key={iconOption.id}
                                            type="button"
                                            onClick={() => setSelectedIcon(iconOption.id)}
                                            title={iconOption.label}
                                            className={`aspect-square rounded-lg flex items-center justify-center transition-all ${selectedIcon === iconOption.id
                                                ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-card-dark scale-110'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-xl">{iconOption.id}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-center">
                                    {availableIcons.find(i => i.id === selectedIcon)?.label || 'Pilih ikon'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Target Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">Rp</span>
                                    <input
                                        type="text"
                                        required
                                        value={newDonation.targetAmount}
                                        onChange={(e) => setNewDonation({
                                            ...newDonation,
                                            targetAmount: formatInputCurrency(e.target.value)
                                        })}
                                        className="w-full h-10 pl-10 pr-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                        placeholder="100.000.000"
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Donation Detail Modal */}
            <DonationDetailModal
                isOpen={!!selectedDonation}
                onClose={() => setSelectedDonation(null)}
                donationTarget={selectedDonation}
            />

        </section>
    );
};
