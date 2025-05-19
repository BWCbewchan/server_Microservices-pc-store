const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-jwt";

exports.protect = async (req, res, next) => {
  try {
    // Lấy token từ header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    // Kiểm tra nếu token không tồn tại
    if (!token) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập." });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kiểm tra nếu user tồn tại
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Token không còn hợp lệ" });
    }
    
    // Gán user vào request
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn. Vui lòng đăng nhập lại." });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập tính năng này" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
};
