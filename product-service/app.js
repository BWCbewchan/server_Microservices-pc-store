// product-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();  // Load environment variables

require('../common/db'); // Connect to MongoDB
const productRoutes = require('./routes/productRoutes');

app.use(express.json());

app.use('/products', productRoutes);

const port = process.env.PORT || 3001; // Use environment variable for port
app.listen(port, () => {
  console.log(`Product Service đang chạy trên cổng ${port}`);
});
