// inventory-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require("./config/connectDB");
const inventoryRoutes = require('./routes/inventoryRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(express.json());

connectDB();

app.use('/inventory', inventoryRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 3006;
app.listen(port, () => {
  console.log(`Inventory Service đang chạy trên cổng ${port}`);
});
