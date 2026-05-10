import { body, param } from 'express-validator';

export const addToCartValidator = [
    body('item_id')
        .notEmpty().withMessage('item_id wajib diisi.')
        .isString().withMessage('item_id harus berupa string.'),
    body('quantity')
        .notEmpty().withMessage('quantity wajib diisi.')
        .isInt({ min: 1 }).withMessage('quantity harus berupa bilangan bulat minimal 1.')
];

export const updateCartValidator = [
    param('id')
        .notEmpty().withMessage('Cart ID wajib diisi.'),
    body('quantity')
        .notEmpty().withMessage('quantity wajib diisi.')
        .isInt({ min: 1 }).withMessage('quantity harus berupa bilangan bulat minimal 1.')
];
