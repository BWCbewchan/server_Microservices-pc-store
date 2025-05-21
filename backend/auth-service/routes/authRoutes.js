const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const adminAuthController = require("../controllers/adminAuthController");
const authMiddleware = require("../middleware/authMiddleware");

// Add CORS headers to all routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Add test connectivity endpoint
router.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'pong',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Add specific test endpoint for API gateway
router.get('/test-connection', authController.testConnection);

// Authentication routes
router.post("/register", (req, res) => {
  // Add explicit CORS headers to this critical endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Log the incoming request for debugging
  console.log('Register endpoint hit, params:', {
    name: req.param('name'),
    email: req.param('email'),
    password: req.param('password') ? '********' : undefined
  });

  // Process registration
  authController.register(req, res);
});

// Add missing login route
router.post("/login", (req, res) => {
  // Add explicit CORS headers to this critical endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Log the incoming request for debugging
  console.log(`[${new Date().toISOString()}] Login endpoint hit, params:`, {
    email: req.param('email'),
    password: req.param('password') ? '********' : undefined
  });

  // Process login
  authController.login(req, res);
});

// Add simple echo endpoint to test connection
router.post("/echo", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    message: "Echo from auth service",
    receivedParams: {
      name: req.param('name'),
      email: req.param('email')
    },
    timestamp: new Date().toISOString()
  });
});

// Protected routes
router.get("/me", authMiddleware.protect, authController.getCurrentUser);
router.put("/update", authMiddleware.protect, authController.updateUser);

// Admin authentication routes
router.post('/admin/login', adminAuthController.adminLogin);
router.get('/admin/profile', authMiddleware.protect, authMiddleware.restrictTo('admin'), adminAuthController.getAdminProfile);

module.exports = router;
