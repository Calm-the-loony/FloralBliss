const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Не авторизован' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Доступ запрещен. Требуются права администратора.' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Недействительный токен' });
    }
};

module.exports = adminMiddleware;