import { Router } from 'express';
import { getMe } from '../controllers/userController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';

const router = Router();

router.get('/me', authMiddleware, getMe);

export default router;
