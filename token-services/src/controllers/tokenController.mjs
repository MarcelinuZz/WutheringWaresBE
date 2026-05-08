import db from '../config/dbConfig.mjs';
import { generateToken, generateAuthCode } from '../utils/generateRandom.mjs';

const TOKEN_EXPIRY_DAYS = 2;
const AUTH_CODE_EXPIRY_MINUTES = 5;
const BIND_CODE_EXPIRY_MINUTES = 5;

export const createToken = async (req, res, next) => {
    try {
        const { user_id } = req.body;

        const token = generateToken(32);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

        await db.query(
            'INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user_id, token, expiresAt]
        );

        res.status(201).json({ success: true, token, expires_at: expiresAt });
    } catch (error) {
        next(error);
    }
};

export const validateToken = async (req, res, next) => {
    try {
        const { token } = req.body;

        const [rows] = await db.query(
            'SELECT user_id, expires_at FROM user_tokens WHERE token = ?',
            [token]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Token tidak valid.' });
        }

        const tokenData = rows[0];

        if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
            await db.query('DELETE FROM user_tokens WHERE token = ?', [token]);
            return res.status(401).json({ success: false, message: 'Token telah kadaluarsa.' });
        }

        res.json({ success: true, user_id: tokenData.user_id });
    } catch (error) {
        next(error);
    }
};

export const revokeToken = async (req, res, next) => {
    try {
        const { token } = req.body;

        const [result] = await db.query(
            'DELETE FROM user_tokens WHERE token = ?',
            [token]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Token tidak ditemukan.' });
        }

        res.json({ success: true, message: 'Token berhasil dihapus.' });
    } catch (error) {
        next(error);
    }
};

export const rotateToken = async (req, res, next) => {
    try {
        const { token } = req.body;

        const [rows] = await db.query(
            'SELECT user_id FROM user_tokens WHERE token = ?',
            [token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Token tidak ditemukan.' });
        }

        const userId = rows[0].user_id;

        await db.query('DELETE FROM user_tokens WHERE user_id = ?', [userId]);

        const newToken = generateToken(32);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

        await db.query(
            'INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, newToken, expiresAt]
        );

        res.json({ success: true, token: newToken, expires_at: expiresAt });
    } catch (error) {
        next(error);
    }
};

export const createAuthCode = async (req, res, next) => {
    try {
        const { user_id } = req.body;

        const code = generateAuthCode(64);

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + AUTH_CODE_EXPIRY_MINUTES);

        await db.query(
            'INSERT INTO auth_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
            [user_id, code, expiresAt]
        );

        res.status(201).json({ success: true, code });
    } catch (error) {
        next(error);
    }
};

export const exchangeAuthCode = async (req, res, next) => {
    try {
        const { code } = req.body;

        const [rows] = await db.query(
            'SELECT id, user_id, expires_at, is_used FROM auth_codes WHERE code = ?',
            [code]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Auth code tidak valid.' });
        }

        const authCode = rows[0];

        if (authCode.is_used) {
            return res.status(400).json({ success: false, message: 'Auth code sudah digunakan.' });
        }

        if (new Date(authCode.expires_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'Auth code telah kadaluarsa.' });
        }

        await db.query('UPDATE auth_codes SET is_used = TRUE WHERE id = ?', [authCode.id]);

        const token = generateToken(32);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

        await db.query(
            'INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [authCode.user_id, token, expiresAt]
        );

        res.json({ success: true, token, expires_at: expiresAt });
    } catch (error) {
        next(error);
    }
};

export const createBindCode = async (req, res, next) => {
    try {
        const { provider, provider_id } = req.body;

        const code = generateAuthCode(64);

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + BIND_CODE_EXPIRY_MINUTES);

        await db.query(
            'INSERT INTO bind_codes (code, provider, provider_id, expires_at) VALUES (?, ?, ?, ?)',
            [code, provider, provider_id, expiresAt]
        );

        res.status(201).json({ success: true, code });
    } catch (error) {
        next(error);
    }
};

export const exchangeBindCode = async (req, res, next) => {
    try {
        const { code } = req.body;

        const [rows] = await db.query(
            'SELECT id, provider, provider_id, expires_at, is_used FROM bind_codes WHERE code = ?',
            [code]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bind code tidak valid.' });
        }

        const bindCode = rows[0];

        if (bindCode.is_used) {
            return res.status(400).json({ success: false, message: 'Bind code sudah digunakan.' });
        }

        if (new Date(bindCode.expires_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'Bind code telah kadaluarsa.' });
        }

        await db.query('UPDATE bind_codes SET is_used = TRUE WHERE id = ?', [bindCode.id]);

        res.json({
            success: true,
            provider: bindCode.provider,
            provider_id: bindCode.provider_id
        });
    } catch (error) {
        next(error);
    }
};
