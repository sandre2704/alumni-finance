import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Prefer SMTP per user request (even though Railway blocks it, we will try)
// const useResend = !!env.RESEND_API_KEY; // Disabled for now
const useResend = false;
const resend = null;

// SMTP Configuration
const isSmtpConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
const transporter = isSmtpConfigured
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
        // Debug and connection settings
        debug: true,
        logger: true,
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 30000,
    })
    : null;

// Log configuration
if (isSmtpConfigured) {
    console.log('📧 Email configured: SMTP (Primary)');
    console.log(`   Host: ${env.SMTP_HOST}`);
    console.log(`   Port: ${env.SMTP_PORT}`);
    console.log(`   User: ${env.SMTP_USER}`);
} else {
    console.warn('⚠️ No email service configured. Email features disabled.');
}

export const emailService = {
    async sendVerificationEmail(to: string, url: string, name: string) {
        // Smart frontend URL selection based on environment
        const origins = env.CORS_ORIGIN.split(',').map(o => o.trim());
        const primaryOrigin = env.NODE_ENV === 'production'
            ? origins.find(o => !o.includes('localhost')) || origins[0]
            : origins.find(o => o.includes('localhost')) || origins[0];

        const frontendCallbackUrl = encodeURIComponent(`${primaryOrigin}/verify-email?verified=true`);
        // Use custom /api/verify endpoint instead of /api/auth/verify-email (Railway blocks the latter)
        const modifiedUrl = url
            .replace('/api/auth/verify-email', '/api/verify')
            .replace(/callbackURL=[^&]*/, `callbackURL=${frontendCallbackUrl}`);

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2424eb; text-align: center;">Alumni Finance</h1>
                <h2 style="text-align: center;">Verifikasi Email Anda</h2>
                <p>Halo ${name},</p>
                <p>Terima kasih telah mendaftar di Alumni Finance. Silakan klik tombol di bawah ini untuk memverifikasi email Anda:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${modifiedUrl}" style="background-color: #2424eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Verifikasi Email
                    </a>
                </div>
                <p>Atau salin dan tempel link berikut di browser Anda:</p>
                <p style="word-break: break-all; color: #666;">${modifiedUrl}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Jika Anda tidak mendaftar di Alumni Finance, abaikan email ini.
                </p>
            </div>
        `;

        /* Resend logic removed to fix type error and rely on SMTP
        // Use Resend (HTTP API)
        if (resend) {
            // ...
        }
        */

        // Use SMTP (fallback)
        if (transporter) {
            console.log(`⏳ [SMTP] Memulai proses pengiriman email ke ${to}...`);
            try {
                await transporter.sendMail({
                    from: `"Alumni Finance" <${env.SMTP_FROM}>`,
                    to,
                    subject: 'Verifikasi Email Anda - Alumni Finance',
                    html,
                });
                console.log(`✅ [SMTP] Berhasil mengirim email verifikasi ke ${to}`);
            } catch (error) {
                console.error('❌ [SMTP] Gagal mengirim email:', error);
                throw error;
            }
            return;
        }

        // No email service configured (dev mode)
        console.log(`📧 [DEV MODE] Verification email would be sent to ${to}`);
        console.log(`   Verification URL: ${modifiedUrl}`);
    },

    async sendPasswordResetEmail(to: string, url: string, name: string, token?: string) {
        // Smart frontend URL selection based on environment
        const origins = env.CORS_ORIGIN.split(',').map(o => o.trim());
        const primaryOrigin = env.NODE_ENV === 'production'
            ? origins.find(o => !o.includes('localhost')) || origins[0]
            : origins.find(o => o.includes('localhost')) || origins[0];

        const resetLink = token ? `${primaryOrigin}/reset-password?token=${token}` : url;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2424eb; text-align: center;">Alumni Finance</h1>
                <h2 style="text-align: center;">Reset Password</h2>
                <p>Halo ${name},</p>
                <p>Kami menerima permintaan untuk mereset password Anda. Klik tombol di bawah ini:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2424eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                <p>Link ini akan kadaluarsa dalam 1 jam.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Jika Anda tidak meminta reset password, abaikan email ini.
                </p>
            </div>
        `;

        /* Resend logic removed to fix type error and rely on SMTP
        // Use Resend (HTTP API)
        if (resend) {
            // ...
        }
        */

        // Use SMTP (fallback)
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: `"Alumni Finance" <${env.SMTP_FROM}>`,
                    to,
                    subject: 'Reset Password - Alumni Finance',
                    html,
                });
                console.log(`✅ Password reset email sent to ${to} via SMTP`);
            } catch (error) {
                console.error('❌ Failed to send password reset email via SMTP:', error);
                throw error;
            }
            return;
        }

        // No email service configured (dev mode)
        console.log(`📧 [DEV MODE] Password reset email would be sent to ${to}`);
        console.log(`   Reset URL: ${resetLink}`);
    },
};
