import { body } from 'express-validator';

export const sendOTPValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email diperlukan.')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail()
];

export const verifyOTPAndRegisterValidator = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('Nama lengkap diperlukan.')
        .isLength({ max: 100 }).withMessage('Nama lengkap maksimal 100 karakter.'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email diperlukan.')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password diperlukan.')
        .isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
    body('otp_code')
        .trim()
        .notEmpty().withMessage('Kode OTP diperlukan.')
        .isLength({ min: 6, max: 6 }).withMessage('Kode OTP harus 6 digit.')
        .isNumeric().withMessage('Kode OTP harus berupa angka.')
];

export const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email diperlukan.')
        .isEmail().withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password diperlukan.')
];

export const exchangeTokenValidator = [
    body('code')
        .trim()
        .notEmpty().withMessage('Auth code diperlukan.')
        .isLength({ min: 64, max: 64 }).withMessage('Auth code harus 64 karakter.')
];
