const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS
const PORT = process.env.PORT || 3000;
console.log("Allowed Origins:", allowedOrigins);

// Global CORS middleware to handle preflight requests better - should be at the top
app.use((req, res, next) => {
  // Always set basic CORS headers for all responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  // Handle OPTIONS method specially and immediately
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] Handling OPTIONS request for: ${req.url}`);
    return res.status(200).end();
  }

  next();
});

// Update CORS configuration to handle specific origins
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// Add static file serving capability to serve the status page
app.use(express.static('public'));

// Add the param function to the request object for the API Gateway
app.use((req, res, next) => {
  req.param = function (name) {
    if (this.params && this.params[name] !== undefined) return this.params[name];
    if (this.body && this.body[name] !== undefined) return this.body[name];
    if (this.query && this.query[name] !== undefined) return this.query[name];
    return undefined;
  };
  next();
});

// Cấu hình các service
const services = {
  products: process.env.PRODUCTS_SERVICE_URL || "http://localhost:4004",
  inventory: process.env.INVENTORY_SERVICE_URL || "http://localhost:4000",
  cart: process.env.CART_SERVICE_URL || "http://localhost:4005",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4001",
  orders: process.env.ORDERS_SERVICE_URL || "http://localhost:4009",
  payment: process.env.PAYMENT_SERVICE_URL || "http://localhost:4545",
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4006"
};

// Extract hostname and port from AUTH_SERVICE_URL
const authServiceUrl = new URL(process.env.AUTH_SERVICE_URL || "http://localhost:4006");
const authServiceHostname = authServiceUrl.hostname;
const authServicePort = authServiceUrl.port;

// Replace the existing auth proxy with a more reliable version
app.use('/api/auth', (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Auth request: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);

  const http = require('http');

  let bodyData = '';
  if (req.method === 'POST' || req.method === 'PUT') {
    bodyData = JSON.stringify(req.body);
  }

  const options = {
    hostname: authServiceHostname,
    port: authServicePort,
    path: req.url.replace('/api/auth', ''),
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyData)
    }
  };

  // Copy Authorization header - this is critical for token-based auth
  if (req.headers.authorization) {
    console.log('Forwarding Authorization header:', req.headers.authorization);
    options.headers['Authorization'] = req.headers.authorization;
  } else {
    console.log('No Authorization header found in request');
  }

  console.log(`Forwarding to auth service: ${options.method} ${options.path}`);

  const authReq = http.request(options, (authRes) => {
    Object.keys(authRes.headers).forEach(key => {
      res.setHeader(key, authRes.headers[key]);
    });

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(authRes.statusCode);

    let data = '';
    authRes.on('data', (chunk) => {
      data += chunk;
      res.write(chunk);
    });

    authRes.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`Auth request completed in ${duration}ms with status ${authRes.statusCode}`);
      res.end();
    });
  });

  authReq.on('error', (error) => {
    console.error(`Auth service error: ${error.message}`);
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
      hostname: authServiceHostname,
      port: authServicePort,
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
      hostname: authServiceHostname,
      port: authServicePort,
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

// Create a dedicated OPTIONS handler specifically for update endpoints 
app.options('/update', (req, res) => {
  console.log('[CORS] Special handling for update OPTIONS request');
  // Explicit CORS headers for update endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

app.options('/api/auth/update', (req, res) => {
  console.log('[CORS] Special handling for api/auth/update OPTIONS request');
  // Explicit CORS headers for update endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Simple direct PUT handler for /update that doesn't rely on promises or async features
app.put('/update', (req, res) => {
  // Set CORS headers immediately
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log(`[${new Date().toISOString()}] Direct update request received`);

  const http = require('http');

  // Get the token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header required' });
  }

  let token;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = authHeader;
  }

  if (!token) {
    return res.status(401).json({ message: 'Bearer token is missing' });
  }

  // Prepare the request to auth service
  const bodyData = JSON.stringify(req.body);

  const options = {
    hostname: authServiceHostname,
    port: authServicePort,
    path: '/update',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(bodyData)
    }
  };

  const authReq = http.request(options, (authRes) => {
    let responseData = '';

    authRes.on('data', (chunk) => {
      responseData += chunk;
    });

    authRes.on('end', () => {
      // Always set CORS headers in response
      res.header('Access-Control-Allow-Origin', '*');

      if (authRes.statusCode >= 400) {
        // For error responses
        try {
          const jsonResponse = JSON.parse(responseData);
          res.status(authRes.statusCode).json(jsonResponse);
        } catch (e) {
          res.status(authRes.statusCode).send(responseData);
        }
      } else {
        // For successful responses
        try {
          const jsonResponse = JSON.parse(responseData);
          res.status(authRes.statusCode).json(jsonResponse);
        } catch (e) {
          res.status(500).json({
            message: 'Error parsing response from auth service'
          });
        }
      }
    });
  });

  authReq.on('error', (error) => {
    console.error('Auth service error:', error.message);
    res.status(502).json({
      message: `Failed to connect to auth service: ${error.message}`
    });
  });

  // Set timeout
  authReq.setTimeout(10000, () => {
    authReq.destroy();
    res.status(504).json({
      message: 'Request to auth service timed out'
    });
  });

  // Send the request
  authReq.write(bodyData);
  authReq.end();
});

// Modify the existing update handler to improve CORS handling
app.put(['/api/auth/update', '/auth/update', '/update'], async (req, res) => {
  // Set CORS headers immediately, before any async operations
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Profile update request received`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  try {
    // Extract auth token - handle different authorization header formats
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: true,
        message: 'Authorization header missing'
      });
    }

    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader; // Try using the header value directly as fallback
    }

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Bearer token required'
      });
    }

    const http = require('http');

    // Convert request body to JSON string
    const bodyData = JSON.stringify(req.body);

    const options = {
      hostname: authServiceHostname,
      port: authServicePort,
      path: '/update',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(bodyData),
        'Accept': 'application/json'
      }
    };

    console.log(`Forwarding to auth service: ${options.method} ${options.path}`);

    // Use a Promise to handle the HTTP request for better error handling
    const authServiceRequest = () => {
      return new Promise((resolve, reject) => {
        const authReq = http.request(options, (authRes) => {
          let responseData = '';

          authRes.on('data', (chunk) => {
            responseData += chunk;
          });

          authRes.on('end', () => {
            const duration = Date.now() - startTime;
            console.log(`Auth request completed in ${duration}ms with status ${authRes.statusCode}`);

            try {
              // Always set CORS headers again to ensure they're included in the response
              res.header('Access-Control-Allow-Origin', '*');

              if (authRes.statusCode >= 400) {
                console.warn(`Auth service returned error status: ${authRes.statusCode}`);
                let errorResponse;
                try {
                  errorResponse = JSON.parse(responseData);
                } catch (parseError) {
                  errorResponse = { message: responseData || 'Unknown error' };
                }
                reject({ status: authRes.statusCode, data: errorResponse });
              } else {
                resolve({ status: authRes.statusCode, data: JSON.parse(responseData) });
              }
            } catch (error) {
              reject({ status: 500, data: { message: `Failed to process response: ${error.message}` } });
            }
          });
        });

        authReq.on('error', (error) => {
          console.error('Auth service request error:', error.message);
          reject({ status: 502, data: { error: true, message: `Auth service error: ${error.message}` } });
        });

        authReq.setTimeout(10000, () => {
          authReq.destroy();
          reject({ status: 504, data: { error: true, message: 'Auth service request timed out' } });
        });

        if (bodyData) {
          authReq.write(bodyData);
        }
        authReq.end();
      });
    };

    try {
      const { status, data } = await authServiceRequest();
      return res.status(status).json(data);
    } catch (serviceError) {
      return res.status(serviceError.status).json(serviceError.data);
    }
  } catch (error) {
    console.error('Profile update error:', error);
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

// Add a route that serves the status page
app.get('/status', (req, res) => {
  res.sendFile(__dirname + '/public/server-status.html');
});

// Add a special endpoint to expose service URLs safely for the status page
app.get('/status-config', (req, res) => {
  res.json({
    services: [
      {
        name: "API Gateway",
        url: `${req.protocol}://${req.get('host')}/api-status`,
        description: "Main entry point for all client requests"
      },
      {
        name: "Product Catalog Service",
        url: `${services.products}/health`,
        description: "Manages product information and catalog"
      },
      {
        name: "Auth Service",
        url: `${services.auth}/health`,
        description: "Handles authentication and user management"
      },
      {
        name: "Cart Service",
        url: `${services.cart}/health`,
        description: "Manages shopping cart functionality"
      },
      {
        name: "Order Service",
        url: `${services.orders}/health`,
        description: "Processes and manages orders"
      },
      {
        name: "Inventory Service",
        url: `${services.inventory}/health`,
        description: "Tracks product inventory and availability"
      },
      {
        name: "Notification Service",
        url: `${services.notification}/health`,
        description: "Sends notifications to users"
      },
      {
        name: "Payment Service",
        url: `${services.payment}/health`,
        description: "Handles payment processing"
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

// Update user management handlers to correctly format and forward requests
app.all('/api/auth/users*', (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] User management request: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);

  const http = require('http');

  let bodyData = '';
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    bodyData = JSON.stringify(req.body);
    console.log('Request body:', bodyData);
  }

  // Extract path from the original URL to forward to auth service
  const apiPath = req.originalUrl.replace('/api/auth', '');

  const options = {
    hostname: 'localhost', // Changed from authServiceHostname to force localhost
    port: authServicePort,
    path: apiPath,  // Forward to the exact path on auth service
    method: req.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (bodyData) {
    options.headers['Content-Length'] = Buffer.byteLength(bodyData);
  }

  // Copy Authorization header - this is critical for admin authentication
  if (req.headers.authorization) {
    console.log('Forwarding Authorization header:', req.headers.authorization);
    options.headers['Authorization'] = req.headers.authorization;
  }

  console.log(`Forwarding to auth service: ${options.method} ${options.hostname}:${options.port}${options.path}`);

  const authReq = http.request(options, (authRes) => {
    // Copy all response headers from auth service
    Object.keys(authRes.headers).forEach(key => {
      res.setHeader(key, authRes.headers[key]);
    });

    // Ensure CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Set status code
    res.status(authRes.statusCode);

    let responseData = '';
    authRes.on('data', (chunk) => {
      responseData += chunk;
      res.write(chunk);
    });

    // Send response when complete
    authRes.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`User management request completed in ${duration}ms with status ${authRes.statusCode}`);
      if (responseData.length < 1000) {
        console.log('Response data:', responseData);
      } else {
        console.log('Response data: (large response, first 200 chars)', responseData.substring(0, 200) + '...');
      }
      res.end();
    });
  });

  authReq.on('error', (error) => {
    console.error(`Auth service error: ${error.message}`);
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

// Create a direct proxy for auth/users endpoint that bypasses other middleware
app.use('/api/auth/users', (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] User API request: ${req.method} ${req.originalUrl}`);

  const http = require('http');
  const authServicePort = process.env.AUTH_SERVICE_PORT || 4006;

  let bodyData = '';
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    bodyData = JSON.stringify(req.body);
  }

  // Extract the path to be forwarded
  const forwardPath = req.url;
  console.log(`Original URL: ${req.originalUrl}, Forwarding path: ${forwardPath}`);

  const options = {
    hostname: 'localhost', // Using localhost to ensure direct connectivity
    port: authServicePort,
    path: forwardPath,
    method: req.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (bodyData) {
    options.headers['Content-Length'] = Buffer.byteLength(bodyData);
  }

  // Forward the authorization header if present
  if (req.headers.authorization) {
    options.headers['Authorization'] = req.headers.authorization;
  }

  console.log(`Forwarding to auth service: ${options.method} http://${options.hostname}:${options.port}${options.path}`);

  const authReq = http.request(options, (authRes) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.status(authRes.statusCode);

    authRes.on('data', (chunk) => {
      res.write(chunk);
    });

    authRes.on('end', () => {
      const duration = Date.now() - startTime;
      console.log(`User API request completed in ${duration}ms with status ${authRes.statusCode}`);
      res.end();
    });
  });

  authReq.on('error', (error) => {
    console.error(`Auth service error: ${error.message}`);
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
