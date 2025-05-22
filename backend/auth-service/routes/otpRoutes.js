const express = require("express");
const otpController = require("../controllers/otpController");
const router = express.Router();

// OTP Routes
router.post("/request", otpController.requestOTP);
router.post("/verify", otpController.verifyOTP);
router.post("/resend", otpController.resendOTP);

module.exports = router;
