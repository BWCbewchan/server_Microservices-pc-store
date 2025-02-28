// auth-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();

require('../common/db'); // Connect to MongoDB

const authRoutes = require('./routes/authRoutes');

app.use(express.json());

app.use('/auth', authRoutes);

const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Auth Service đang chạy trên cổng ${port}`);
});
