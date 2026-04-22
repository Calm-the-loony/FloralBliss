const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateAdminToken = (adminId, email, username, role) => {
    return jwt.sign(
        { id: adminId, email, username, role, isAdmin: true },
        process.env.JWT_SECRET || 'floral-bliss-secret-key-2026',
        { expiresIn: '8h' }
    );
};

// Логин администратора
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Поиск администратора:', email);
        
        const [admins] = await pool.query(
            'SELECT id, username, email, password_hash, role, is_active FROM admins WHERE email = ? AND is_active = 1',
            [email]
        );
        
        console.log('Найдено:', admins.length);
        
        if (admins.length === 0) {
            return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
        }
        
        const admin = admins[0];
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
        }
        
        const token = generateAdminToken(admin.id, admin.email, admin.username, admin.role);
        
        await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
        
        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Проверка токена
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Токен не предоставлен' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'floral-bliss-secret-key-2026');
        
        const [admins] = await pool.query(
            'SELECT id, username, email, role FROM admins WHERE id = ? AND is_active = 1',
            [decoded.id]
        );

        if (admins.length === 0) {
            return res.status(401).json({ success: false, message: 'Администратор не найден' });
        }

        res.json({
            success: true,
            admin: admins[0]
        });

    } catch (error) {
        console.error('Ошибка проверки токена:', error);
        res.status(401).json({ success: false, message: 'Недействительный токен' });
    }
});

module.exports = router;