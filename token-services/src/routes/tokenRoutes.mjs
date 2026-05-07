import { Router } from 'express';
import {
    createToken,
    validateToken,
    revokeToken,
    rotateToken,
    createAuthCode,
    exchangeAuthCode
} from '../controllers/tokenController.mjs';
import validate from '../middleware/validate.mjs';
import {
    createTokenValidator,
    validateTokenValidator,
    revokeTokenValidator,
    rotateTokenValidator,
    createAuthCodeValidator,
    exchangeAuthCodeValidator
} from '../validators/tokenValidators.mjs';

const router = Router();

router.post('/tokens/generate', createTokenValidator, validate, createToken);
router.post('/tokens/validate', validateTokenValidator, validate, validateToken);
router.delete('/tokens/revoke', revokeTokenValidator, validate, revokeToken);
router.post('/tokens/rotate', rotateTokenValidator, validate, rotateToken);

router.post('/auth-codes/generate', createAuthCodeValidator, validate, createAuthCode);
router.post('/auth-codes/exchange', exchangeAuthCodeValidator, validate, exchangeAuthCode);

export default router;
