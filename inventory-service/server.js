require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/config");
const inventoryRoutes = require("./routers/inventoryRoutes");
const cron = require('node-cron');
const inventoryController = require('./controller/inventoryController');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Initialize app and connect DB
const app = express();
connectDB();

// Middleware setup
app.use(cors({
  origin: process.env.FONTEND_URL || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use(inventoryRoutes);

// Scheduled tasks
cron.schedule('*/10 * * * *', async () => {
  try {
    console.log("🔄 Cron job: Đồng bộ Inventory với Product Service...");
    await inventoryController.syncInventory(
      {}, 
      {
        status: (code) => ({
          json: (data) => console.log(`[${code}]`, data),
        }),
        json: (data) => console.log(data)
      }
    );
  } catch (error) {
    console.error("🚨 Cron job lỗi khi đồng bộ Inventory:", {
      message: error.message,
      stack: error.stack,
      originalError: error.originalError
    });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Inventory Service chạy trên cổng ${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
});
