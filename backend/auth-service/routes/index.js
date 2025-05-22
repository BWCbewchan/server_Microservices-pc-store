const express = require("express");
const authController = require("../controllers/authController");
const adminAuthController = require("../controllers/adminAuthController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const otpRoutes = require("./otpRoutes");

const router = express.Router();

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.getCurrentUser);
router.put("/update", protect, authController.updateUser);
router.put("/update-avatar", protect, authController.updateUser);

// Admin routes
router.post("/admin/login", adminAuthController.adminLogin);
router.get("/admin/profile", protect, restrictTo("admin"), adminAuthController.getAdminProfile);

// OTP verification routes
router.use("/otp", otpRoutes);

// Health check
router.get("/ping", (req, res) => {
  res.status(200).json({
    message: "pong",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
