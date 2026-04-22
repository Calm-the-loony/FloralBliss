const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Временная авторизация - используем пользователя с id=1
const tempAuth = (req, res, next) => {
    req.user = { id: 1 };
    next();
};

// Создание заказа
router.post('/create', tempAuth, async (req, res) => {
    try {
        console.log('Создание заказа...');
        
        const {
            items,
            subtotal,
            delivery_method,
            delivery_cost,
            total,
            address,
            apartment,
            entrance,
            floor,
            intercom,
            comment,
            payment_method
        } = req.body;

        const userId = req.user.id;
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const subtotalNum = parseFloat(subtotal) || 0;
        const deliveryCostNum = parseFloat(delivery_cost) || 0;
        const totalNum = parseFloat(total) || 0;

  
        const itemsJson = JSON.stringify(items);

        const [result] = await pool.query(
            `INSERT INTO orders (
                order_number, user_id, items, subtotal, delivery_method, 
                delivery_cost, total, address, apartment, entrance, 
                floor, intercom, comment, payment_method, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [
                orderNumber, userId, itemsJson, subtotalNum,
                delivery_method, deliveryCostNum, totalNum, address, apartment || null,
                entrance || null, floor || null, intercom || null, comment || null,
                payment_method
            ]
        );

        console.log('✅ Заказ создан, номер:', orderNumber);
        res.json({ success: true, orderId: result.insertId, orderNumber });
    } catch (error) {
        console.error('❌ Ошибка создания заказа:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Получение заказов пользователя
router.get('/user', async (req, res) => {
    try {
        const userId = 1;
        console.log('📋 Получение заказов для пользователя:', userId);
        
        const [orders] = await pool.query(
            `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );

        console.log(`📊 Найдено заказов в БД: ${orders.length}`);

        const formattedOrders = [];
        
        for (const order of orders) {
            try {
                let parsedItems = [];
                
                // Проверяем, что items не пустой
                if (order.items) {
                    // Если items уже строка, парсим
                    if (typeof order.items === 'string') {
                        parsedItems = JSON.parse(order.items);
                    } 
                    // Если уже объект/массив
                    else if (Array.isArray(order.items)) {
                        parsedItems = order.items;
                    }
                }
                
                formattedOrders.push({
                    id: order.id,
                    order_number: order.order_number,
                    created_at: order.created_at,
                    status: order.status,
                    total: parseFloat(order.total) || 0,
                    subtotal: parseFloat(order.subtotal) || 0,
                    delivery_method: order.delivery_method,
                    delivery_cost: parseFloat(order.delivery_cost) || 0,
                    address: order.address,
                    apartment: order.apartment,
                    entrance: order.entrance,
                    floor: order.floor,
                    intercom: order.intercom,
                    comment: order.comment,
                    payment_method: order.payment_method,
                    items: parsedItems
                });
            } catch (err) {
                console.error('Ошибка парсинга для заказа', order.id, err.message);
                formattedOrders.push({
                    id: order.id,
                    order_number: order.order_number,
                    created_at: order.created_at,
                    status: order.status,
                    total: parseFloat(order.total) || 0,
                    subtotal: parseFloat(order.subtotal) || 0,
                    delivery_method: order.delivery_method,
                    delivery_cost: parseFloat(order.delivery_cost) || 0,
                    address: order.address,
                    apartment: order.apartment,
                    entrance: order.entrance,
                    floor: order.floor,
                    intercom: order.intercom,
                    comment: order.comment,
                    payment_method: order.payment_method,
                    items: []
                });
            }
        }

        console.log(`✅ Отправляем ${formattedOrders.length} заказов`);
        res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.error('❌ Ошибка получения заказов:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;