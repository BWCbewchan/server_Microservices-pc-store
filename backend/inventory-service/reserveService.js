require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Cần import mongoose
const Inventory = require("./models/InventoryModels")

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

const PORT = process.env.RESERVE_PORT || 4009;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ngophuc2911:phuc29112003@cluster0.zz9vo.mongodb.net/inventoryServices?retryWrites=true&w=majority";

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB for Cart Service");
        app.listen(PORT, () => console.log(`Reserve Service chạy trên cổng ${PORT}`));
    })
    .catch((err) => {
        console.error("Lỗi kết nối MongoDB:", err);
        process.exit(1); // Thoát chương trình nếu không kết nối được DB
    });

 
app.post("/api/inventory/reserve/:productId/:quantity", async (req, res) => {
    try {
        const { productId, quantity } = req.params;
        const parsedQuantity = parseInt(quantity, 10);

        if (!productId || isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        const inventory = await Inventory.findOne({ productId });
        if (!inventory) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        const available = inventory.quantity - inventory.reserved;
        if (available < parsedQuantity) {
            return res.status(400).json({ message: `Không đủ hàng. Chỉ còn ${available} sản phẩm có sẵn.` });
        }

        inventory.reserved += parsedQuantity;
        inventory.updatedAt = new Date();
        await inventory.save();

        res.json({ success: true, reserved: inventory.reserved });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi đặt chỗ sản phẩm", error: error.message });
    }
});
app.post("/api/inventory/release/:productId/:quantity", async (req, res) => {
    try {
        const { productId, quantity } = req.params;
        const parsedQuantity = parseInt(quantity, 10);

        if (!productId || isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        const inventory = await Inventory.findOne({ productId });
        if (!inventory) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        if (inventory.reserved < parsedQuantity) {
            return res.status(400).json({ message: "Không thể giải phóng nhiều hơn số lượng đã đặt chỗ" });
        }

        inventory.reserved -= parsedQuantity;
        inventory.updatedAt = new Date();
        await inventory.save();

        res.json({ success: true, reserved: inventory.reserved });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi giải phóng sản phẩm", error: error.message });
    }
});

 

