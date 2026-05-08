import { Router } from 'express';
import {
    getMe,
    changePassword,
    bindGoogle,
    unbindGoogle,
    bindDiscord,
    unbindDiscord
} from '../controllers/userController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';
import validate from '../middleware/validate.mjs';
import {
    changePasswordValidator,
    bindProviderValidator
} from '../validators/userValidators.mjs';

const router = Router();

router.get('/me', authMiddleware, getMe);

router.put('/change-password', authMiddleware, changePasswordValidator, validate, changePassword);

router.post('/bind/google', authMiddleware, bindProviderValidator, validate, bindGoogle);
router.delete('/unbind/google', authMiddleware, unbindGoogle);

router.post('/bind/discord', authMiddleware, bindProviderValidator, validate, bindDiscord);
router.delete('/unbind/discord', authMiddleware, unbindDiscord);

export default router;
