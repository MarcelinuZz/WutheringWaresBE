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

router.post('/auth/register/send-otp', sendOTPValidator, validate, sendOTP);
router.post('/auth/register/verify-otp', verifyOTPAndRegisterValidator, validate, verifyOTPAndRegister);
router.post('/auth/login', loginValidator, validate, login);

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleCallback);

router.get('/auth/discord', discordAuth);
router.get('/auth/discord/callback', discordCallback);

router.post('/auth/exchange-token', exchangeTokenValidator, validate, exchangeToken);

router.post('/auth/logout', authMiddleware, logout);
router.post('/auth/terminate-session', authMiddleware, terminateSession);

export default router;
