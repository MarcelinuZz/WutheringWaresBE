import db from '../config/db.mjs';
import { v4 as uuidv4 } from 'uuid';

const TAX_RATE = 0.05;

export const getCart = async (req, res, next) => {
    try {
        const userId = req.userId;

        const [cartItems] = await db.query(
            `SELECT 
                c.id AS cart_id,
                c.item_id,
                c.quantity,
                i.name,
                i.type,
                i.image,
                i.price,
                i.stock,
                (c.quantity * i.price) AS subtotal
             FROM carts c
             JOIN item i ON c.item_id = i.id
             WHERE c.user_id = ?
             ORDER BY c.created_at DESC`,
            [userId]
        );

        const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
        const tax = Math.round(totalPrice * TAX_RATE);
        const grandTotal = totalPrice + tax;

        res.json({
            success: true,
            data: {
                items: cartItems.map(item => ({
                    cart_id: item.cart_id,
                    item_id: item.item_id,
                    name: item.name,
                    type: item.type,
                    image: item.image,
                    price: Number(item.price),
                    stock: item.stock,
                    quantity: item.quantity,
                    subtotal: Number(item.subtotal)
                })),
                summary: {
                    total_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                    total_price: totalPrice,
                    tax: tax,
                    grand_total: grandTotal
                }
            }
        });
    } catch (error) {
        next(error);
    }
};


export const addToCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { item_id, quantity } = req.body;

        const [items] = await db.query(
            'SELECT id, name, stock, price FROM item WHERE id = ?',
            [item_id]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item tidak ditemukan.'
            });
        }

        const item = items[0];

        const [existingCart] = await db.query(
            'SELECT id, quantity FROM carts WHERE user_id = ? AND item_id = ?',
            [userId, item_id]
        );

        if (existingCart.length > 0) {
            const newQuantity = existingCart[0].quantity + parseInt(quantity);

            if (newQuantity > item.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Stok tidak mencukupi. Stok tersedia: ${item.stock}.`
                });
            }

            await db.query(
                'UPDATE carts SET quantity = ? WHERE id = ?',
                [newQuantity, existingCart[0].id]
            );

            return res.json({
                success: true,
                message: 'Quantity item berhasil diperbarui.',
                data: {
                    cart_id: existingCart[0].id,
                    item_id,
                    quantity: newQuantity
                }
            });
        }

        if (parseInt(quantity) > item.stock) {
            return res.status(400).json({
                success: false,
                message: `Stok tidak mencukupi. Stok tersedia: ${item.stock}.`
            });
        }

        const cartId = uuidv4();
        await db.query(
            'INSERT INTO carts (id, user_id, item_id, quantity) VALUES (?, ?, ?, ?)',
            [cartId, userId, item_id, parseInt(quantity)]
        );

        res.status(201).json({
            success: true,
            message: 'Item berhasil ditambahkan ke keranjang.',
            data: {
                cart_id: cartId,
                item_id,
                name: item.name,
                price: Number(item.price),
                quantity: parseInt(quantity)
            }
        });
    } catch (error) {
        next(error);
    }
};


export const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { quantity } = req.body;

        const [cartItems] = await db.query(
            `SELECT c.id, c.item_id, i.stock, i.name
             FROM carts c
             JOIN item i ON c.item_id = i.id
             WHERE c.id = ? AND c.user_id = ?`,
            [id, userId]
        );

        if (cartItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item cart tidak ditemukan.'
            });
        }

        const cartItem = cartItems[0];

        if (parseInt(quantity) > cartItem.stock) {
            return res.status(400).json({
                success: false,
                message: `Stok tidak mencukupi. Stok tersedia: ${cartItem.stock}.`
            });
        }

        await db.query(
            'UPDATE carts SET quantity = ? WHERE id = ? AND user_id = ?',
            [parseInt(quantity), id, userId]
        );

        res.json({
            success: true,
            message: 'Quantity berhasil diperbarui.',
            data: {
                cart_id: id,
                item_id: cartItem.item_id,
                quantity: parseInt(quantity)
            }
        });
    } catch (error) {
        next(error);
    }
};


export const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM carts WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item cart tidak ditemukan.'
            });
        }

        res.json({
            success: true,
            message: 'Item berhasil dihapus dari keranjang.'
        });
    } catch (error) {
        next(error);
    }
};


export const clearCart = async (req, res, next) => {
    try {
        const userId = req.userId;

        await db.query('DELETE FROM carts WHERE user_id = ?', [userId]);

        res.json({
            success: true,
            message: 'Keranjang berhasil dikosongkan.'
        });
    } catch (error) {
        next(error);
    }
};
