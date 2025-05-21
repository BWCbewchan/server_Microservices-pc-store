const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminAuthController = require('./controllers/adminAuthController');

const app = express();
const PORT = process.env.PORT || 4006;

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Configure CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Use auth routes
app.use(authRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Ensure admin user exists in the database
    adminAuthController.ensureAdminExists();

    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
