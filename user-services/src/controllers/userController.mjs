import db from '../config/dbConfig.mjs';

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
