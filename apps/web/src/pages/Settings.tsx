import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService, Category } from '../services/category.service';
import { UserService, User, CreateUserData } from '../services/user.service';

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
            alert('Kategori berhasil ditambahkan!');
        },
        onError: (error: any) => {
            console.error('Failed to create category:', error);
            const message = error.response?.data?.message || 'Terjadi kesalahan pada server. Mohon coba lagi.';
            alert(`Gagal menambah kategori: ${message}`);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<typeof newCategory> }) => CategoryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsModalOpen(false);
            setEditingCategory(null);
            setNewCategory({ name: '', type: 'income', monthlyBudget: '' });
            alert('Kategori berhasil diperbarui!');
        },
        onError: (error: any) => {
            console.error('Failed to update category:', error);
            const message = error.response?.data?.message || 'Terjadi kesalahan pada server. Mohon coba lagi.';
            alert(`Gagal memperbarui kategori: ${message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: CategoryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            alert('Kategori berhasil dihapus!');
        },
        onError: (error: any) => {
            console.error('Failed to delete category:', error);
            alert(`Gagal menghapus kategori: ${error.response?.data?.message || error.message}`);
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
        if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
            deleteMutation.mutate(id);
        }
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
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Kategori</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola kategori pemasukan dan pengeluaran.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Kategori
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Income Categories */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-5">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">arrow_downward</span>
                        Pemasukan
                    </h4>
                    <div className="space-y-3">
                        {incomeCategories.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Belum ada kategori pemasukan.</p>
                        ) : incomeCategories.map((category: Category) => (
                            <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="size-3 rounded-full bg-green-500"></div>
                                    <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id, category.name)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border p-5">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">arrow_upward</span>
                        Pengeluaran
                    </h4>
                    <div className="space-y-3">
                        {expenseCategories.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Belum ada kategori pengeluaran.</p>
                        ) : expenseCategories.map((category: Category) => (
                            <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="size-3 rounded-full bg-red-500"></div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                        {category.monthlyBudget && parseFloat(category.monthlyBudget) > 0 && (
                                            <span className="text-xs text-gray-500">Budget: Rp {Number(category.monthlyBudget).toLocaleString('id-ID')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id, category.name)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
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
    const [formData, setFormData] = useState<CreateUserData & { confirmPassword: string }>({
        username: '',
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
    });

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => UserService.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: UserService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            handleCloseModal();
            alert('User berhasil ditambahkan!');
        },
        onError: (error: any) => {
            console.error('Failed to create user:', error);
            alert(`Gagal menambah user: ${error.response?.data?.message || error.message}`);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => UserService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            handleCloseModal();
            alert('User berhasil diperbarui!');
        },
        onError: (error: any) => {
            console.error('Failed to update user:', error);
            alert(`Gagal memperbarui user: ${error.response?.data?.message || error.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: UserService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            alert('User berhasil dihapus!');
        },
        onError: (error: any) => {
            console.error('Failed to delete user:', error);
            alert(`Gagal menghapus user: ${error.response?.data?.message || error.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUser && formData.password !== formData.confirmPassword) {
            alert('Password dan konfirmasi password tidak cocok!');
            return;
        }

        if (editingUser) {
            const updateData: any = {
                username: formData.username,
                email: formData.email,
                name: formData.name,
            };
            if (formData.password) {
                if (formData.password !== formData.confirmPassword) {
                    alert('Password dan konfirmasi password tidak cocok!');
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
            });
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            name: user.name,
            password: '',
            confirmPassword: '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`)) {
            deleteMutation.mutate(id);
        }
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
        });
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Pengguna</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola pengguna yang dapat mengakses aplikasi.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Tambah User
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-card-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users && users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.username}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 capitalize">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Hapus"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Belum ada pengguna terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                    <button className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                        Ubah Password
                    </button>
                </div>
            </div>
        </div>
    );
}

type TabId = 'profile' | 'categories' | 'users';

export const Settings = () => {
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('profile');

    // Build tabs based on user role
    const tabs: { id: TabId; label: string; icon: string }[] = isAdmin
        ? [
            { id: 'categories', label: 'Kategori', icon: 'category' },
            { id: 'users', label: 'Pengguna', icon: 'group' },
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
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col transition-colors duration-200 dark">
            <Navbar />

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-10 py-8">
                {/* Page Constants */}
                <div className="mb-8">
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">Pengaturan</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal">Kelola preferensi aplikasi dan data master.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {activeTab === 'categories' && isAdmin && <KategoriSection />}
                        {activeTab === 'users' && isAdmin && <UsersSection />}
                        {activeTab === 'profile' && <ProfileSection />}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-card-border mt-auto bg-white dark:bg-card-dark py-8">
                <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">© 2023 AlumniFinance. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
                        <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Syarat &amp; Ketentuan</a>
                        <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Bantuan</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
