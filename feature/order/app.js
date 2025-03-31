// order-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require('./config/connectDB');
const orderRoutes = require('./routes/orderRoutes');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Connect to MongoDB using config
connectDB();

app.use(express.json());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/orders', orderRoutes);

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Order Service đang chạy trên cổng ${port}`);
});
