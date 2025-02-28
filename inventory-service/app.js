// inventory-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();

require('../common/db');
const inventoryRoutes = require('./routes/inventoryRoutes');

app.use(express.json());

app.use('/inventory', inventoryRoutes);

const port = process.env.PORT || 3006;
app.listen(port, () => {
  console.log(`Inventory Service đang chạy trên cổng ${port}`);
});
