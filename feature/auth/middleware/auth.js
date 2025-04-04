const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Không tìm thấy token xác thực' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.status === 'banned') {
      return res.status(401).json({ 
        message: 'Người dùng không tồn tại hoặc đã bị khóa' 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Token không hợp lệ hoặc đã hết hạn' 
    });
  }
};

module.exports = auth;