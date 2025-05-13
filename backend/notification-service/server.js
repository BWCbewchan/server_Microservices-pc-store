const express = require("express");
const app = express();
const port = 4001;
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const connectDB = require("./config/connectDB");
const NotificationModel = require("./models/NotificationModel");

// Kết nối DB
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2],
    credentials: true,
  },
});

app.get("/base-url", (req, res) => {
  res.json({ baseUrl: `http://localhost:${port}` });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const userId = "60f3b9f3e6e3a90015b6c9a4";
const orderId = "60f3b9f3e6e3a90015b6c9a5";
app.post("/send-notification", async (req, res) => {
  try {
    // const { userId, title, message } = req.body;

    // if (!userId) return res.status(400).json({ error: "userId is required" });

    // Tạo thông báo mới

    const notification = new NotificationModel({
      userId: userId,
      title: "Đặt hàng thành công!",
      message: `Đơn hàng của bạn (#${orderId}) đã được đặt thành công. Chúng tôi sẽ sớm xác nhận và giao hàng!`,
      type: "order",
      orderId: orderId,
      orderStatus: "pending",
      status: "unread",
      isRead: false,
      platform: "web",
    });

    await notification.save();

    // Gửi thông báo real-time qua Socket.io
    io.to(userId).emit("notification", notification);

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/unread-count", async (req, res) => {
  try {
    // const { userId } = req.query;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    const count = await NotificationModel.countDocuments({ userId, status: "unread" });

    res.json({ success: true, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/mark-as-read", async (req, res) => {
  try {
    // const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    await NotificationModel.updateMany({ userId, status: "unread" }, { $set: { status: "read" } });

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/notifications", async (req, res) => {
  try {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

server.listen(port, () => {
  console.log("Server is running on http://localhost:" + port);
});
