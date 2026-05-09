import db from '../config/db.mjs';

const adminMiddleware = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. User ID not found.'
            });
        }

        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan.'
            });
        }

        if (users[0].role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Hanya admin yang dapat melakukan aksi ini.'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default adminMiddleware;
