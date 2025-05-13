const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routers/index");
const connectDB = require("./config/connectDB");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load Swagger documentation
const swaggerDocument = YAML.load('./swagger.yaml');

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

// Cấu hình CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy does not allow this origin."));
      }
    },
    credentials: true,
  })
);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware xử lý JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Sử dụng router
app.use(router);

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
  console.log(`📚 API docs available at http://localhost:${port}/api-docs`);
});
