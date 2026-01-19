/**
 * Test SMTP Configuration
 * Jalankan: npx tsx src/scripts/test-smtp.ts
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testSMTP() {
    console.log('📧 Testing SMTP Configuration...\n');

    // Show current SMTP config (hide password partially)
    console.log('Current SMTP Config:');
    console.log(`  Host: ${process.env.SMTP_HOST || 'NOT SET'}`);
    console.log(`  Port: ${process.env.SMTP_PORT || 'NOT SET'}`);
    console.log(`  User: ${process.env.SMTP_USER || 'NOT SET'}`);
    console.log(`  Pass: ${process.env.SMTP_PASS ? '******' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
    console.log(`  From: ${process.env.SMTP_FROM || 'NOT SET'}`);
    console.log('');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ SMTP not configured! Please set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
        process.exit(1);
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    console.log('🔄 Verifying SMTP connection...');

    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!\n');
    } catch (error: any) {
        console.error('❌ SMTP connection failed:', error.message);
        console.error('\nCommon issues:');
        console.error('  - For Gmail: Enable "App Passwords" (2FA required)');
        console.error('  - Check if SMTP_HOST and SMTP_PORT are correct');
        console.error('  - Check your email/password credentials');
        process.exit(1);
    }

    // Send test email
    console.log('📤 Sending test email...\n');

    const testEmail = process.env.SMTP_USER; // Send to self for testing

    try {
        const info = await transporter.sendMail({
            from: `"Alumni Finance Test" <${process.env.SMTP_FROM}>`,
            to: testEmail,
            subject: '✅ Test Email - Alumni Finance SMTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #2424eb;">🎉 SMTP Test Successful!</h1>
                    <p>Jika Anda menerima email ini, berarti konfigurasi SMTP sudah benar.</p>
                    <p>Timestamp: ${new Date().toISOString()}</p>
                </div>
            `,
        });

        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Sent to: ${testEmail}`);
        console.log('\n🎉 SMTP is working! Check your inbox.');

    } catch (error: any) {
        console.error('❌ Failed to send test email:', error.message);
        process.exit(1);
    }

    process.exit(0);
}

testSMTP();
