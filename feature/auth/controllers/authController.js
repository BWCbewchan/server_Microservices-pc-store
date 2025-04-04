// auth-service/controllers/authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkRole } = require('../middleware/roleCheck');
const { validateEmail, validatePassword } = require('../utils/validators');

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, phone, role = 'user' } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin',
        details: {
          email: !email ? 'Email là bắt buộc' : null,
          password: !password ? 'Mật khẩu là bắt buộc' : null,
          fullName: !fullName ? 'Họ tên là bắt buộc' : null
        }
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Email không hợp lệ' 
      });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    // Check existing email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email đã được đăng ký' 
      });
    }

    const user = new User({
      email,
      password,
      fullName,
      phone,
      role,
      activityLog: [{
        action: 'ACCOUNT_CREATED',
        details: { method: 'email' }
      }]
    });

    await user.save();

    res.status(201).json({ 
      message: 'Đăng ký thành công' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi đăng ký', 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ 
        message: 'Tài khoản đã bị khóa' 
      });
    }

    // Update last login and log activity
    user.lastLogin = new Date();
    user.activityLog.push({
      action: 'LOGIN',
      details: { ip: req.ip }
    });
    await user.save();

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi đăng nhập', 
      error: error.message 
    });
  }
};

// Quản lý người dùng (Admin)
// Update the getAllUsers function
exports.getAllUsers = async (req, res) => {
  try {
    // Add try-catch for role checking
    try {
      checkRole(req, ['admin']);
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the updateUserStatus function
exports.updateUserStatus = async (req, res) => {
  try {
    // Add try-catch for role checking
    try {
      checkRole(req, ['admin']);
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }

    const { userId, status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.status = status;
    user.activityLog.push({
      action: 'STATUS_CHANGED',
      timestamp: new Date(),
      details: { newStatus: status, changedBy: req.user.id }
    });
    await user.save();

    res.json({ message: 'Cập nhật trạng thái thành công', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Profile Management
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, avatar } = req.body;
    const updates = {};
    
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    Object.assign(user, updates);
    user.activityLog.push({
      action: 'PROFILE_UPDATED',
      timestamp: new Date(),
      details: { updatedFields: Object.keys(updates) }
    });

    await user.save();
    res.json({ message: 'Cập nhật thông tin thành công', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Address Management
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, isDefault, addressType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (!street || !city || !state || !zipCode) {
      return res.status(400).json({ message: 'Thiếu thông tin địa chỉ' });
    }

    if (user.addresses.length >= 5) {
      return res.status(400).json({ message: 'Đã đạt giới hạn số địa chỉ (tối đa 5)' });
    }

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      street,
      city,
      state,
      zipCode,
      isDefault: isDefault || user.addresses.length === 0,
      addressType: addressType || 'home'
    };

    user.addresses.push(newAddress);
    user.activityLog.push({
      action: 'ADDRESS_ADDED',
      timestamp: new Date(),
      details: { addressType, isDefault }
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { street, city, state, zipCode, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    }

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, { street, city, state, zipCode, isDefault });
    user.activityLog.push({
      action: 'ADDRESS_UPDATED',
      timestamp: new Date(),
      details: { addressId }
    });

    await user.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    }

    user.addresses.pull(addressId);
    user.activityLog.push({
      action: 'ADDRESS_DELETED',
      timestamp: new Date(),
      details: { addressId }
    });

    await user.save();
    res.json({ message: 'Xóa địa chỉ thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Activity Log
exports.getActivityLog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const totalLogs = user.activityLog.length;
    const totalPages = Math.ceil(totalLogs / limit);
    const logs = user.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice((page - 1) * limit, page * limit);

    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Token Verification
exports.verifyToken = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    res.json({
      valid: true,
      user: {
        id: req.user.id,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Add this function to your existing controller
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    }

    // Set all addresses to non-default
    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    user.activityLog.push({
      action: 'ADDRESS_SET_DEFAULT',
      timestamp: new Date(),
      details: { addressId }
    });

    await user.save();
    res.json({ message: 'Đã cập nhật địa chỉ mặc định', address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this with your other exports
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.activityLog.push({
      action: 'PASSWORD_CHANGED',
      timestamp: new Date(),
      details: { changedAt: new Date() }
    });

    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
