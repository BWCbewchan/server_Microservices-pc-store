const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cartRoutes = require("./routes/cartRoutes");
const cors = require("cors");
const cartController = require("./controllers/cartController"); // Add this line

const app = express();
app.use(
  cors({
    origin: process.env.FONTEND_URL || "*", // Nếu không có biến môi trường, cho phép tất cả
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Sử dụng middleware để parse JSON
app.use(express.json());

// Thêm endpoint redis-test trực tiếp ở root level
app.get('/redis-test', cartController.testRedis);

// Sử dụng routes cho Cart Service
app.use(cartRoutes);
// app.use("/api/cart", cartRoutes);

// Cập nhật health endpoint với thông tin Redis
app.get('/health', async (req, res) => {
  const redisClient = cartController.getRedisClient();
  let redisStatus = 'disconnected';
  
  try {
    // Kiểm tra kết nối Redis
    const redisConnected = await cartController.checkRedisConnection();
    redisStatus = redisConnected ? 'connected' : 'disconnected';
  } catch (error) {
    redisStatus = `error: ${error.message}`;
  }
  
  res.status(200).json({
    status: 'ok',
    service: 'cart-service',
    redis: redisStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4005;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ngophuc2911:phuc29112003@cluster0.zz9vo.mongodb.net/cartService?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB for Cart Service");
    app.listen(PORT, () =>
      console.log(`Cart Service is running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
