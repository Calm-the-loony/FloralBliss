const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Токен доступа отсутствует'
        });
    }
    
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Токен доступа отсутствует'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Ошибка верификации токена:', error.message);
        res.status(401).json({
            success: false,
            message: 'Неверный токен'
        });
    }
};

module.exports = authMiddleware;