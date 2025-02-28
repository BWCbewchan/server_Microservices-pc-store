// order-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();

require('../common/db'); // Connect to MongoDB

const orderRoutes = require('./routes/orderRoutes');
const axios = require('axios'); // For making requests to other services

app.use(express.json());

app.use('/orders', orderRoutes);

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Order Service đang chạy trên cổng ${port}`);
});
