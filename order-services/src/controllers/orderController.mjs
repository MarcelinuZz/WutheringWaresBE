import db from '../config/db.mjs';
import { snap, core } from '../config/midtrans.mjs';
import { v4 as uuidv4 } from 'uuid';

const TAX_RATE = 0.05;

export const checkout = async (req, res, next) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const userId = req.userId;

        const [users] = await conn.query(
            'SELECT id, full_name, email FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        const user = users[0];

        const [cartItems] = await conn.query(
            `SELECT 
                c.id AS cart_id,
                c.item_id,
                c.quantity,
                i.name,
                i.price,
                i.stock,
                i.image
             FROM carts c
             JOIN item i ON c.item_id = i.id
             WHERE c.user_id = ?
             FOR UPDATE`,
            [userId]
        );

        if (cartItems.length === 0) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: 'Keranjang kosong. Tambahkan item terlebih dahulu.'
            });
        }

        for (const item of cartItems) {
            if (item.quantity > item.stock) {
                await conn.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Stok "${item.name}" tidak mencukupi. Stok tersedia: ${item.stock}, diminta: ${item.quantity}.`
                });
            }
        }

        const totalPrice = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        const tax = Math.round(totalPrice * TAX_RATE);
        const grandTotal = totalPrice + tax;

        const transactionId = uuidv4();
        await conn.query(
            `INSERT INTO transactions 
             (id, user_id, total_price, tax, grand_total, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [transactionId, userId, totalPrice, tax, grandTotal, 'pending']
        );

        for (const item of cartItems) {
            const detailId = uuidv4();
            const subtotal = Number(item.price) * item.quantity;

            await conn.query(
                `INSERT INTO transaction_details 
                 (id, transaction_id, item_id, quantity, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [detailId, transactionId, item.item_id, item.quantity, subtotal]
            );

            await conn.query(
                'UPDATE item SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.item_id]
            );
        }

        const midtransOrderId = `WW-${transactionId.substring(0, 8).toUpperCase()}`;

        const midtransParams = {
            transaction_details: {
                order_id: midtransOrderId,
                gross_amount: grandTotal
            },
            customer_details: {
                first_name: user.full_name,
                email: user.email
            },
            item_details: cartItems.map(item => ({
                id: item.item_id,
                price: Number(item.price),
                quantity: item.quantity,
                name: item.name
            }))
        };

        if (tax > 0) {
            midtransParams.item_details.push({
                id: 'TAX',
                price: tax,
                quantity: 1,
                name: 'Tax (5%)'
            });
        }

        let snapToken = null;
        let snapRedirectUrl = null;
        let midtransTransactionId = midtransOrderId;

        try {
            const snapResponse = await snap.createTransaction(midtransParams);
            snapToken = snapResponse.token;
            snapRedirectUrl = snapResponse.redirect_url;
        } catch (midtransError) {
            console.error('[Order Service] Midtrans error:', midtransError.message);
        }

        await conn.query(
            `UPDATE transactions 
             SET midtrans_transaction_id = ?, snap_token = ?, snap_redirect_url = ? 
             WHERE id = ?`,
            [midtransTransactionId, snapToken, snapRedirectUrl, transactionId]
        );

        await conn.query('DELETE FROM carts WHERE user_id = ?', [userId]);

        await conn.commit();

        res.status(201).json({
            success: true,
            message: 'Checkout berhasil. Lakukan pembayaran untuk menyelesaikan transaksi.',
            data: {
                transaction_id: transactionId,
                midtrans_order_id: midtransTransactionId,
                total_price: totalPrice,
                tax: tax,
                grand_total: grandTotal,
                snap_token: snapToken,
                snap_redirect_url: snapRedirectUrl,
                status: 'pending'
            }
        });
    } catch (error) {
        await conn.rollback();
        next(error);
    } finally {
        conn.release();
    }
};


export const getOrders = async (req, res, next) => {
    try {
        const userId = req.userId;

        const [transactions] = await db.query(
            `SELECT 
                t.id,
                t.grand_total,
                t.status,
                t.payment_type,
                t.transaction_date
             FROM transactions t
             WHERE t.user_id = ?
             ORDER BY t.transaction_date DESC`,
            [userId]
        );

        if (transactions.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const transactionIds = transactions.map(t => t.id);
        const [details] = await db.query(
            `SELECT 
                td.transaction_id,
                i.name AS item_name,
                COUNT(*) OVER (PARTITION BY td.transaction_id) AS total_unique_items,
                ROW_NUMBER() OVER (PARTITION BY td.transaction_id ORDER BY td.id ASC) AS rn
             FROM transaction_details td
             JOIN item i ON td.item_id = i.id
             WHERE td.transaction_id IN (?)`,
            [transactionIds]
        );

        const detailMap = {};
        for (const detail of details) {
            if (detail.rn === 1) {
                detailMap[detail.transaction_id] = {
                    first_item_name: detail.item_name,
                    total_unique_items: Number(detail.total_unique_items)
                };
            }
        }

        const result = transactions.map(t => {
            const detail = detailMap[t.id];
            let itemSummary = 'Tidak ada item';

            if (detail) {
                const others = detail.total_unique_items - 1;
                if (others === 0) {
                    itemSummary = detail.first_item_name;
                } else {
                    itemSummary = `${detail.first_item_name} + ${others} other item${others > 1 ? 's' : ''}`;
                }
            }

            return {
                id: t.id,
                item_summary: itemSummary,
                grand_total: Number(t.grand_total),
                status: t.status,
                payment_type: t.payment_type,
                transaction_date: t.transaction_date
            };
        });

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};


export const getOrderById = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const [transactions] = await db.query(
            `SELECT 
                id, total_price, tax, grand_total, status, 
                payment_type, midtrans_transaction_id,
                snap_token, snap_redirect_url, 
                transaction_date, paid_at
             FROM transactions 
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transaksi tidak ditemukan.'
            });
        }

        const transaction = transactions[0];

        const [items] = await db.query(
            `SELECT 
                td.quantity,
                td.subtotal,
                i.id AS item_id,
                i.name,
                i.image,
                i.price
             FROM transaction_details td
             JOIN item i ON td.item_id = i.id
             WHERE td.transaction_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                id: transaction.id,
                total_price: Number(transaction.total_price),
                tax: Number(transaction.tax),
                grand_total: Number(transaction.grand_total),
                status: transaction.status,
                payment_type: transaction.payment_type,
                midtrans_order_id: transaction.midtrans_transaction_id,
                snap_token: transaction.status === 'pending' ? transaction.snap_token : null,
                snap_redirect_url: transaction.status === 'pending' ? transaction.snap_redirect_url : null,
                transaction_date: transaction.transaction_date,
                paid_at: transaction.paid_at,
                items: items.map(item => ({
                    item_id: item.item_id,
                    name: item.name,
                    image: item.image,
                    price: Number(item.price),
                    quantity: item.quantity,
                    subtotal: Number(item.subtotal)
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};


export const handleMidtransNotification = async (req, res, next) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const notification = req.body;

        let statusResponse;
        try {
            statusResponse = await core.transaction.notification(notification);
        } catch (midtransError) {
            console.error('[Order Service] Midtrans notification verification failed:', midtransError.message);
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'Invalid notification.' });
        }

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const paymentType = statusResponse.payment_type;

        const [transactions] = await conn.query(
            'SELECT id, status FROM transactions WHERE midtrans_transaction_id = ?',
            [orderId]
        );

        if (transactions.length === 0) {
            await conn.rollback();
            return res.status(200).json({ success: false, message: 'Transaction not found.' });
        }

        const transaction = transactions[0];

        if (transaction.status === 'paid') {
            await conn.rollback();
            return res.status(200).json({ success: true, message: 'Already processed.' });
        }

        let newStatus = 'pending';

        if (transactionStatus === 'capture') {
            newStatus = fraudStatus === 'accept' ? 'paid' : 'pending';
        } else if (transactionStatus === 'settlement') {
            newStatus = 'paid';
        } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            newStatus = 'cancelled';
        } else if (transactionStatus === 'pending') {
            newStatus = 'pending';
        }

        const paidAt = newStatus === 'paid' ? new Date() : null;

        await conn.query(
            `UPDATE transactions 
             SET status = ?, payment_type = ?, paid_at = ?
             WHERE id = ?`,
            [newStatus, paymentType || null, paidAt, transaction.id]
        );

        if (newStatus === 'cancelled') {
            const [details] = await conn.query(
                'SELECT item_id, quantity FROM transaction_details WHERE transaction_id = ?',
                [transaction.id]
            );

            for (const detail of details) {
                await conn.query(
                    'UPDATE item SET stock = stock + ? WHERE id = ?',
                    [detail.quantity, detail.item_id]
                );
            }

            console.log(`[Order Service] Transaction ${transaction.id} cancelled. Stock restored.`);
        }

        await conn.commit();

        console.log(`[Order Service] Notification processed: order=${orderId}, status=${newStatus}`);
        res.status(200).json({ success: true });
    } catch (error) {
        await conn.rollback();
        console.error('[Order Service] Notification handler error:', error);
        res.status(200).json({ success: false, message: 'Internal error.' });
    } finally {
        conn.release();
    }
};
