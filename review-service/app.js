// review-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require('./config/connectDB');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');

// Load Swagger document
const swaggerDocument = YAML.load('./swagger.yaml');

// Connect to MongoDB
connectDB();

const reviewRoutes = require('./routes/reviewRoutes');

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Review Service',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.use('/reviews', reviewRoutes);

const port = process.env.PORT || 3007;
app.listen(port, () => {
  console.log(`Review Service đang chạy trên cổng ${port}`);
});

