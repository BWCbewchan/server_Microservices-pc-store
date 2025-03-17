const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối đến MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Kết nối đến MongoDB thành công");
  } catch (error) {
    console.error("Kết nối đến MongoDB thất bại:", error);
    process.exit(1);
  }
}

// Kiểm tra dữ liệu trong collection inventories
async function checkData() {
  const Inventory = require('./models/inventory'); // Import model

  try {
    const inventories = await Inventory.find(); // Lấy tất cả dữ liệu trong collection
    console.log("Dữ liệu trong collection inventories:", inventories);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  } finally {
    mongoose.connection.close(); // Đóng kết nối
  }
}

// Chạy kiểm tra
(async () => {
  await connectDB();
  await checkData();
})(); 