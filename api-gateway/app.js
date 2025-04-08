const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware để parse JSON
app.use(express.json());

// Định tuyến yêu cầu đến các dịch vụ
// Update proxy routes to include /api prefix
// Product Service (Port: 4004)
const productServiceProxy = createProxyMiddleware('/api/products', {
  target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:4004',
  changeOrigin: true,
  pathRewrite: {'^/api/products': '/products'}
});

// Order Service (Port: 3002)
const orderServiceProxy = createProxyMiddleware('/api/orders', {
  target: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {'^/api/orders': '/orders'}
});

// Payment Service (Port: 3003)
const paymentServiceProxy = createProxyMiddleware('/api/payments', {
  target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {'^/api/payments': '/payments'}
});

// Auth Service (Port: 3004)
const authServiceProxy = createProxyMiddleware('/api/auth', {
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {'^/api/auth': '/auth'}
});

// Shipping Service (Port: 3005)
const shippingServiceProxy = createProxyMiddleware('/api/shipping', {
  target: process.env.SHIPPING_SERVICE_URL || 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: {'^/api/shipping': '/shipping'}
});

// Inventory Service (Port: 3006)
const inventoryServiceProxy = createProxyMiddleware('/api/inventory', {
  target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3006',
  changeOrigin: true,
  pathRewrite: {'^/api/inventory': '/inventory'}
});

// Review Service (Port: 3007)
const reviewServiceProxy = createProxyMiddleware('/api/reviews', {
  target: process.env.REVIEW_SERVICE_URL || 'http://localhost:3007',
  changeOrigin: true,
  pathRewrite: {'^/api/reviews': '/reviews'}
});

// Update proxy middleware usage
app.use('/api/products', productServiceProxy);
app.use('/api/orders', orderServiceProxy);
app.use('/api/payments', paymentServiceProxy);
app.use('/api/auth', authServiceProxy);
app.use('/api/shipping', shippingServiceProxy);
app.use('/api/inventory', inventoryServiceProxy);
app.use('/api/reviews', reviewServiceProxy);

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Khởi động server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});
