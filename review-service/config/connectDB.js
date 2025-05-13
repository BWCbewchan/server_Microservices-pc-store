const mongoose = require("mongoose");
require('dotenv').config();

async function connectDB() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connection successful");
    });

    connection.on("error", (error) => {
      console.error("MongoDB connection unsuccessful", error);
    });
  } catch (error) {
    console.error("MongoDB connection unsuccessful", error);
  }
}

module.exports = connectDB;
