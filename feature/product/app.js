const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routers/index");
const connectDB = require("./config/connectDB");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const morgan = require('morgan');
const compression = require("compression");
dotenv.config();
const app = express();

const port = process.env.PORT || 4004;

// Kết nối DB
connectDB();

// Sử dụng morgan để ghi lại các request với định dạng "dev"
app.use(morgan("dev"));
app.use(compression())
// Cấu hình Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Danh sách origin được phép
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:2000",
  process.env.FRONTEND_URL_2 || "http://localhost:5173",
];

console.log("Allowed Origins:", allowedOrigins.join(", "));

// Cấu hình CORS
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Origin:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy does not allow this origin."));
      }
    },
    credentials: true,
  })
);

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
});