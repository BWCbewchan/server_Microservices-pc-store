const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.body.token || req.headers['authorization']?.split(' ')[1]; // Lấy token từ body hoặc header

  if (!token) return res.sendStatus(401); // Không có token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token không hợp lệ
    req.user = user; // Gán thông tin người dùng vào req.user
    next();
  });
};

module.exports = authenticateToken;
