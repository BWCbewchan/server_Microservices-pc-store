// auth-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require('./config/connectDB');
const authRoutes = require('./routes/authRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Kết nối đến MongoDB
connectDB();

// Middleware
app.use(express.json());

// Định nghĩa các route
app.use('/auth', authRoutes);

// Cấu hình Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Khởi động server
const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Auth Service đang chạy trên cổng ${port}`);
});
