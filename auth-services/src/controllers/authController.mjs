import passport from '../config/passportConfig.mjs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/dbConfig.mjs';
import { requestTokenService, requestEmailService } from '../utils/internalRequest.mjs';
import crypto from 'crypto';

const OTP_EXPIRY_MINUTES = 5;

const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        otp += digits[randomBytes[i] % digits.length];
    }
    return otp;
};

export const sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
        }

        const otpCode = generateOTP();

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

        await db.query(
            'DELETE FROM otp_codes WHERE email = ?',
            [email]
        );

        await db.query(
            'INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)',
            [email, otpCode, expiresAt]
        );

        await requestEmailService('/send-otp', 'POST', {
            email,
            otp_code: otpCode
        });

        res.json({ success: true, message: 'Kode OTP telah dikirim ke email Anda.' });
    } catch (error) {
        next(error);
    }
};

export const verifyOTPAndRegister = async (req, res, next) => {
    try {
        const { full_name, email, password, otp_code } = req.body;

        const [otpRows] = await db.query(
            'SELECT * FROM otp_codes WHERE otp_code = ? AND is_verified = FALSE',
            [otp_code]
        );

        const [otpEmailRows] = await db.query(
            'SELECT * FROM otp_codes WHERE email = ? AND otp_code = ? AND is_verified = FALSE',
            [email, otp_code]
        );

        if (otpEmailRows.length === 0) {
            if (otpRows.length === 0) {
                return res.status(400).json({ success: false, message: 'Kode OTP tidak valid.' });
            }

            return res.status(400).json({ success: false, message: 'Email tidak sesuai dengan kode OTP.' });
        }

        const otpData = otpRows[0];

        if (new Date(otpData.expires_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'Kode OTP telah kadaluarsa.' });
        }

        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
        }

        await db.query(
            'UPDATE otp_codes SET is_verified = TRUE WHERE id = ?',
            [otpData.id]
        );

        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 12);

        await db.query(
            'INSERT INTO users (id, full_name, email) VALUES (?, ?, ?)',
            [userId, full_name, email]
        );

        await db.query(
            'INSERT INTO user_passwords (id, user_id, password) VALUES (?, ?, ?)',
            [uuidv4(), userId, hashedPassword]
        );

        const tokenResult = await requestTokenService('/tokens/generate', 'POST', {
            user_id: userId
        });

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil.',
            user: { id: userId, full_name, email, role: 'user' },
            token: tokenResult.token,
            expires_at: tokenResult.expires_at
        });
    } catch (error) {
        next(error);
    }
};

export const login = (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        try {
            if (err) return next(err);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: info?.message || 'Login gagal.'
                });
            }

            const tokenResult = await requestTokenService('/tokens/generate', 'POST', {
                user_id: user.id
            });

            res.json({
                success: true,
                message: 'Login berhasil.',
                token: tokenResult.token,
                expires_at: tokenResult.expires_at
            });
        } catch (error) {
            next(error);
        }
    })(req, res, next);
};


export const googleAuth = passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email']
});

export const googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        try {
            if (err) return next(err);

            if (!user) {
                const errorCode = info?.code || 'AUTH_FAILED';
                const errorMessage = encodeURIComponent(info?.message || 'Google authentication gagal.');
                const redirectUrl = `${process.env.AUTH_CODE_REDIRECT_URL}?error=${errorCode}&message=${errorMessage}`;
                return res.redirect(redirectUrl);
            }

            const authCodeResult = await requestTokenService('/auth-codes/generate', 'POST', {
                user_id: user.id
            });

            const redirectUrl = `${process.env.AUTH_CODE_REDIRECT_URL}?code=${authCodeResult.code}`;
            res.redirect(redirectUrl);
        } catch (error) {
            next(error);
        }
    })(req, res, next);
};


export const discordAuth = passport.authenticate('discord', {
    session: false
});

export const discordCallback = (req, res, next) => {
    passport.authenticate('discord', { session: false }, async (err, user, info) => {
        try {
            if (err) return next(err);

            if (!user) {
                const errorCode = info?.code || 'AUTH_FAILED';
                const errorMessage = encodeURIComponent(info?.message || 'Discord authentication gagal.');
                const redirectUrl = `${process.env.AUTH_CODE_REDIRECT_URL}?error=${errorCode}&message=${errorMessage}`;
                return res.redirect(redirectUrl);
            }

            const authCodeResult = await requestTokenService('/auth-codes/generate', 'POST', {
                user_id: user.id
            });

            const redirectUrl = `${process.env.AUTH_CODE_REDIRECT_URL}?code=${authCodeResult.code}`;
            res.redirect(redirectUrl);
        } catch (error) {
            next(error);
        }
    })(req, res, next);
};


export const exchangeToken = async (req, res, next) => {
    try {
        const { code } = req.body;

        const result = await requestTokenService('/auth-codes/exchange', 'POST', { code });

        res.json({
            success: true,
            message: 'Token berhasil ditukar.',
            token: result.token,
            expires_at: result.expires_at
        });
    } catch (error) {
        next(error);
    }
};


export const googleBindAuth = passport.authenticate('google-bind', {
    session: false,
    scope: ['profile', 'email']
});

export const googleBindCallback = (req, res, next) => {
    passport.authenticate('google-bind', { session: false }, async (err, profile, info) => {
        try {
            if (err) return next(err);

            if (!profile) {
                return res.status(401).json({
                    success: false,
                    message: info?.message || 'Google bind authentication gagal.'
                });
            }

            const bindCodeResult = await requestTokenService('/bind-codes/generate', 'POST', {
                provider: profile.provider,
                provider_id: profile.provider_id
            });

            const redirectUrl = `${process.env.BIND_CODE_REDIRECT_URL}?bind_code=${bindCodeResult.code}&provider=google`;
            res.redirect(redirectUrl);
        } catch (error) {
            next(error);
        }
    })(req, res, next);
};

export const discordBindAuth = passport.authenticate('discord-bind', {
    session: false
});

export const discordBindCallback = (req, res, next) => {
    passport.authenticate('discord-bind', { session: false }, async (err, profile, info) => {
        try {
            if (err) return next(err);

            if (!profile) {
                return res.status(401).json({
                    success: false,
                    message: info?.message || 'Discord bind authentication gagal.'
                });
            }

            const bindCodeResult = await requestTokenService('/bind-codes/generate', 'POST', {
                provider: profile.provider,
                provider_id: profile.provider_id
            });

            const redirectUrl = `${process.env.BIND_CODE_REDIRECT_URL}?bind_code=${bindCodeResult.code}&provider=discord`;
            res.redirect(redirectUrl);
        } catch (error) {
            next(error);
        }
    })(req, res, next);
};


export const logout = async (req, res, next) => {
    try {
        await requestTokenService('/tokens/revoke', 'DELETE', {
            token: req.token
        });

        res.json({ success: true, message: 'Logout berhasil.' });
    } catch (error) {
        next(error);
    }
};

export const terminateSession = async (req, res, next) => {
    try {
        const result = await requestTokenService('/tokens/rotate', 'POST', {
            token: req.token
        });

        res.json({
            success: true,
            message: 'Session berhasil di-terminate. Token baru telah dibuat.',
            token: result.token,
            expires_at: result.expires_at
        });
    } catch (error) {
        next(error);
    }
};
