require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const orderRoutes = require("./routes/orderRoutes");
const cors = require("cors");

// Configure base API URLs
if (!process.env.API_GATEWAY_URL) {
  console.warn("API_GATEWAY_URL not set in environment, using default http://localhost:3000");
  process.env.API_GATEWAY_URL = "http://localhost:3000";
}

const app = express();

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body));
  }
  next();
});

// Kích hoạt CORS trước khi xử lý các request khác
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'order-service',
    timestamp: new Date().toISOString(),
    environment: {
      apiGatewayUrl: process.env.API_GATEWAY_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Increase payload size limit
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Error handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({ 
      message: 'Lỗi dữ liệu đầu vào', 
      error: 'Invalid JSON format' 
    });
  }
  next(err);
});

app.use(orderRoutes);

const PORT = process.env.PORT || 4009;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ngophuc2911:phuc29112003@cluster0.zz9vo.mongodb.net/orderService?retryWrites=true&w=majority";

// Connect to MongoDB with retry
const connectWithRetry = async (retries = 5, delay = 5000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      console.log(`MongoDB connection attempt ${attempt + 1}/${retries}`);
      await mongoose.connect(MONGO_URI, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Connected to MongoDB for Order Service");
      return;
    } catch (err) {
      attempt++;
      console.error(`MongoDB connection error (attempt ${attempt}/${retries}):`, err.message);
      if (attempt >= retries) {
        throw err;
      }
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 30000); // Exponential backoff up to 30 seconds
    }
  }
};

// Start server after MongoDB connection
const startServer = async () => {
  try {
    await connectWithRetry();
    app.listen(PORT, () => {
      console.log(`Order Service is running on port ${PORT}`);
      console.log(`API Gateway URL: ${process.env.API_GATEWAY_URL}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB, server not started:", err);
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions and promise rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
