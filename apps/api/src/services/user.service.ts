import { db } from '../db/index.js';
import { user as users, account } from '../db/schema/index.js'; // Aliasing user as users to minimize code changes
import { eq, ne, and } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';
import { auth } from '../lib/auth.js';
import { hashPassword } from "better-auth/crypto";
class UserService {

    async getNonAdminUsers() {
        const userList = await db.query.user.findMany({
            where: ne(users.role, 'admin'),
            orderBy: (users, { desc }) => [desc(users.createdAt)],
        });
        return userList;
    }

    async getById(id: string) {
        const user = await db.query.user.findFirst({
            where: eq(users.id, id),
            columns: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }

    async create(data: { username: string; email: string; name: string; password: string }) {
        // Create user using better-auth API to handle password hashing and account creation
        try {
            // Note: This will create a session for the created user which we ignore
            const result = await auth.api.signUpEmail({
                body: {
                    email: data.email,
                    password: data.password,
                    name: data.name,
                    role: 'guest',
                    username: data.username,
                    isActive: true,
                    profileCompleted: false
                } as any
            });

            if (!result) {
                throw new AppError(500, "Failed to create user with better-auth");
            }

            // Manually update username and role, as signUpEmail might not set them or they need to be consistent
            // better-auth might not support username in signUpEmail body by default unless configured
            // We configured schema with username.

            // Update the user to set username and role
            const [updatedUser] = await db.update(users)
                .set({
                    username: data.username,
                    role: 'guest'
                })
                .where(eq(users.id, result.user.id))
                .returning();

            return updatedUser;
        } catch (e: any) {
            if (e.body?.message) {
                throw new AppError(400, e.body.message);
            }
            throw e;
        }
    }

    async update(id: string, data: { username?: string; email?: string; name?: string; password?: string, isActive?: boolean, role?: string }) {
        const existingUser = await db.query.user.findFirst({
            where: eq(users.id, id),
        });

        if (!existingUser) {
            throw new AppError(404, 'User tidak ditemukan');
        }

        // Prevent updating admin users
        if (existingUser.role === 'admin') {
            throw new AppError(403, 'Tidak dapat mengubah user admin');
        }

        // Check username uniqueness if changing
        if (data.username && data.username !== existingUser.username) {
            const existing = await db.query.user.findFirst({
                where: eq(users.username, data.username),
            });
            if (existing) {
                throw new AppError(400, 'Username sudah digunakan');
            }
        }

        // Check email uniqueness if changing
        if (data.email && data.email !== existingUser.email) {
            const existing = await db.query.user.findFirst({
                where: eq(users.email, data.email),
            });
            if (existing) {
                throw new AppError(400, 'Email sudah digunakan');
            }
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (data.username) updateData.username = data.username;
        if (data.email) updateData.email = data.email;
        if (data.name) updateData.name = data.name;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.role) updateData.role = data.role;

        if (data.password) {
            const hashedPassword = await hashPassword(data.password);
            
            const existingAccount = await db.query.account.findFirst({
                where: and(eq(account.userId, id), eq(account.providerId, 'credential'))
            });

            if (existingAccount) {
                await db.update(account)
                    .set({ password: hashedPassword, updatedAt: new Date() })
                    .where(eq(account.id, existingAccount.id));
            } else {
                throw new AppError(400, "User tidak memiliki akun kredensial untuk update password.");
            }
        }

        const [updatedUser] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                username: users.username,
                email: users.email,
                name: users.name,
                role: users.role,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        return updatedUser;
    }

    async delete(id: string) {
        const existingUser = await db.query.user.findFirst({
            where: eq(users.id, id),
        });

        if (!existingUser) {
            throw new AppError(404, 'User tidak ditemukan');
        }

        // Prevent deleting admin users
        if (existingUser.role === 'admin') {
            throw new AppError(403, 'Tidak dapat menghapus user admin');
        }

        await db.delete(users).where(eq(users.id, id));
        return { success: true };
    }
}

export const userService = new UserService();
