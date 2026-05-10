import mysql from 'mysql2/promise';
import 'dotenv/config';

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        await db.getConnection();
        console.log('[Order Service] Database connection successful');
    } catch (error) {
        console.error('[Order Service] Database connection error:', error);
    }
}

testConnection();

export default db;
