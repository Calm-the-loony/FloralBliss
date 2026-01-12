const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Генерация JWT токена
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
    );
};

// Регистрация пользователя
exports.register = async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;

    try {
        // Валидация
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

        // Проверка существования пользователя
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

        // Хеширование пароля
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Создание пользователя
        const [result] = await pool.query(
            `INSERT INTO users (first_name, last_name, email, phone, password_hash) 
             VALUES (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, phone, passwordHash]
        );

        // Генерация токена
        const token = generateToken(result.insertId, email);

        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: result.insertId,
                firstName,
                lastName,
                email,
                phone,
                registrationDate: new Date()
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

        // Поиск пользователя
        const [users] = await pool.query(
            `SELECT id_user, first_name, last_name, email, phone, password_hash, role 
             FROM users WHERE email = ? AND is_active = TRUE`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        const user = users[0];

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный пароль'
            });
        }

        // Обновление времени последнего входа
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id_user = ?',
            [user.id_user]
        );

        // Генерация токена
        const token = generateToken(user.id_user, user.email);

        res.json({
            success: true,
            message: 'Авторизация успешна',
            user: {
                id: user.id_user,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                lastLogin: new Date()
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
            `SELECT id_user, first_name, last_name, email, phone, role, registration_date 
             FROM users WHERE id_user = ? AND is_active = TRUE`,
            [req.user.userId]
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
                registrationDate: user.registration_date
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