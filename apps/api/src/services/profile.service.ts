import { db } from '../db/index.js';
import { user as users, account } from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';
import { auth } from '../lib/auth.js';

/**
 * Hash password using better-auth internal context
 */
async function hashPassword(password: string): Promise<string> {
    const ctx = await auth.$context;
    return ctx.password.hash(password);
}

class ProfileService {
    /**
     * Complete profile for OAuth user - set username and password
     */
    async completeProfile(userId: string, data: { username: string; password: string }) {
        // Check if user exists
        const existingUser = await db.query.user.findFirst({
            where: eq(users.id, userId),
        });

        if (!existingUser) {
            throw new AppError(404, 'User tidak ditemukan');
        }

        // Check if profile already completed
        if (existingUser.profileCompleted) {
            throw new AppError(400, 'Profile sudah dilengkapi sebelumnya');
        }

        // Validate username format (alphanumeric, min 3 chars)
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
            throw new AppError(400, 'Username harus 3-20 karakter alfanumerik');
        }

        // Check username uniqueness
        const usernameExists = await db.query.user.findFirst({
            where: eq(users.username, data.username),
        });
        if (usernameExists) {
            throw new AppError(400, 'Username sudah digunakan');
        }

        // Validate password (min 8 chars)
        if (data.password.length < 8) {
            throw new AppError(400, 'Password minimal 8 karakter');
        }

        // Hash password using scrypt
        const hashedPassword = await hashPassword(data.password);

        // Check if credential account already exists for this user
        const credentialAccountExists = await db.query.account.findFirst({
            where: and(
                eq(account.userId, userId),
                eq(account.providerId, 'credential')
            ),
        });

        if (!credentialAccountExists) {
            // Create new credential account for email/password login
            await db.insert(account).values({
                id: crypto.randomUUID(),
                accountId: existingUser.email,
                providerId: 'credential',
                userId: userId,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else {
            // Update existing credential account with new password
            await db.update(account)
                .set({
                    password: hashedPassword,
                    updatedAt: new Date()
                })
                .where(eq(account.id, credentialAccountExists.id));
        }

        // Update user with username and mark profile as completed
        const [updatedUser] = await db.update(users)
            .set({
                username: data.username,
                profileCompleted: true,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                username: users.username,
                email: users.email,
                name: users.name,
                role: users.role,
                profileCompleted: users.profileCompleted,
            });

        return updatedUser;
    }

    /**
     * Check if username is available
     */
    async checkUsernameAvailable(username: string) {
        const existing = await db.query.user.findFirst({
            where: eq(users.username, username),
        });
        return !existing;
    }

    /**
     * Get user profile completion status
     */
    async getProfileStatus(userId: string) {
        const user = await db.query.user.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                profileCompleted: true,
                username: true,
            },
        });

        if (!user) {
            throw new AppError(404, 'User tidak ditemukan');
        }

        return {
            profileCompleted: user.profileCompleted ?? false,
            hasUsername: !!user.username,
        };
    }

    /**
     * Get email by username (for login with username)
     * Also returns isActive status for pre-login validation
     */
    async getEmailByUsername(username: string): Promise<{ email: string; isActive: boolean } | null> {
        const user = await db.query.user.findFirst({
            where: eq(users.username, username),
            columns: {
                email: true,
                isActive: true,
            },
        });

        if (!user?.email) return null;

        return {
            email: user.email,
            isActive: user.isActive ?? true
        };
    }

    /**
     * Check user active status by email (for pre-login validation)
     */
    async getUserStatusByEmail(email: string): Promise<{ isActive: boolean } | null> {
        const user = await db.query.user.findFirst({
            where: eq(users.email, email),
            columns: {
                isActive: true,
            },
        });

        if (!user) return null;

        return {
            isActive: user.isActive ?? true
        };
    }
    /**
     * Change user password
     */
    async changePassword(userId: string, data: { oldPassword: string; newPassword: string; confirmPassword: string }) {
        if (data.newPassword !== data.confirmPassword) {
            throw new AppError(400, 'Konfirmasi password tidak cocok');
        }

        if (data.newPassword.length < 8) {
            throw new AppError(400, 'Password baru minimal 8 karakter');
        }

        // Get credential account
        const credentialAccount = await db.query.account.findFirst({
            where: and(
                eq(account.userId, userId),
                eq(account.providerId, 'credential')
            ),
        });

        if (!credentialAccount) {
            throw new AppError(400, 'Akun ini tidak menggunakan login password (mungkin Google Login?)');
        }

        // Verify old password
        const ctx = await auth.$context;
        const isValid = await ctx.password.verify({
            hash: credentialAccount.password!,
            password: data.oldPassword
        });

        if (!isValid) {
            throw new AppError(400, 'Password lama salah');
        }

        // Hash new password
        const hashedPassword = await hashPassword(data.newPassword);

        // Update password
        await db.update(account)
            .set({
                password: hashedPassword,
                updatedAt: new Date()
            })
            .where(eq(account.id, credentialAccount.id));

        return true;
    }
}

export const profileService = new ProfileService();

