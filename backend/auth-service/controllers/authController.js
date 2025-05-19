const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-jwt";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Đăng ký người dùng mới - simplified to use body directly
exports.register = async (req, res) => {
  const startTime = Date.now();
  console.log(`Registration request received at ${new Date().toISOString()}`);
  console.log('Request body:', req.body);
  
  try {
    // Get data directly from body as our primary source
    const { name, email, password } = req.body;
    
    console.log(`Processing registration for: ${name}, ${email}`);
    
    // Validate inputs quickly before DB operations
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Check email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // Check if email exists - optimize query with projection and lean
    console.log(`Checking if email ${email} exists in database...`);
    const existingUser = await User.findOne({ email }, { _id: 1 }).lean();
    
    if (existingUser) {
      console.log(`Email ${email} already exists`);
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    
    // Create new user with optimized save
    console.log(`Creating new user for ${email}...`);
    const newUser = new User({ name, email, password });
    await newUser.save();
    
    // Generate JWT token
    console.log(`Generating token for user ${newUser._id}...`);
    const token = generateToken(newUser._id);
    
    // Log performance
    const duration = Date.now() - startTime;
    console.log(`Registration completed in ${duration}ms`);
    
    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      },
      token
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Registration failed after ${duration}ms:`, error.message);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Đăng nhập - simplified to use body directly
exports.login = async (req, res) => {
  const startTime = Date.now();
  console.log(`Login request received at ${new Date().toISOString()}`);
  console.log('Login request body:', req.body);
  
  try {
    // Get data directly from body
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu không được để trống" });
    }
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Log performance
    const duration = Date.now() - startTime;
    console.log(`Login completed in ${duration}ms`);
    
    // Return success response
    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Login failed after ${duration}ms:`, error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy thông tin user hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    res.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật thông tin user
exports.updateUser = async (req, res) => {
  try {
    const name = req.param('name');
    const address = req.param('address');
    const phone = req.param('phone');
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, address, phone },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    res.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Add a simple test endpoint to verify connectivity
exports.testConnection = (req, res) => {
  res.status(200).json({
    message: "Auth service connection test successful",
    timestamp: new Date().toISOString()
  });
};
