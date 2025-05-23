import { createTransport } from 'nodemailer';

// Email configuration (use environment variables for security)
const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export async function sendNotification(email, subject, message) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: subject,
            text: message
        });
        console.log('Email notification sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
