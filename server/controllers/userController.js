const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId, email, role) => {
    return jwt.sign(
        { id: userId, email, role: role || 'user' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
    );
};

// Регистрация пользователя
exports.register = async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    try {
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Все обязательные поля должны быть заполнены'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Пароль должен быть не менее 6 символов'
            });
        }

        const [existingUsers] = await pool.query(
            'SELECT id_user FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Пользователь с таким email уже существует'
            });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const [result] = await pool.query(
            `INSERT INTO users (first_name, last_name, email, phone, password_hash, role) 
             VALUES (?, ?, ?, ?, ?, 'user')`,
            [firstName, lastName, email, phone, passwordHash]
        );

        const token = generateToken(result.insertId, email, 'user');

        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: result.insertId,
                firstName,
                lastName,
                email,
                phone,
                role: 'user'
            },
            token
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при регистрации'
        });
    }
};

// Вход пользователя
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email и пароль обязательны'
            });
        }

        const [users] = await pool.query(
            `SELECT id_user, first_name, last_name, email, phone, password_hash, role, is_active 
             FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        const user = users[0];

        if (user.is_active === 0) {
            return res.status(401).json({
                success: false,
                message: 'Аккаунт заблокирован. Обратитесь к администратору.'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный пароль'
            });
        }

        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id_user = ?',
            [user.id_user]
        );

        const token = generateToken(user.id_user, user.email, user.role);

        res.json({
            success: true,
            message: 'Авторизация успешна',
            user: {
                id: user.id_user,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при авторизации'
        });
    }
};

// Получение информации о текущем пользователе
exports.getMe = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id_user, first_name, last_name, email, phone, role, registration_date, is_active
             FROM users WHERE id_user = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        const user = users[0];
        res.json({
            success: true,
            user: {
                id: user.id_user,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                registrationDate: user.registration_date,
                is_active: user.is_active
            }
        });

    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

// Обновление профиля
exports.updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, email, phone } = req.body;
        const userId = req.user.id;

        await pool.query(
            `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id_user = ?`,
            [first_name, last_name, email, phone, userId]
        );

        res.json({
            success: true,
            message: 'Профиль обновлен'
        });
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

// Смена пароля
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [users] = await pool.query(
            `SELECT password_hash FROM users WHERE id_user = ?`,
            [userId]
        );

        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Текущий пароль неверен'
            });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await pool.query(
            `UPDATE users SET password_hash = ? WHERE id_user = ?`,
            [newPasswordHash, userId]
        );

        res.json({
            success: true,
            message: 'Пароль успешно изменен'
        });
    } catch (error) {
        console.error('Ошибка смены пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};