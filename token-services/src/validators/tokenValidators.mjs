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

export const createBindCodeValidator = [
    body('provider')
        .trim()
        .notEmpty().withMessage('Provider diperlukan.')
        .isIn(['google', 'discord']).withMessage('Provider harus google atau discord.'),
    body('provider_id')
        .trim()
        .notEmpty().withMessage('Provider ID diperlukan.')
];

export const exchangeBindCodeValidator = [
    body('code')
        .trim()
        .notEmpty().withMessage('Bind code diperlukan.')
];
