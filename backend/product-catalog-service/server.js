const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routers/index");
const connectDB = require("./config/connectDB");

dotenv.config();
const app = express();
const port = process.env.PORT || 4004;

// Kết nối DB
connectDB();

// Danh sách origin được phép
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:2000",
  process.env.FRONTEND_URL_2 || "http://localhost:5173",
];

console.log("Allowed Origins:", allowedOrigins);

// Cấu hình CORS - Fix for credentials issue
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL || "http://localhost:2000",
        process.env.FRONTEND_URL_2 || "http://localhost:5173",
        "http://localhost:3000" // Allow API Gateway
      ];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        callback(null, false);
      }
    },
    credentials: true
  })
);

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware xử lý JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Sử dụng router
app.use(router);

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'product-catalog',
    timestamp: new Date().toISOString()
  });
});

// Middleware xử lý lỗi CORS
app.use((err, req, res, next) => {
  if (err.message === "CORS policy does not allow this origin.") {
    return res.status(403).json({ error: "CORS policy blocked this request." });
  }
  next(err);
});

// Chạy server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
