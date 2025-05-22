const User = require("../models/User");
const crypto = require("crypto");
const { sendOtpEmail, sendVerificationSuccessEmail } = require("../services/emailService");

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP for verification
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash the OTP before storing
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Store OTP and expiration in user record
    user.otp = hashedOTP;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).json({ 
      message: "Verification code sent to your email",
      email: email
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Hash the provided OTP for comparison
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Find user with valid OTP
    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send success email
    await sendVerificationSuccessEmail(email);

    res.status(200).json({ 
      message: "Email verified successfully",
      isVerified: true
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash the OTP before storing
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Update OTP and expiration
    user.otp = hashedOTP;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).json({ 
      message: "New verification code sent to your email",
      email: email
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
