// app.js
const express = require('express');
const connectDB = require('./common/db');
const statusMonitor = require('express-status-monitor');
require("dotenv").config();

const app = express();

// Configure status monitor
app.use(statusMonitor({
  title: 'PC Store Microservices Status',
  path: '/status',
  spans: [{
    interval: 1,
    retention: 60
  }, {
    interval: 5,
    retention: 60
  }, {
    interval: 15,
    retention: 60
  }],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true
  },
  healthChecks: [
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health',
      port: '3001',
      name: 'Auth Service'
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health',
      port: '3002',
      name: 'Product Service'
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health',
      port: '3003',
      name: 'Order Service'
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health',
      port: '3004',
      name: 'Payment Service'
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health',
      port: '3005',
      name: 'Shipping Service'
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health',
      port: '3006',
      name: 'Inventory Service'
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health',
      port: '3007',
      name: 'Review Service'
    }
  ]
}));

connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server đang chạy trên cổng ${port}`);
    console.log(`Monitoring dashboard available at http://localhost:${port}/status`);
  });
});
