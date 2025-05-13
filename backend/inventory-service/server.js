require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/config");
const inventoryRoutes = require("./routers/inventoryRoutes");
const cron = require('node-cron');
const inventoryController = require('./controller/inventoryController');
const app = express();
connectDB();

app.use(
  cors({
    origin: process.env.FONTEND_URL || "*", // Nếu không có biến môi trường, cho phép tất cả
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(inventoryRoutes);
cron.schedule('*/10 * * * *', async () => {
  try {
    console.log("🔄 Cron job: Đồng bộ Inventory với Product Service...");
    await inventoryController.syncInventory({}, { json: console.log, status: () => ({ json: console.log }) });
  } catch (error) {
    console.error("🚨 Cron job lỗi khi đồng bộ Inventory:", error.message);
  }
});
// app.use("/api/inventory", inventoryRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Inventory Service chạy trên cổng ${PORT}`));
