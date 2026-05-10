import { requestTokenService } from '../utils/internalRequest.mjs';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
            });
        }

        const token = authHeader.split(' ')[1];

        const result = await requestTokenService('/tokens/validate', 'POST', { token });

        req.userId = result.user_id;
        req.token = token;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message || 'Token tidak valid atau sudah kadaluarsa.'
        });
    }
};

export default authMiddleware;
