const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require("./config/connectDB");
const cartRoutes = require('./routes/cartRoutes'); // Import cart routes
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(express.json());

connectDB(); // Kết nối đến MongoDB

// Sử dụng router cho giỏ hàng
app.use('/cart', cartRoutes); // Đảm bảo rằng router được sử dụng với prefix '/cart'

// Cấu hình Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});