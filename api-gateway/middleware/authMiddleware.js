// api-gateway/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to authenticate token
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        if(req.path === '/auth/login' || req.path === '/auth/register') {
            return next();
        }
        console.log("No token found")
        return res.sendStatus(401);  // No token
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) {
            console.log("Invalid token",err)
            return res.sendStatus(403);  // Invalid token
        }
        req.user = user;  // Attach user payload to request
        next();
    });
};

// Middleware to authorize role
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.sendStatus(403);  // Not authorized
        }
        next();
    };
};

