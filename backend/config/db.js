const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expense_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the MySQL Database.');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the MySQL Database:', err.message);
    });

module.exports = pool;
