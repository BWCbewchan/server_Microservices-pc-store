// api-gateway/app.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
require('dotenv').config();
const authMiddleware = require('./middleware/authMiddleware');  // Import authentication middleware
const cors = require('cors'); // Import CORS middleware

// Enable CORS for all origins in development (VERY IMPORTANT)
app.use(cors());

app.use(express.json());

// Authentication Middleware (applied globally)
app.use(authMiddleware.authenticateToken);

// Route requests to specific services
const productServiceProxy = createProxyMiddleware('/products', {
    target: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3001', // Use env variable
    changeOrigin: true,
    pathRewrite: {
        '^/products': '/', // Remove the /products prefix when forwarding
    },
    logLevel: 'debug'
});

const orderServiceProxy = createProxyMiddleware('/orders', {
    target: process.env.ORDER_SERVICE_URL || 'http://order-service:3002',
    changeOrigin: true,
        pathRewrite: {
        '^/orders': '/', // Remove the /orders prefix when forwarding
    },
    logLevel: 'debug'
});

const paymentServiceProxy = createProxyMiddleware('/payments', {
    target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3003',
    changeOrigin: true,
     pathRewrite: {
        '^/payments': '/', // Remove the /payments prefix when forwarding
    },
    logLevel: 'debug'
});

const authServiceProxy = createProxyMiddleware('/auth', {
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3004',
    changeOrigin: true,
     pathRewrite: {
        '^/auth': '/', // Remove the /auth prefix when forwarding
    },
    logLevel: 'debug'
});

const inventoryServiceProxy = createProxyMiddleware('/inventory', {
    target: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3006',
    changeOrigin: true,
    pathRewrite: {
       '^/inventory': '/', // Remove the /inventory prefix when forwarding
   },
   logLevel: 'debug'
});

const reviewServiceProxy = createProxyMiddleware('/reviews', {
    target: process.env.REVIEW_SERVICE_URL || 'http://review-service:3007',
    changeOrigin: true,
    pathRewrite: {
       '^/reviews': '/', // Remove the /reviews prefix when forwarding
   },
   logLevel: 'debug'
});

app.use('/products', productServiceProxy);
app.use('/orders', orderServiceProxy);
app.use('/payments', paymentServiceProxy);
app.use('/auth', authServiceProxy);
app.use('/inventory', inventoryServiceProxy);
app.use('/reviews', reviewServiceProxy);

// Protected Route Example (Applying Authorization)
app.get('/admin', authMiddleware.authorizeRole(['admin']), (req, res) => {
    // This route is only accessible to users with the "admin" role
    res.json({ message: 'Admin area access granted!' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API Gateway đang chạy trên cổng ${port}`);
});
