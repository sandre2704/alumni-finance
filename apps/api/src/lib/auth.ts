import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index";
import { account, session, user, verification } from "../db/schema/auth";
import { env } from "../config/env";
import { emailService } from "../services/email.service";

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
    user: {
        additionalFields: {
            role: {
                type: "string",
            },
            username: {
                type: "string",
            },
            profileCompleted: {
                type: "boolean",
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, // Enabled - users must verify email
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
        callbackURL: "http://localhost:5173/verify-email?verified=true",
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],
    baseURL: env.BETTER_AUTH_URL,
    debug: true,
});
