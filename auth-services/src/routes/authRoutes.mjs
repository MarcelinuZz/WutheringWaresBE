import { Router } from 'express';
import {
    sendOTP,
    verifyOTPAndRegister,
    login,
    googleAuth,
    googleCallback,
    discordAuth,
    discordCallback,
    exchangeToken,
    logout,
    terminateSession
} from '../controllers/authController.mjs';
import authMiddleware from '../middleware/authMiddleware.mjs';
import validate from '../middleware/validate.mjs';
import {
    sendOTPValidator,
    verifyOTPAndRegisterValidator,
    loginValidator,
    exchangeTokenValidator
} from '../validators/authValidators.mjs';

const router = Router();

router.post('/register/send-otp', sendOTPValidator, validate, sendOTP);
router.post('/register/verify-otp', verifyOTPAndRegisterValidator, validate, verifyOTPAndRegister);
router.post('/login', loginValidator, validate, login);

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

router.get('/discord', discordAuth);
router.get('/discord/callback', discordCallback);

router.post('/exchange-token', exchangeTokenValidator, validate, exchangeToken);

router.delete('/logout', authMiddleware, logout);
router.delete('/terminate-session', authMiddleware, terminateSession);

export default router;
