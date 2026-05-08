import db from '../config/dbConfig.mjs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { requestTokenService } from '../utils/internalRequest.mjs';

export const getMe = async (req, res, next) => {
    try {
        const userId = req.userId;

        const [users] = await db.query(
            'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        const user = users[0];

        const [identities] = await db.query(
            'SELECT provider, provider_id FROM user_identities WHERE user_id = ?',
            [userId]
        );

        const [passwords] = await db.query(
            'SELECT id FROM user_passwords WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                has_password: passwords.length > 0,
                linked_accounts: identities.map(identity => ({
                    provider: identity.provider,
                    provider_id: identity.provider_id
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};


export const changePassword = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { old_password, new_password, confirm_password } = req.body;

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Password baru dan konfirmasi password tidak cocok.'
            });
        }

        const [passwords] = await db.query(
            'SELECT * FROM user_passwords WHERE user_id = ?',
            [userId]
        );

        if (passwords.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Akun ini tidak memiliki password.'
            });
        }

        const isMatch = await bcrypt.compare(old_password, passwords[0].password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Password lama tidak sesuai.'
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 12);

        await db.query(
            'UPDATE user_passwords SET password = ? WHERE user_id = ?',
            [hashedPassword, userId]
        );

        res.json({ success: true, message: 'Password berhasil diubah.' });
    } catch (error) {
        next(error);
    }
};


export const bindGoogle = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { bind_code } = req.body;

        const bindResult = await requestTokenService('/bind-codes/exchange', 'POST', {
            code: bind_code
        });

        if (bindResult.provider !== 'google') {
            return res.status(400).json({
                success: false,
                message: 'Bind code ini bukan untuk akun Google.'
            });
        }

        const [existingIdentities] = await db.query(
            'SELECT user_id FROM user_identities WHERE provider = ? AND provider_id = ?',
            ['google', bindResult.provider_id]
        );

        if (existingIdentities.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Akun Google ini sudah terhubung dengan akun lain.'
            });
        }

        const [userGoogleIdentities] = await db.query(
            'SELECT id FROM user_identities WHERE user_id = ? AND provider = ?',
            [userId, 'google']
        );

        if (userGoogleIdentities.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Akun Anda sudah terhubung dengan akun Google lain. Lepas terlebih dahulu sebelum menghubungkan yang baru.'
            });
        }

        await db.query(
            'INSERT INTO user_identities (id, user_id, provider, provider_id) VALUES (?, ?, ?, ?)',
            [uuidv4(), userId, 'google', bindResult.provider_id]
        );

        res.json({ success: true, message: 'Akun Google berhasil dihubungkan.' });
    } catch (error) {
        next(error);
    }
};


export const unbindGoogle = async (req, res, next) => {
    try {
        const userId = req.userId;

        const [googleIdentities] = await db.query(
            'SELECT id FROM user_identities WHERE user_id = ? AND provider = ?',
            [userId, 'google']
        );

        if (googleIdentities.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Akun Anda tidak terhubung dengan akun Google manapun.'
            });
        }

        const [passwords] = await db.query(
            'SELECT id FROM user_passwords WHERE user_id = ?',
            [userId]
        );

        const [allIdentities] = await db.query(
            'SELECT id FROM user_identities WHERE user_id = ?',
            [userId]
        );

        const totalLoginMethods = (passwords.length > 0 ? 1 : 0) + allIdentities.length;

        if (totalLoginMethods <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Tidak dapat melepas akun Google. Anda harus memiliki minimal satu metode login.'
            });
        }

        await db.query(
            'DELETE FROM user_identities WHERE user_id = ? AND provider = ?',
            [userId, 'google']
        );

        res.json({ success: true, message: 'Akun Google berhasil dilepas.' });
    } catch (error) {
        next(error);
    }
};


export const bindDiscord = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { bind_code } = req.body;

        const bindResult = await requestTokenService('/bind-codes/exchange', 'POST', {
            code: bind_code
        });

        if (bindResult.provider !== 'discord') {
            return res.status(400).json({
                success: false,
                message: 'Bind code ini bukan untuk akun Discord.'
            });
        }

        const [existingIdentities] = await db.query(
            'SELECT user_id FROM user_identities WHERE provider = ? AND provider_id = ?',
            ['discord', bindResult.provider_id]
        );

        if (existingIdentities.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Akun Discord ini sudah terhubung dengan akun lain.'
            });
        }

        const [userDiscordIdentities] = await db.query(
            'SELECT id FROM user_identities WHERE user_id = ? AND provider = ?',
            [userId, 'discord']
        );

        if (userDiscordIdentities.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Akun Anda sudah terhubung dengan akun Discord lain. Lepas terlebih dahulu sebelum menghubungkan yang baru.'
            });
        }

        await db.query(
            'INSERT INTO user_identities (id, user_id, provider, provider_id) VALUES (?, ?, ?, ?)',
            [uuidv4(), userId, 'discord', bindResult.provider_id]
        );

        res.json({ success: true, message: 'Akun Discord berhasil dihubungkan.' });
    } catch (error) {
        next(error);
    }
};


export const unbindDiscord = async (req, res, next) => {
    try {
        const userId = req.userId;

        const [discordIdentities] = await db.query(
            'SELECT id FROM user_identities WHERE user_id = ? AND provider = ?',
            [userId, 'discord']
        );

        if (discordIdentities.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Akun Anda tidak terhubung dengan akun Discord manapun.'
            });
        }

        const [passwords] = await db.query(
            'SELECT id FROM user_passwords WHERE user_id = ?',
            [userId]
        );

        const [allIdentities] = await db.query(
            'SELECT id FROM user_identities WHERE user_id = ?',
            [userId]
        );

        const totalLoginMethods = (passwords.length > 0 ? 1 : 0) + allIdentities.length;

        if (totalLoginMethods <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Tidak dapat melepas akun Discord. Anda harus memiliki minimal satu metode login.'
            });
        }

        await db.query(
            'DELETE FROM user_identities WHERE user_id = ? AND provider = ?',
            [userId, 'discord']
        );

        res.json({ success: true, message: 'Akun Discord berhasil dilepas.' });
    } catch (error) {
        next(error);
    }
};
