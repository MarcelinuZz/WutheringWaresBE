import { body } from 'express-validator';

export const createTokenValidator = [
    body('user_id')
        .trim()
        .notEmpty().withMessage('user_id diperlukan.')
        .isUUID().withMessage('user_id harus berupa UUID yang valid.')
];

export const validateTokenValidator = [
    body('token')
        .trim()
        .notEmpty().withMessage('Token diperlukan.')
];

export const revokeTokenValidator = [
    body('token')
        .trim()
        .notEmpty().withMessage('Token diperlukan.')
];

export const rotateTokenValidator = [
    body('token')
        .trim()
        .notEmpty().withMessage('Token diperlukan.')
];

export const createAuthCodeValidator = [
    body('user_id')
        .trim()
        .notEmpty().withMessage('user_id diperlukan.')
        .isUUID().withMessage('user_id harus berupa UUID yang valid.')
];

export const exchangeAuthCodeValidator = [
    body('code')
        .trim()
        .notEmpty().withMessage('Code diperlukan.')
];
