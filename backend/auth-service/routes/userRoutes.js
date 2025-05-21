const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Test endpoint - accessible without authentication 
router.get('/users-test', (req, res) => {
    console.log("Test endpoint hit");
    res.status(200).json({ message: "User routes are working correctly" });
});

// Make sure these endpoints are accessible without authentication for testing
router.get('/users', userController.getAllUsers);
router.get('/users/:userId', userController.getUserById);
router.put('/users/:userId', userController.updateUser);
router.put('/users/:userId/status', userController.updateUserStatus);
router.delete('/users/:userId', userController.deleteUser);

module.exports = router;
