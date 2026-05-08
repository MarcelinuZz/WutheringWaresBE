import { body } from 'express-validator';

export const changePasswordValidator = [
    body('old_password')
        .notEmpty().withMessage('Password lama diperlukan.'),
    body('new_password')
        .notEmpty().withMessage('Password baru diperlukan.')
        .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter.'),
    body('confirm_password')
        .notEmpty().withMessage('Konfirmasi password diperlukan.')
];

export const bindProviderValidator = [
    body('bind_code')
        .trim()
        .notEmpty().withMessage('Bind code diperlukan.')
];
