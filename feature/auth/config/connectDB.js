const mongoose = require("mongoose");

async function connectDB() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("MongoDB connection unsuccessful:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
