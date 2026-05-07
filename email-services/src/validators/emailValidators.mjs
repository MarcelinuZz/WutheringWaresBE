import { body } from 'express-validator';

export const sendOTPValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email diperlukan.')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('otp_code')
        .trim()
        .notEmpty().withMessage('Kode OTP diperlukan.')
        .isLength({ min: 6, max: 6 }).withMessage('Kode OTP harus 6 digit.')
        .isNumeric().withMessage('Kode OTP harus berupa angka.')
];
