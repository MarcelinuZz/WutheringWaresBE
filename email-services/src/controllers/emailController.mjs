import transporter from '../config/emailConfig.mjs';
import { otpTemplate } from '../templates/otpTemplate.mjs';

export const sendOTP = async (req, res, next) => {
    try {
        const { email, otp_code } = req.body;

        const mailOptions = {
            from: `"Wuthering Wares" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Kode Verifikasi OTP - Wuthering Wares',
            html: otpTemplate(otp_code)
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'OTP berhasil dikirim.' });
    } catch (error) {
        next(error);
    }
};
