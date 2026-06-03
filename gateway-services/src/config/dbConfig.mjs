import mysql from 'mysql2/promise';


const dbConfig = mysql.createPool({
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
        await dbConfig.getConnection();
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

testConnection();

export default dbConfig;