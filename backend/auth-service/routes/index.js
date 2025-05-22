const express = require("express");
const authRoutes = require("./authRoutes");
const otpRoutes = require("./otpRoutes");

const router = express.Router();

// CORS preflight for all routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Log all requests for debugging
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// Use auth routes
router.use("/", authRoutes);

// OTP verification routes
router.use("/otp", otpRoutes);

// Handle 404 errors
router.use("*", (req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    requestedUrl: req.originalUrl
  });
});

module.exports = router;
