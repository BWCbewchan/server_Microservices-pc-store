const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
const allowedOrigins = ["http://localhost:2000", "http://localhost:5173"];
const PORT = 3000;
console.log("Allowed Origins:", allowedOrigins);

// Update CORS configuration to handle specific origins
app.use(cors({
  origin: ["http://localhost:2000", "http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// Add the param function to the request object for the API Gateway
app.use((req, res, next) => {
  req.param = function(name) {
    if (this.params && this.params[name] !== undefined) return this.params[name];
    if (this.body && this.body[name] !== undefined) return this.body[name];
    if (this.query && this.query[name] !== undefined) return this.query[name];
    return undefined;
  };
  next();
});

// Cấu hình các service
const services = {
  products: "http://localhost:4004",
  inventory: "http://localhost:4000",
  cart: "http://localhost:4005",
  notification: "http://localhost:4001",
  orders: "http://localhost:4009",
  payment: "http://localhost:4545",
  auth: "http://localhost:4006"
};

// Replace the existing auth proxy with a much simpler version
app.use('/api/auth', (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Direct handling of ${req.method} ${req.originalUrl}`);
  
  const http = require('http');
  
  let bodyData = '';
  if (req.method === 'POST' || req.method === 'PUT') {
    bodyData = JSON.stringify(req.body);
  }
  
  const options = {
    hostname: 'localhost',
    port: 4006,
    path: req.url.replace('/api/auth', ''),
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyData)
    }
  };
  
  const authReq = http.request(options, (authRes) => {
    Object.keys(authRes.headers).forEach(key => {
      res.setHeader(key, authRes.headers[key]);
    });
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(authRes.statusCode);
    
    authRes.pipe(res);
    
    authRes.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Auth request completed in ${duration}ms with status ${authRes.statusCode}`);
    });
  });
  
  authReq.on('error', (error) => {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Auth request failed after ${duration}ms:`, error.message);
    
    res.status(502).json({
      error: 'Bad Gateway',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  });
  
  authReq.setTimeout(10000, () => {
    authReq.destroy();
    res.status(504).json({
      error: 'Gateway Timeout',
      message: 'Request to auth service timed out',
      timestamp: new Date().toISOString()
    });
  });
  
  if (bodyData) {
    authReq.write(bodyData);
  }
  authReq.end();
});

// Create dedicated, simplified auth endpoints for better reliability
app.post('/register', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    console.log('Direct register endpoint called with data:', JSON.stringify(req.body));
    
    const http = require('http');
    const postData = JSON.stringify({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    
    const options = {
      hostname: 'localhost',
      port: 4006,
      path: '/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const authReq = http.request(options, (authRes) => {
      let responseData = '';
      
      authRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      authRes.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          res.status(authRes.statusCode).json(jsonResponse);
        } catch (e) {
          res.status(500).json({
            error: true,
            message: 'Error parsing auth service response',
            data: responseData
          });
        }
      });
    });
    
    authReq.on('error', (error) => {
      console.error('Auth service request error:', error.message);
      res.status(500).json({
        error: true,
        message: `Failed to connect to auth service: ${error.message}`
      });
    });
    
    authReq.setTimeout(10000, () => {
      authReq.destroy();
      res.status(504).json({
        error: true,
        message: 'Request to auth service timed out (10s)'
      });
    });
    
    authReq.write(postData);
    authReq.end();
  } catch (error) {
    console.error('Register endpoint error:', error);
    res.status(500).json({
      error: true,
      message: `Server error: ${error.message}`
    });
  }
});

// Similar standalone login endpoint for better reliability
app.post('/login', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('Direct login endpoint called');
    
    const http = require('http');
    const postData = JSON.stringify({
      email: req.body.email,
      password: req.body.password
    });
    
    const options = {
      hostname: 'localhost',
      port: 4006,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const authReq = http.request(options, (authRes) => {
      let responseData = '';
      
      authRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      authRes.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          res.status(authRes.statusCode).json(jsonResponse);
        } catch (e) {
          res.status(500).json({
            error: true,
            message: 'Error parsing auth service response'
          });
        }
      });
    });
    
    authReq.on('error', (error) => {
      console.error('Auth service request error:', error.message);
      res.status(500).json({
        error: true,
        message: `Failed to connect to auth service: ${error.message}`
      });
    });
    
    authReq.setTimeout(10000, () => {
      authReq.destroy();
      res.status(504).json({
        error: true,
        message: 'Request to auth service timed out'
      });
    });
    
    authReq.write(postData);
    authReq.end();
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({
      error: true,
      message: `Server error: ${error.message}`
    });
  }
});

// Add specific route handler for products endpoints
app.use('/products', (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Product request: ${req.method} ${req.originalUrl}`);
  
  const http = require('http');
  
  let bodyData = '';
  if (req.method === 'POST' || req.method === 'PUT') {
    bodyData = JSON.stringify(req.body);
  }
  
  const options = {
    hostname: 'localhost',
    port: 4004,
    path: req.url,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyData)
    }
  };
  
  console.log(`Forwarding to: ${options.hostname}:${options.port}${options.path}`);
  
  const productReq = http.request(options, (productRes) => {
    Object.keys(productRes.headers).forEach(key => {
      res.setHeader(key, productRes.headers[key]);
    });
    
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:2000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(productRes.statusCode);
    
    let data = '';
    productRes.on('data', (chunk) => {
      data += chunk;
      res.write(chunk);
    });
    
    productRes.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Product request completed in ${duration}ms with status ${productRes.statusCode}`);
      res.end();
    });
  });
  
  productReq.on('error', (error) => {
    console.error(`Product service error: ${error.message}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: `Failed to connect to product service: ${error.message}`
    });
  });
  
  productReq.setTimeout(10000, () => {
    productReq.destroy();
    res.status(504).json({
      error: 'Gateway Timeout',
      message: 'Request to product service timed out'
    });
  });
  
  if (bodyData) {
    productReq.write(bodyData);
  }
  productReq.end();
});

