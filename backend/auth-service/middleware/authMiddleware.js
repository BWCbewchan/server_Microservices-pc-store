const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-jwt";

exports.protect = async (req, res, next) => {
  // Add logging for debugging
  console.log("Auth middleware called");
  console.log("Headers:", JSON.stringify(req.headers));
  
  // Always add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Extract token from Authorization header
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("Token extracted:", token.substring(0, 20) + "...");
    }
    
    // Check if token exists
    if (!token) {
      console.log("No token found in request");
      return res.status(401).json({ message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập." });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token verified successfully. User ID:", decoded.id);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log("User not found:", decoded.id);
        return res.status(401).json({ message: "Token không còn hợp lệ" });
      }
      
      // Attach user to request
      req.userId = user._id;
      console.log("User found and attached to request:", user._id);
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token đã hết hạn. Vui lòng đăng nhập lại." });
      }
      
      throw jwtError;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
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
