const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config(); // Load biến môi trường từ file .env

const app = express();
const port = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Định tuyến yêu cầu đến các dịch vụ
const productServiceProxy = createProxyMiddleware('/products', {
  target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
});

const orderServiceProxy = createProxyMiddleware('/orders', {
  target: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
});

const paymentServiceProxy = createProxyMiddleware('/payments', {
  target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
});

const authServiceProxy = createProxyMiddleware('/auth', {
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
});

const shippingServiceProxy = createProxyMiddleware('/shippings', {
  target: process.env.SHIPPING_SERVICE_URL || 'http://localhost:3005',
  changeOrigin: true,
});

const inventoryServiceProxy = createProxyMiddleware('/inventories', {
  target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3006',
  changeOrigin: true,
});

const reviewServiceProxy = createProxyMiddleware('/reviews', {
  target: process.env.REVIEW_SERVICE_URL || 'http://localhost:3007',
  changeOrigin: true,
});

// Sử dụng các proxy middleware
app.use('/products', productServiceProxy);
app.use('/orders', orderServiceProxy);
app.use('/payments', paymentServiceProxy);
app.use('/auth', authServiceProxy);
app.use('/shippings', shippingServiceProxy);
app.use('/inventories', inventoryServiceProxy);
app.use('/reviews', reviewServiceProxy);

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Khởi động server
app.listen(port, () => {
  console.log(`API Gateway đang chạy trên cổng ${port}`);
});
