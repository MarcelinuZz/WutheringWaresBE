import db from '../config/db.mjs';
import { v4 as uuidv4 } from 'uuid';

export const getItems = async (req, res, next) => {
    try {
        const { type } = req.query;

        let query = 'SELECT id, name, stock, price, image FROM item';
        const queryParams = [];

        if (type) {
            query += ' WHERE type = ?';
            queryParams.push(type);
        }

        query += ' ORDER BY created_at DESC';

        const [items] = await db.query(query, queryParams);

        res.json({
            success: true,
            data: items
        });
    } catch (error) {
        next(error);
    }
};

export const addItem = async (req, res, next) => {
    try {
        const { name, type, description, stock, price, rarity } = req.body;

        let imagePath = `/uploads/${req.file.filename}`;

        const id = uuidv4();

        await db.query(
            'INSERT INTO item (id, name, type, description, stock, price, rarity, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, type, description || null, stock || 0, price, rarity, imagePath]
        );

        res.status(201).json({
            success: true,
            message: 'Item berhasil ditambahkan.',
            data: {
                id, name, type, description, stock: stock || 0, price, rarity, image: imagePath
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type, description, stock, price, rarity } = req.body;

        const [existingItem] = await db.query('SELECT id, image FROM item WHERE id = ?', [id]);

        if (existingItem.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item tidak ditemukan.'
            });
        }

        let query = 'UPDATE item SET ';
        const queryParams = [];
        const updates = [];

        if (name) { updates.push('name = ?'); queryParams.push(name); }
        if (type) { updates.push('type = ?'); queryParams.push(type); }
        if (description !== undefined) { updates.push('description = ?'); queryParams.push(description); }
        if (stock !== undefined) { updates.push('stock = ?'); queryParams.push(stock); }
        if (price !== undefined) { updates.push('price = ?'); queryParams.push(price); }
        if (rarity !== undefined) { updates.push('rarity = ?'); queryParams.push(rarity); }

        if (req.file) {
            updates.push('image = ?');
            queryParams.push(`/uploads/${req.file.filename}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada data yang diubah.'
            });
        }

        query += updates.join(', ') + ' WHERE id = ?';
        queryParams.push(id);

        await db.query(query, queryParams);

        res.json({
            success: true,
            message: 'Item berhasil diupdate.'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteItem = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM item WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            message: 'Item berhasil dihapus.'
        });
    } catch (error) {
        next(error);
    }
};
