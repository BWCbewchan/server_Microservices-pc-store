// auth-service/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../../api-gateway/middleware/authMiddleware'); // Example of importing middleware - but better to centralize

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verifyToken', authenticateToken, authController.verifyToken); // Example: Protected route - might be needed depending on how auth is handled

module.exports = router;
