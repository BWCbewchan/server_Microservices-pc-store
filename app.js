// app.js
const express = require('express');
const connectDB = require('./common/db');

require("dotenv").config();
const app = express();

connectDB().then(() => {
  // Khởi động server sau khi kết nối MongoDB thành công
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server đang chạy trên cổng ${port}`);
  });
});
