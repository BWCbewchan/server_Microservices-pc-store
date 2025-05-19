const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const authRoutes = require("./routes/authRoutes");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Simplify JSON body parsing
app.use(express.json({ limit: '1mb' }));

// Simplify CORS to ensure consistent behavior
app.use(cors({ origin: '*' }));

// Simplify request logging to minimal
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Replace the existing param middleware with a more efficient implementation
app.use((req, res, next) => {
  req.param = function(name) {
    // Prioritize body for better performance with API Gateway
    return (this.body && this.body[name] !== undefined) ? this.body[name] :
           (this.params && this.params[name] !== undefined) ? this.params[name] :
           (this.query && this.query[name] !== undefined) ? this.query[name] : undefined;
  };
  next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Simple ping endpoint for testing
app.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong',
    timestamp: new Date().toISOString() 
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    service: 'auth-service'
  });
});

// Add a quick check test route
app.get('/quick-test', (req, res) => {
  res.status(200).send('Auth service is responding quickly');
});

// Mount routes at multiple paths for different access patterns
app.use('/', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Update root route with CORS header
app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.redirect('/api-docs');
});

// Simple error handling
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// MongoDB connection with optimized settings
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ngophuc2911:phuc29112003@cluster0.zz9vo.mongodb.net/authService?retryWrites=true&w=majority";
// Direct connection string format (bypassing SRV lookup)
const DIRECT_MONGO_URI = "mongodb://ngophuc2911:phuc29112003@ac-7nkzc8n-shard-00-00.zz9vo.mongodb.net:27017,ac-7nkzc8n-shard-00-01.zz9vo.mongodb.net:27017,ac-7nkzc8n-shard-00-02.zz9vo.mongodb.net:27017/authService?ssl=true&replicaSet=atlas-7lxv4m-shard-0&authSource=admin";
const PORT = process.env.PORT || 4006;

// Optimize MongoDB connection
mongoose.set('bufferCommands', false); // Disable command buffering for faster fails
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000, // Reduce to 5 seconds
  socketTimeoutMS: 30000, // Reduce to 30 seconds
  // Disable unnecessary features
  autoIndex: false  // Don't build indexes automatically
})
.then(() => {
  console.log("Connected to MongoDB via SRV connection");
  startServer();
})
.catch(err => {
  console.error("Primary MongoDB connection error:", err);
  
  // Check if it's a DNS resolution error
  if (err.code === 'ESERVFAIL' || err.syscall === 'queryTxt') {
    console.log("DNS resolution error detected. Trying direct connection...");
    
    // Try the direct connection string as fallback
    mongoose.connect(DIRECT_MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000, // Reduce to 5 seconds
      socketTimeoutMS: 30000, // Reduce to 30 seconds
      ssl: true,
      authSource: 'admin',
      autoIndex: false  // Don't build indexes automatically
    })
    .then(() => {
      console.log("Connected to MongoDB via direct connection");
      startServer();
    })
    .catch(directErr => {
      console.error("All MongoDB connection attempts failed:", directErr);
      process.exit(1);
    });
  } else {
    console.error("Unrecoverable MongoDB connection error");
    process.exit(1);
  }
});

// Function to start the server
function startServer() {
  app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`API Endpoints available at:`);
    console.log(`- http://localhost:${PORT}/ (Direct)`);
    console.log(`- http://localhost:${PORT}/auth (For Swagger)`);
    console.log(`- http://localhost:${PORT}/api/auth (Via API Gateway)`);
  });
}
