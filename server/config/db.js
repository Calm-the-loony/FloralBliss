const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'floral_bliss',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Успешное подключение к базе данных');
        
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'
        `, [process.env.DB_NAME || 'floral_bliss']);
        
        if (tables.length > 0) {
            console.log('✅ Таблица products существует');
            
            const [count] = await connection.execute('SELECT COUNT(*) as count FROM products');
            console.log(`✅ В таблице products: ${count[0].count} записей`);
        } else {
            console.log('❌ Таблица products не существует');
        }
        
        connection.release();
    } catch (err) {
        console.error('❌ Ошибка подключения к базе данных:', err.message);
        console.log('🔧 Проверьте:');
        console.log('   - Запущен ли MySQL сервер');
        console.log('   - Правильные ли параметры в .env файле');
        console.log('   - Существует ли база данных');
    }
};

testConnection();

module.exports = pool;