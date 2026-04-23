const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const cartRoutes = require('./routes/cartRoutes');
const bouquetComponentsRoutes = require('./routes/bouquetComponents');
const orderRoutes = require('./routes/orderRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminPanelRoutes = require('./routes/adminPanelRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use('/api/images', require('./routes/imageRoutes'));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Роуты
app.use('/api/auth', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/bouquet-components', bouquetComponentsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/panel', adminPanelRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Сервер работает', 
        timestamp: new Date().toISOString() 
    });
});

// Функция для создания администратора
const createAdminIfNotExists = async () => {
    try {
        const pool = require('./config/db');
        const bcrypt = require('bcryptjs');
        
        // Проверяем, существует ли таблица admins
        const [tables] = await pool.query("SHOW TABLES LIKE 'admins'");
        if (tables.length === 0) {
            // Создаем таблицу admins
            await pool.query(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    role ENUM('super_admin','admin') DEFAULT 'admin',
                    is_active TINYINT DEFAULT 1,
                    last_login DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('Таблица admins создана');
        }
        
        // Проверяем, существует ли администратор
        const [admins] = await pool.query('SELECT * FROM admins WHERE email = ?', ['admin@floralbliss.com']);
        
        if (admins.length === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO admins (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
                ['admin', 'admin@floralbliss.com', hash, 'super_admin', 1]
            );
            console.log('Администратор создан!');
            console.log('Email: admin@floralbliss.com');
            console.log('Пароль: admin123');
        } else {
            console.log('Администратор уже существует');
        }
        
    } catch (error) {
        console.error('Ошибка создания администратора:', error);
    }
};

// Запуск сервера
app.listen(PORT, async () => {
    console.log(`Сервер запущен на порту http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Admin API готов к работе`);
    
    // Создаем администратора после запуска сервера
    setTimeout(() => {
        createAdminIfNotExists();
    }, 1000);
});

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('Ошибка сервера:', error);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера: ' + error.message
    });
});