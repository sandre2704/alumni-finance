import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Strategy Pattern for Email
// 1. Try Resend (HTTP API - best for cloud)
// 2. Try SMTP (Nodemailer - fallback)
// 3. Dev Mode (Console log only)

const useResend = !!env.RESEND_API_KEY;
const resend = useResend ? new Resend(env.RESEND_API_KEY) : null;

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

        // 1. Use Resend (HTTP API)
        if (resend) {
            console.log(`⏳ [Resend] Memulai proses pengiriman email ke ${to}...`);
            try {
                await resend.emails.send({
                    from: env.RESEND_FROM_EMAIL,
                    to,
                    subject: 'Verifikasi Email Anda - Alumni Finance',
                    html,
                });
                console.log(`✅ [Resend] Berhasil mengirim email verifikasi ke ${to}`);
                return;
            } catch (error) {
                console.error('❌ [Resend] Gagal mengirim email:', error);
                // Fallthrough to SMTP if Resend fails
            }
        }

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

        // 1. Use Resend (HTTP API)
        if (resend) {
            console.log(`⏳ [Resend] Memulai proses pengiriman email ke ${to}...`);
            try {
                await resend.emails.send({
                    from: env.RESEND_FROM_EMAIL,
                    to,
                    subject: 'Reset Password - Alumni Finance',
                    html,
                });
                console.log(`✅ [Resend] Password reset email sent to ${to}`);
                return;
            } catch (error) {
                console.error('❌ [Resend] Failed to send password reset email:', error);
                // Fallthrough to SMTP if Resend fails
            }
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

    async sendDonationReceiptEmail(params: {
        to: string;
        donorName: string;
        amount: number;
        targetName: string;
        orderId: string;
        transactionDate: string;
        status: 'success' | 'pending';
    }) {
        const { to, donorName, amount, targetName, orderId, transactionDate, status } = params;

        const formattedAmount = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);

        const statusText = status === 'success' ? 'Berhasil' : 'Menunggu Pembayaran';
        const statusColor = status === 'success' ? '#16a34a' : '#ca8a04';
        const statusBg = status === 'success' ? '#f0fdf4' : '#fefce8';

        const html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f8fafc;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #2424eb 0%, #1a1a8e 100%); padding: 32px 24px; text-align: center; border-radius: 0 0 16px 16px;">
                    <h1 style="color: white; margin: 0 0 8px 0; font-size: 24px;">Alumni Finance</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Bukti Donasi</p>
                </div>

                <!-- Content -->
                <div style="padding: 32px 24px;">
                    <!-- Status Badge -->
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="display: inline-block; background: ${statusBg}; color: ${statusColor}; padding: 8px 20px; border-radius: 24px; font-weight: 600; font-size: 14px; border: 1px solid ${statusColor}20;">
                            ${status === 'success' ? '✅' : '⏳'} ${statusText}
                        </span>
                    </div>

                    <p style="color: #334155; font-size: 16px; margin-bottom: 24px;">
                        Halo <strong>${donorName}</strong>,
                    </p>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                        ${status === 'success'
                            ? 'Terima kasih atas donasi Anda! Berikut adalah bukti donasi Anda:'
                            : 'Donasi Anda sedang diproses. Berikut adalah detail transaksi:'}
                    </p>

                    <!-- Transaction Card -->
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">No. Order</td>
                                <td style="padding: 10px 0; color: #1e293b; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9; font-family: monospace;">${orderId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Tanggal</td>
                                <td style="padding: 10px 0; color: #1e293b; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9;">${transactionDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Alokasi</td>
                                <td style="padding: 10px 0; color: #1e293b; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9;">${targetName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 14px 0 10px; color: #64748b; font-size: 13px;">Total Donasi</td>
                                <td style="padding: 14px 0 10px; color: #2424eb; font-size: 20px; font-weight: 700; text-align: right;">${formattedAmount}</td>
                            </tr>
                        </table>
                    </div>

                    ${status === 'success' ? `
                    <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;">
                        Donasi Anda telah diterima dan akan digunakan sebaik-baiknya untuk kegiatan alumni. Semoga menjadi amal jariyah. 🤲
                    </p>
                    ` : `
                    <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;">
                        Silakan selesaikan pembayaran Anda. Status akan otomatis terupdate setelah pembayaran diterima.
                    </p>
                    `}
                </div>

                <!-- Footer -->
                <div style="padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        Email ini dikirim otomatis oleh Alumni Finance. Jangan membalas email ini.
                    </p>
                </div>
            </div>
        `;

        const subject = status === 'success'
            ? `✅ Bukti Donasi ${formattedAmount} - Alumni Finance`
            : `⏳ Donasi Anda Sedang Diproses - Alumni Finance`;

        // 1. Use Resend
        if (resend) {
            try {
                await resend.emails.send({
                    from: env.RESEND_FROM_EMAIL,
                    to,
                    subject,
                    html,
                });
                console.log(`✅ [Resend] Donation receipt email sent to ${to}`);
                return;
            } catch (error) {
                console.error('❌ [Resend] Failed to send donation receipt:', error);
            }
        }

        // 2. Use SMTP
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: `"Alumni Finance" <${env.SMTP_FROM}>`,
                    to,
                    subject,
                    html,
                });
                console.log(`✅ [SMTP] Donation receipt email sent to ${to}`);
            } catch (error) {
                console.error('❌ [SMTP] Failed to send donation receipt:', error);
            }
            return;
        }

        // 3. Dev mode
        console.log(`📧 [DEV MODE] Donation receipt email would be sent to ${to}`);
        console.log(`   Order: ${orderId}, Amount: ${formattedAmount}, Status: ${statusText}`);
    },
};
