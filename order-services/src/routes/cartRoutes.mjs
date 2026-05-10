import { Router } from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cartController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';
import validate from '../middleware/validate.mjs';
import { addToCartValidator, updateCartValidator } from '../validators/cartValidators.mjs';

const router = Router();

router.get('/', authMiddleware, getCart);
router.post('/', authMiddleware, addToCartValidator, validate, addToCart);
router.patch('/:id', authMiddleware, updateCartValidator, validate, updateCartItem);
router.delete('/:id', authMiddleware, removeFromCart);
router.delete('/', authMiddleware, clearCart);

export default router;
