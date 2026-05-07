import { Router } from 'express';
import { sendOTP } from '../controllers/emailController.mjs';
import validate from '../middleware/validate.mjs';
import { sendOTPValidator } from '../validators/emailValidators.mjs';

const router = Router();

router.post('/send-otp', sendOTPValidator, validate, sendOTP);

export default router;
