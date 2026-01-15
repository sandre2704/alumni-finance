import { db } from '../db/index.js';
import { user as users } from '../db/schema/index.js'; // Aliasing user as users to minimize code changes
import { eq, ne } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';
import { auth } from '../lib/auth.js';

class UserService {

    async getNonAdminUsers() {
        const userList = await db.query.user.findMany({
            where: ne(users.role, 'admin'),
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
                }
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

    async update(id: string, data: { username?: string; email?: string; name?: string; password?: string }) {
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

        // Password update is complex with better-auth manual update, skipping for now or use auth.api if possible
        // For now preventing password update via this endpoint or needs specific handling
        if (data.password) {
            // TODO: Implement password update via better-auth
            // await auth.api.changePassword({ ... }) requires current password or session
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
