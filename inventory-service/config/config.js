const mongoose = require("mongoose");

async function connectDB() {
  console.log("Connecting to MongoDB...");
  try {
      await mongoose.connect("mongodb+srv://ngophuc2911:phuc29112003@cluster0.zz9vo.mongodb.net/inventoryServices?retryWrites=true&w=majority", {
      serverSelectionTimeoutMS: 5000, // Nếu không kết nối được sau 5s thì báo lỗi
      socketTimeoutMS: 45000, // Timeout cho socket
    });

    mongoose.connection.once("open", () => {
      console.log("✅ MongoDB connection successful");
    });

    mongoose.connection.on("error", (error) => {
      console.error("⛔ MongoDB connection error:", error);
      setTimeout(connectDB, 5000); // Thử kết nối lại sau 5 giây nếu có lỗi
    });
  } catch (error) {
    console.error("⛔ Initial MongoDB connection unsuccessful", error);
    setTimeout(connectDB, 5000); // Nếu lỗi, thử lại sau 5 giây
  }
}

module.exports = connectDB;