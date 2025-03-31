// review-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();

require('../common/db'); // Connect to MongoDB

const reviewRoutes = require('./routes/reviewRoutes');

app.use(express.json());

app.use('/reviews', reviewRoutes);

const port = process.env.PORT || 3007;
app.listen(port, () => {
  console.log(`Review Service đang chạy trên cổng ${port}`);
});

