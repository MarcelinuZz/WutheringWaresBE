import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function verifyConnection() {
    try {
        await transporter.verify();
        console.log('[Email Service] SMTP connection successful');
    } catch (error) {
        console.error('[Email Service] SMTP connection error:', error.message);
    }
}

verifyConnection();

export default transporter;
