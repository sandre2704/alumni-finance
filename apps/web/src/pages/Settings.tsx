import { useState, useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService, Category } from '../services/category.service';
import { UserService, User, CreateUserData } from '../services/user.service';
import { TransferInfoSection } from '../components/TransferInfoSection';

const KategoriSection = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'income' as 'income' | 'expense', monthlyBudget: '' });

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => CategoryService.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: CategoryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsModalOpen(false);
            setNewCategory({ name: '', type: 'income', monthlyBudget: '' });
            setNewCategory({ name: '', type: 'income', monthlyBudget: '' });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Kategori berhasil ditambahkan!',
                confirmButtonColor: '#3085d6',
            });
        },
        onError: (error: any) => {
            console.error('Failed to create category:', error);
            const message = error.response?.data?.message || 'Terjadi kesalahan pada server. Mohon coba lagi.';
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: `Gagal menambah kategori: ${message}`,
                confirmButtonColor: '#d33',
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<typeof newCategory> }) => CategoryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsModalOpen(false);
            setEditingCategory(null);
            setNewCategory({ name: '', type: 'income', monthlyBudget: '' });
            setNewCategory({ name: '', type: 'income', monthlyBudget: '' });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Kategori berhasil diperbarui!',
                confirmButtonColor: '#3085d6',
            });
        },
        onError: (error: any) => {
            console.error('Failed to update category:', error);
            const message = error.response?.data?.message || 'Terjadi kesalahan pada server. Mohon coba lagi.';
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: `Gagal memperbarui kategori: ${message}`,
                confirmButtonColor: '#d33',
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: CategoryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Kategori berhasil dihapus!',
                confirmButtonColor: '#3085d6',
            });
        },
        onError: (error: any) => {
            console.error('Failed to delete category:', error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: `Gagal menghapus kategori: ${error.response?.data?.message || error.message}`,
                confirmButtonColor: '#d33',
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...newCategory,
            monthlyBudget: newCategory.monthlyBudget ? newCategory.monthlyBudget.replace(/\D/g, '') : undefined
        };

        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const formatCurrencyInput = (value: string) => {
        const number = value.replace(/\D/g, '');
        if (!number) return '';
        return new Intl.NumberFormat('id-ID').format(Number(number));
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setNewCategory({
            name: category.name,
            type: category.type,
            monthlyBudget: category.monthlyBudget ? Number(category.monthlyBudget).toLocaleString('id-ID') : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Ingin menghapus kategori "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setNewCategory({ name: '', type: 'income', monthlyBudget: '' });
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    const incomeCategories = categories?.filter(c => c.type === 'income') || [];
    const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Daftar Kategori</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Kelola kategori pemasukan dan pengeluaran.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto justify-center"
                >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add</span>
                    Tambah Kategori
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Income Categories */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-4 sm:p-5">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-lg sm:text-xl">arrow_downward</span>
                        Pemasukan
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                        {incomeCategories.length === 0 ? (
                            <p className="text-xs sm:text-sm text-gray-400 italic">Belum ada kategori pemasukan.</p>
                        ) : incomeCategories.map((category: Category) => (
                            <div key={category.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="size-2.5 sm:size-3 rounded-full bg-green-500"></div>
                                    <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">{category.name}</span>
                                </div>
                                <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id, category.name)}
                                        className="p-1 sm:p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-4 sm:p-5">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-lg sm:text-xl">arrow_upward</span>
                        Pengeluaran
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                        {expenseCategories.length === 0 ? (
                            <p className="text-xs sm:text-sm text-gray-400 italic">Belum ada kategori pengeluaran.</p>
                        ) : expenseCategories.map((category: Category) => (
                            <div key={category.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="size-2.5 sm:size-3 rounded-full bg-red-500"></div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">{category.name}</span>
                                        {category.monthlyBudget && parseFloat(category.monthlyBudget) > 0 && (
                                            <span className="text-[10px] sm:text-xs text-gray-500">Budget: Rp {Number(category.monthlyBudget).toLocaleString('id-ID')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id, category.name)}
                                        className="p-1 sm:p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-card-border">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Kategori</label>
                                <input
                                    type="text"
                                    required
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Contoh: Gaji, Makan Siang"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="income"
                                            checked={newCategory.type === 'income'}
                                            onChange={() => setNewCategory({ ...newCategory, type: 'income' })}
                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">Pemasukan</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="expense"
                                            checked={newCategory.type === 'expense'}
                                            onChange={() => setNewCategory({ ...newCategory, type: 'expense' })}
                                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">Pengeluaran</span>
                                    </label>
                                </div>
                            </div>

                            {newCategory.type === 'expense' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Bulanan (Opsional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">Rp</span>
                                        <input
                                            type="text"
                                            value={newCategory.monthlyBudget}
                                            onChange={(e) => setNewCategory({ ...newCategory, monthlyBudget: formatCurrencyInput(e.target.value) })}
                                            className="w-full h-10 pl-10 pr-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Isi jika ingin memantau anggaran untuk kategori ini.</p>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const UsersSection = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState<CreateUserData & { confirmPassword: string, isActive: boolean, role: string }>({
        username: '',
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        role: 'guest',
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => UserService.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: UserService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            handleCloseModal();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'User berhasil ditambahkan!',
                confirmButtonColor: '#3085d6',
            });
        },
        onError: (error: any) => {
            console.error('Failed to create user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: `Gagal menambah user: ${error.response?.data?.message || error.message}`,
                confirmButtonColor: '#d33',
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => UserService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            handleCloseModal();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'User berhasil diperbarui!',
                confirmButtonColor: '#3085d6',
            });
        },
        onError: (error: any) => {
            console.error('Failed to update user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: `Gagal memperbarui user: ${error.response?.data?.message || error.message}`,
                confirmButtonColor: '#d33',
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: UserService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'User berhasil dihapus!',
                confirmButtonColor: '#3085d6',
            });
        },
        onError: (error: any) => {
            console.error('Failed to delete user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: `Gagal menghapus user: ${error.response?.data?.message || error.message}`,
                confirmButtonColor: '#d33',
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUser && formData.password !== formData.confirmPassword) {
            Swal.fire('Error', 'Password dan konfirmasi password tidak cocok!', 'error');
            return;
        }

        if (editingUser) {
            const updateData: any = {
                username: formData.username,
                email: formData.email,
                name: formData.name,
                isActive: formData.isActive,
                role: formData.role,
            };
            if (formData.password) {
                if (formData.password !== formData.confirmPassword) {
                    Swal.fire('Error', 'Password dan konfirmasi password tidak cocok!', 'error');
                    return;
                }
                updateData.password = formData.password;
            }
            updateMutation.mutate({ id: editingUser.id, data: updateData });
        } else {
            createMutation.mutate({
                username: formData.username,
                email: formData.email,
                name: formData.name,
                password: formData.password,
                isActive: formData.isActive
            });
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            email: user.email,
            name: user.name,
            password: '',
            confirmPassword: '',
            isActive: user.isActive !== undefined ? user.isActive : true,
            role: user.role || 'guest',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Ingin menghapus user "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            name: '',
            password: '',
            confirmPassword: '',
            isActive: true,
            role: 'guest',
        });
    };

    const filteredUsers = users?.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const stats = {
        total: users?.length || 0,
        active: users?.filter(u => u.isActive).length || 0,
        inactive: users?.filter(u => !u.isActive).length || 0,
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Page Heading & Actions */}
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Daftar Pengguna</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Kelola data pengguna dan hak akses.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">search</span>
                        </div>
                        <input
                            className="block w-full rounded-lg border-0 py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 text-gray-900 dark:text-white bg-white dark:bg-card-dark ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary text-xs sm:text-sm sm:leading-6 shadow-sm transition-shadow outline-none"
                            placeholder="Cari nama atau email..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Add Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center rounded-lg h-[38px] sm:h-[42px] px-4 sm:px-5 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined mr-1.5 sm:mr-2 !text-[18px] sm:!text-[20px]">add</span>
                        Tambah Bendahara
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2">
                <div className="bg-white dark:bg-card-dark p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-card-border shadow-sm flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <div className="size-10 sm:size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined text-lg sm:text-2xl">group</span>
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-sm">Total Pengurus</p>
                        <p className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-dark p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-card-border shadow-sm flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <div className="size-10 sm:size-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                        <span className="material-symbols-outlined text-lg sm:text-2xl">check_circle</span>
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-sm">Aktif</p>
                        <p className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">{stats.active}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-dark p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-card-border shadow-sm flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <div className="size-10 sm:size-12 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        <span className="material-symbols-outlined text-lg sm:text-2xl">person_off</span>
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-sm">Nonaktif</p>
                        <p className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">{stats.inactive}</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="w-full bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Username</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-card-dark">
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="ml-2 sm:ml-4">
                                                    <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 lg:hidden">@{user.username}</div>
                                                    {/* Show role badge on mobile */}
                                                    <span className={`sm:hidden inline-flex mt-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">@{user.username}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{user.email}</td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell capitalize">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium border ${user.isActive
                                                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
                                                : 'bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600/30'
                                                }`}>
                                                {user.isActive ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-gray-400 hover:text-primary dark:hover:text-white p-1 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded transition-colors"
                                                    title="Hapus"
                                                >
                                                    <span className="material-symbols-outlined !text-[18px] sm:!text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-card-border">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-card-dark px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-card-dark px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-400">
                                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> dari <span className="font-medium">{filteredUsers.length}</span> hasil
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <span className="material-symbols-outlined !text-[20px]">chevron_left</span>
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            aria-current={currentPage === i + 1 ? 'page' : undefined}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === i + 1
                                                ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                                                : 'text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-card-border">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingUser ? 'Edit User' : 'Tambah User'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Contoh: Budi Santoso"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Contoh: budi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Contoh: budi@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password {editingUser && <span className="text-gray-400 font-normal">(kosongkan jika tidak ingin mengubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Minimal 6 karakter"
                                    minLength={editingUser && !formData.password ? 0 : 6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    required={!editingUser || !!formData.password}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Ulangi password"
                                />
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                                >
                                    <option value="guest">Guest</option>
                                    <option value="bendahara">Bendahara</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Status Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Status Akun</label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formData.isActive ? 'User dapat login ke aplikasi' : 'User tidak dapat login'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProfileSection = () => {
    const { user } = useAuth();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const changePasswordMutation = useMutation({
        mutationFn: UserService.changePassword,
        onSuccess: () => {
            setIsChangePasswordOpen(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            alert('Password berhasil diubah!');
        },
        onError: (error: any) => {
            alert(`Gagal mengubah password: ${error.response?.data?.message || error.message}`);
        }
    });

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Konfirmasi password tidak cocok');
            return;
        }
        changePasswordMutation.mutate(passwordData);
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Profil Pengguna</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Informasi akun Anda saat ini.</p>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold uppercase">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</h4>
                        <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            disabled
                            defaultValue={user?.name}
                            className="w-full h-10 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <input
                            type="text"
                            disabled
                            defaultValue={user?.role}
                            className="w-full h-10 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed capitalize"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                        Ubah Password
                    </button>
                </div>
            </div>

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-card-border">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ubah Password</h3>
                            <button onClick={() => setIsChangePasswordOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Lama</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Masukkan password lama"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Minimal 8 karakter"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-white dark:bg-background-dark border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Ulangi password baru"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {changePasswordMutation.isPending ? 'Menyimpan...' : 'Simpan Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

type TabId = 'profile' | 'categories' | 'users' | 'transfer-info';

export const Settings = () => {
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('profile');

    // Build tabs based on user role
    const tabs: { id: TabId; label: string; icon: string }[] = isAdmin
        ? [
            { id: 'categories', label: 'Kategori', icon: 'category' },
            { id: 'users', label: 'Pengguna', icon: 'group' },
            { id: 'transfer-info', label: 'Info Transfer', icon: 'payments' },
            { id: 'profile', label: 'Akun', icon: 'person' },
        ]
        : [
            { id: 'profile', label: 'Akun', icon: 'person' },
        ];

    // Set default active tab based on role
    useEffect(() => {
        if (isAdmin) {
            setActiveTab('categories');
        } else {
            setActiveTab('profile');
        }
    }, [isAdmin]);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display flex flex-col transition-colors duration-200 dark">


            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8">
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
                    {/* Sidebar Tabs */}
                    <aside className="w-full md:w-56 lg:w-64 flex-shrink-0">
                        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-3 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {activeTab === 'categories' && isAdmin && <KategoriSection />}
                        {activeTab === 'users' && isAdmin && <UsersSection />}
                        {activeTab === 'transfer-info' && isAdmin && <TransferInfoSection />}
                        {activeTab === 'profile' && <ProfileSection />}
                    </div>
                </div>
            </main>


        </div>
    );
};
