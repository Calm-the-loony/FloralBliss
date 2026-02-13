const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', authMiddleware, userController.getMe);
router.put('/update', authMiddleware, userController.updateProfile);
router.post('/change-password', authMiddleware, userController.changePassword);

module.exports = router;