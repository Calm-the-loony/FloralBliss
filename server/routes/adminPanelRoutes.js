const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware для проверки админ-токена
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'floral-bliss-secret-key-2026');
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Недействительный токен' });
    }
};

// Статистика
router.get('/stats', verifyAdminToken, async (req, res) => {
    try {
        const [ordersCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [usersCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [productsCount] = await pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
        const [totalRevenue] = await pool.query('SELECT SUM(total) as total FROM orders WHERE status = "delivered" OR status = "completed"');
        const [pendingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
        
        res.json({
            success: true,
            data: {
                orders: ordersCount[0].count,
                users: usersCount[0].count,
                products: productsCount[0].count,
                revenue: totalRevenue[0].total || 0,
                pendingOrders: pendingOrders[0].count
            }
        });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Заказы
router.get('/orders', verifyAdminToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = `
            SELECT o.*, u.email, u.first_name, u.last_name, u.phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id_user
            WHERE 1=1
        `;
        const params = [];
        
        if (status && status !== 'all') {
            query += ` AND o.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        const [orders] = await pool.query(query, params);
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM orders');
        
        const formattedOrders = orders.map(order => {
            let parsedItems = [];
            try {
                if (typeof order.items === 'string') {
                    parsedItems = JSON.parse(order.items);
                } else if (Array.isArray(order.items)) {
                    parsedItems = order.items;
                } else if (order.items) {
                    parsedItems = JSON.parse(JSON.stringify(order.items));
                }
            } catch (err) {
                console.error('Ошибка парсинга items для заказа', order.id, err.message);
                parsedItems = [];
            }
            
            return {
                id: order.id,
                order_number: order.order_number,
                user_id: order.user_id,
                items: parsedItems,
                subtotal: parseFloat(order.subtotal) || 0,
                delivery_method: order.delivery_method,
                delivery_cost: parseFloat(order.delivery_cost) || 0,
                total: parseFloat(order.total) || 0,
                address: order.address,
                apartment: order.apartment,
                entrance: order.entrance,
                floor: order.floor,
                intercom: order.intercom,
                comment: order.comment,
                payment_method: order.payment_method,
                status: order.status,
                created_at: order.created_at,
                updated_at: order.updated_at,
                email: order.email,
                first_name: order.first_name,
                last_name: order.last_name,
                phone: order.phone
            };
        });
        
        res.json({
            success: true,
            data: formattedOrders,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Ошибка получения заказов:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Обновление статуса заказа
router.put('/orders/:id/status', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Пользователи
router.get('/users', verifyAdminToken, async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        let query = `SELECT id_user, first_name, last_name, email, phone, role, is_active, registration_date, last_login FROM users WHERE 1=1`;
        const params = [];
        
        if (search) {
            query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ` ORDER BY registration_date DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        const [users] = await pool.query(query, params);
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
        
        res.json({
            success: true,
            data: users,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Обновление роли пользователя
router.put('/users/:id/role', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        await pool.query('UPDATE users SET role = ? WHERE id_user = ?', [role, id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка обновления роли:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Блокировка/разблокировка пользователя
router.put('/users/:id/toggle-block', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [user] = await pool.query('SELECT is_active FROM users WHERE id_user = ?', [id]);
        const newStatus = user[0].is_active === 1 ? 0 : 1;
        
        await pool.query('UPDATE users SET is_active = ? WHERE id_user = ?', [newStatus, id]);
        res.json({ success: true, is_active: newStatus });
    } catch (error) {
        console.error('Ошибка блокировки пользователя:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Товары
router.get('/products', verifyAdminToken, async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        let query = `SELECT * FROM products WHERE 1=1`;
        const params = [];
        
        if (search) {
            query += ` AND (name LIKE ? OR description LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        const [products] = await pool.query(query, params);
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM products');
        
        const formattedProducts = products.map(product => {
            let parsedImages = [];
            let parsedTags = [];
            
            try {
                if (product.images) {
                    if (typeof product.images === 'string') {
                        parsedImages = JSON.parse(product.images);
                    } else if (Array.isArray(product.images)) {
                        parsedImages = product.images;
                    }
                }
            } catch (err) {
                console.error('Ошибка парсинга images для товара', product.id, err.message);
                parsedImages = [];
            }
            
            try {
                if (product.tags) {
                    if (typeof product.tags === 'string') {
                        parsedTags = JSON.parse(product.tags);
                    } else if (Array.isArray(product.tags)) {
                        parsedTags = product.tags;
                    }
                }
            } catch (err) {
                console.error('Ошибка парсинга tags для товара', product.id, err.message);
                parsedTags = [];
            }
            
            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: parseFloat(product.price) || 0,
                original_price: product.original_price ? parseFloat(product.original_price) : null,
                images: parsedImages,
                category_id: product.category_id,
                type: product.type,
                style: product.style,
                size: product.size,
                season: product.season,
                tags: parsedTags,
                in_stock: product.in_stock === 1,
                stock_quantity: product.stock_quantity,
                is_customizable: product.is_customizable === 1,
                customization_options: product.customization_options,
                care_instructions: product.care_instructions,
                weight_grams: product.weight_grams,
                height_cm: product.height_cm,
                is_active: product.is_active === 1,
                views_count: product.views_count,
                sales_count: product.sales_count,
                created_at: product.created_at,
                updated_at: product.updated_at
            };
        });
        
        res.json({
            success: true,
            data: formattedProducts,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Создание товара
router.post('/products', verifyAdminToken, async (req, res) => {
    try {
        const {
            name,
            slug,
            description,
            price,
            original_price,
            images,
            category_id,
            type,
            style,
            size,
            season,
            tags,
            in_stock,
            stock_quantity,
            care_instructions,
            height_cm,
            weight_grams
        } = req.body;

        // Проверка обязательных полей
        if (!name) {
            return res.status(400).json({ success: false, message: 'Название товара обязательно' });
        }
        if (!price) {
            return res.status(400).json({ success: false, message: 'Цена товара обязательна' });
        }

        // Генерируем slug из названия, если не передан
        const finalSlug = slug || name.toLowerCase()
            .replace(/[^а-яёa-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // Устанавливаем category_id по умолчанию
        let defaultCategoryId = 1;
        if (type === 'plant') defaultCategoryId = 4;
        if (type === 'composition') defaultCategoryId = 81;
        
        const finalCategoryId = category_id || defaultCategoryId;

        const [result] = await pool.query(
            `INSERT INTO products (
                name, slug, description, price, original_price, images,
                category_id, type, style, size, season, tags,
                in_stock, stock_quantity, care_instructions, height_cm, weight_grams, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
            [
                name, finalSlug, description || null, price, original_price || null, JSON.stringify(images || []),
                finalCategoryId, type || 'bouquet', style || null, size || 'medium', season || 'all', JSON.stringify(tags || []),
                in_stock !== undefined ? in_stock : 1, stock_quantity || 0, care_instructions || null, height_cm || null, weight_grams || null
            ]
        );

        res.json({ success: true, id: result.insertId, message: 'Товар успешно создан' });
    } catch (error) {
        console.error('Ошибка создания товара:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Обновление товара
router.put('/products/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { in_stock, is_active } = req.body;
        
        await pool.query(
            'UPDATE products SET in_stock = ?, is_active = ? WHERE id = ?',
            [in_stock, is_active, id]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;