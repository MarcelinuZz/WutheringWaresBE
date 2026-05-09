import { body } from 'express-validator';

export const addItemValidator = [
    body('name')
        .notEmpty().withMessage('Name is required.')
        .isString().withMessage('Name must be a string.'),
    body('type')
        .notEmpty().withMessage('Type is required.')
        .isString().withMessage('Type must be a string.'),
    body('price')
        .notEmpty().withMessage('Price is required.')
        .isNumeric().withMessage('Price must be a number.'),
    body('rarity')
        .notEmpty().withMessage('Rarity is required.')
        .isInt({ min: 1 }).withMessage('Rarity must be a positive integer.'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
    body('description')
        .optional()
        .isString().withMessage('Description must be a string.'),
    body('image')
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('Image is required.');
            }
            return true;
        })
];

export const updateItemValidator = [
    body('name')
        .optional()
        .isString().withMessage('Name must be a string.'),
    body('type')
        .optional()
        .isString().withMessage('Type must be a string.'),
    body('price')
        .optional()
        .isNumeric().withMessage('Price must be a number.'),
    body('rarity')
        .optional()
        .isInt({ min: 1 }).withMessage('Rarity must be a positive integer.'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
    body('description')
        .optional()
        .isString().withMessage('Description must be a string.')
];
