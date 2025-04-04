const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', auth, authController.verifyToken);

// Profile management routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.get('/activity-log', auth, authController.getActivityLog);

// User management routes (Admin only)
router.get('/users', auth, authController.getAllUsers);
router.put('/users/status', auth, authController.updateUserStatus);

// Address management routes
router.get('/addresses', auth, authController.getAddresses);
router.post('/addresses', auth, authController.addAddress);
router.put('/addresses/:addressId', auth, authController.updateAddress);
router.delete('/addresses/:addressId', auth, authController.deleteAddress);
router.put('/addresses/:addressId/default', auth, authController.setDefaultAddress);

module.exports = router;
