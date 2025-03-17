// auth-service/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken');

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Xác thực token
router.post('/verifyToken', authenticateToken, authController.verifyToken);

module.exports = router;
