import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { user, session, account, verification } from "../db/schema/auth.js";
import { env } from "../config/env.js";
import { emailService } from "../services/email.service.js";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            user,
            session,
            account,
            verification,
        }
    }),
    session: { 
        expiresIn: 60 * 60, // 1 jam (dalam detik)
        updateAge: 60 * 30, // Refresh session jika user aktif dalam 30 menit terakhir
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5 // Cache 5 menit untuk performa
        }
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
            },
            username: {
                type: "string",
            },
            isActive: {
                type: "boolean",
                required: false,
                defaultValue: true
            },
            profileCompleted: {
                type: "boolean",
            }
        }
    },
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    // Use db.select to avoid db.query type issues
                    const [foundUser] = await db.select({ isActive: user.isActive })
                        .from(user)
                        .where(eq(user.id, session.userId));

                    if (foundUser && foundUser.isActive === false) {
                        // Throwing error to prevent session creation
                        throw new Error("Akun Anda dinonaktifkan. Hubungi admin.");
                    }
                    return {
                        data: {
                            ...session
                        }
                    };
                }
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }) => {
            await emailService.sendPasswordResetEmail(user.email, url, user.name, token);
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await emailService.sendVerificationEmail(user.email, url, user.name);
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    trustedOrigins: env.CORS_ORIGIN.split(',').map(o => o.trim()),
    baseURL: env.BETTER_AUTH_URL,
    debug: true,
    callbacks: {
        session: async ({ session, user }: { session: any, user: any }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    role: user.role,
                    username: user.username,
                    name: user.name
                }
            }
        }
    },
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        },
    },
});
