import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Prefer Resend (HTTP API) over SMTP for cloud deployments
const useResend = !!env.RESEND_API_KEY;
const resend = useResend ? new Resend(env.RESEND_API_KEY) : null;

// Fallback to SMTP (for local development)
const isSmtpConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
const transporter = !useResend && isSmtpConfigured
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: env.SMTP_PORT === '465',
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    })
    : null;

// Log configuration
if (useResend) {
    console.log('📧 Email configured: Resend (HTTP API)');
} else if (isSmtpConfigured) {
    console.log('📧 Email configured: SMTP');
    console.log(`   Host: ${env.SMTP_HOST}`);
} else {
    console.warn('⚠️ No email service configured. Email features disabled.');
}

export const emailService = {
    async sendVerificationEmail(to: string, url: string, name: string) {
        // Rewrite callbackURL to redirect to frontend verify-email page
        const primaryOrigin = env.CORS_ORIGIN.split(',')[0].trim();
        const frontendCallbackUrl = encodeURIComponent(`${primaryOrigin}/verify-email?verified=true`);
        const modifiedUrl = url.replace(/callbackURL=[^&]*/, `callbackURL=${frontendCallbackUrl}`);

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

        // Use Resend (HTTP API)
        if (resend) {
            try {
                await resend.emails.send({
                    from: `Alumni Finance <${env.RESEND_FROM_EMAIL}>`,
                    to: [to],
                    subject: 'Verifikasi Email Anda - Alumni Finance',
                    html,
                });
                console.log(`✅ Verification email sent to ${to} via Resend`);
            } catch (error) {
                console.error('❌ Failed to send verification email via Resend:', error);
                throw error;
            }
            return;
        }

        // Use SMTP (fallback)
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: `"Alumni Finance" <${env.SMTP_FROM}>`,
                    to,
                    subject: 'Verifikasi Email Anda - Alumni Finance',
                    html,
                });
                console.log(`✅ Verification email sent to ${to} via SMTP`);
            } catch (error) {
                console.error('❌ Failed to send verification email via SMTP:', error);
                throw error;
            }
            return;
        }

        // No email service configured (dev mode)
        console.log(`📧 [DEV MODE] Verification email would be sent to ${to}`);
        console.log(`   Verification URL: ${modifiedUrl}`);
    },

    async sendPasswordResetEmail(to: string, url: string, name: string, token?: string) {
        const primaryOrigin = env.CORS_ORIGIN.split(',')[0].trim();
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

        // Use Resend (HTTP API)
        if (resend) {
            try {
                await resend.emails.send({
                    from: `Alumni Finance <${env.RESEND_FROM_EMAIL}>`,
                    to: [to],
                    subject: 'Reset Password - Alumni Finance',
                    html,
                });
                console.log(`✅ Password reset email sent to ${to} via Resend`);
            } catch (error) {
                console.error('❌ Failed to send password reset email via Resend:', error);
                throw error;
            }
            return;
        }

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
