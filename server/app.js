const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const cartRoutes = require('./routes/cartRoutes');
const bouquetComponentsRoutes = require('./routes/bouquetComponents');
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
app.use('/api/auth', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/bouquet-components', bouquetComponentsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Сервер работает', 
        timestamp: new Date().toISOString() 
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

app.use((error, req, res, next) => {
    console.error('❌ Ошибка сервера:', error);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера: ' + error.message
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Favorites API готов к работе`);
    console.log(`Cart API готов к работе`);
});