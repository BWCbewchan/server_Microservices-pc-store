// db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load biến môi trường từ file .env

const connectDB = async () => {
  console.log(process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Không cần các tùy chọn deprecated
    });
    console.log(process.env.MONGODB_URI);
    console.log('Kết nối MongoDB thành công!');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error.message);
    process.exit(1); // Thoát chương trình nếu kết nối thất bại
  }
};

module.exports = connectDB;