// Add specific route handler for notification endpoints
app.use('/notification', (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Notification request: ${req.method} ${req.originalUrl}`);
  
  const http = require('http');
  
  let bodyData = '';
  if (req.method === 'POST' || req.method === 'PUT') {
    bodyData = JSON.stringify(req.body);
  }
  
  const options = {
    hostname: 'localhost',
    port: 4001,
    path: req.url,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyData)
    }
  };
  
  console.log(`Forwarding to: ${options.hostname}:${options.port}${options.path}`);
  
  const notificationReq = http.request(options, (notificationRes) => {
    Object.keys(notificationRes.headers).forEach(key => {
      res.setHeader(key, notificationRes.headers[key]);
    });
    
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:2000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.status(notificationRes.statusCode);
    
    let data = '';
    notificationRes.on('data', (chunk) => {
      data += chunk;
      res.write(chunk);
    });
    
    notificationRes.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Notification request completed in ${duration}ms with status ${notificationRes.statusCode}`);
      res.end();
    });
  });
  
  notificationReq.on('error', (error) => {
    console.error(`Notification service error: ${error.message}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: `Failed to connect to notification service: ${error.message}`
    });
  });
  
  notificationReq.setTimeout(10000, () => {
    notificationReq.destroy();
    res.status(504).json({
      error: 'Gateway Timeout',
      message: 'Request to notification service timed out'
    });
  });
  
  if (bodyData) {
    notificationReq.write(bodyData);
  }
  notificationReq.end();
});

// Add a mock implementation for products when the service is down
app.get('/mock/products/products-new', (req, res) => {
  res.json({
    data: [
      {
        id: "mock-product-1",
        name: "Mock Product 1",
        price: 999.99,
        description: "This is a mock product for when the service is down",
        image: "https://via.placeholder.com/300",
        category: "Desktops"
      },
      {
        id: "mock-product-2",
        name: "Mock Product 2",
        price: 1299.99,
        description: "Another mock product for testing",
        image: "https://via.placeholder.com/300",
        category: "Laptops"
      }
    ]
  });
});

// Add a mock implementation for product categories when the service is down
app.get('/mock/products/products-category/:category', (req, res) => {
  const category = req.params.category;
  res.json({
    data: [
      {
        id: `mock-${category}-1`,
        name: `Mock ${category} 1`,
        price: 999.99,
        description: `This is a mock ${category} product`,
        image: "https://via.placeholder.com/300",
        category: category
      },
      {
        id: `mock-${category}-2`,
        name: `Mock ${category} 2`,
        price: 1299.99,
        description: `Another mock ${category} product`,
        image: "https://via.placeholder.com/300",
        category: category
      }
    ]
  });
});

// Proxy cho tất cả request đến API Gateway
Object.keys(services).forEach((route) => {
  if (route !== 'auth') {
    console.log(`Forwarding /api/${route} to ${services[route]}`);
    app.use(
      `/api/${route}`,
      createProxyMiddleware({
        ws: true,
        target: services[route],
        changeOrigin: true,
        pathRewrite: { [`^/api/${route}`]: "" },
      })
    );
  }
});

// Create a simplified diagnostic test endpoint
app.get('/api-status', (req, res) => {
  res.json({
    status: 'API Gateway running',
    timestamp: new Date().toISOString(),
    auth_service: services.auth
  });
});

// Add better error handling and crash recovery
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add startup check to verify services
app.get('/startup-check', (req, res) => {
  const results = [];
  
  Object.entries(services).forEach(([name, url]) => {
    try {
      results.push({
        service: name,
        url: url,
        status: 'configured'
      });
    } catch (error) {
      results.push({
        service: name,
        url: url,
        status: 'error',
        error: error.message
      });
    }
  });
  
  res.json({
    gateway: {
      status: 'running',
      port: PORT
    },
    services: results
  });
});

// Change server startup to handle errors better
const startServer = () => {
  try {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API Gateway running at http://localhost:${PORT}`);
      console.log(`Services configured: ${Object.keys(services).join(', ')}`);
      console.log(`Test endpoint: http://localhost:${PORT}/startup-check`);
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try using a different port.`);
        const newPort = PORT + 1;
        console.log(`Attempting to use port ${newPort} instead...`);
        app.listen(newPort, () => {
          console.log(`🚀 API Gateway running at http://localhost:${newPort}`);
        });
      } else {
        console.error('Server error:', error);
      }
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    setTimeout(() => {
      console.log('Attempting to restart server...');
      startServer();
    }, 5000);
  }
};

startServer();