import { Router } from 'express';
import {
    checkout,
    getOrders,
    getOrderById,
    handleMidtransNotification
} from '../controllers/orderController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';

const router = Router();

router.post('/orders/notification', handleMidtransNotification);

router.post('/checkout', authMiddleware, checkout);
router.get('/orders', authMiddleware, getOrders);
router.get('/orders/:id', authMiddleware, getOrderById);

export default router;
