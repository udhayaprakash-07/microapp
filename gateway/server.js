const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_987654321';

// Service URLs (configured via env variables for DevOps flexibility)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';

app.use(cors());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Gateway is running' });
});

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains { id, role }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};

// Admin Verification Middleware
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
  });
};

// Proxy Request Handler to inject headers
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      // If user is authenticated, pass user details as headers to downstream microservices
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id);
        proxyReq.setHeader('x-user-role', req.user.role);
      }
    }
  }
});

// --- ROUTES ---

// 1. User Service Routes
// Auth profile is protected
app.use('/api/auth/me', verifyToken, createProxyMiddleware({
  ...proxyOptions(USER_SERVICE_URL),
  pathRewrite: { '^/api/auth': '' }
}));
// Login & Register are public
app.use('/api/auth', createProxyMiddleware({
  ...proxyOptions(USER_SERVICE_URL),
  pathRewrite: { '^/api/auth': '' }
}));

// 2. Product Service Routes
// Admin actions (write/delete) are protected
app.post('/api/products', verifyAdmin, createProxyMiddleware({
  ...proxyOptions(PRODUCT_SERVICE_URL),
  pathRewrite: { '^/api': '' }
}));
app.put('/api/products/*', verifyAdmin, createProxyMiddleware({
  ...proxyOptions(PRODUCT_SERVICE_URL),
  pathRewrite: { '^/api': '' }
}));
app.delete('/api/products/*', verifyAdmin, createProxyMiddleware({
  ...proxyOptions(PRODUCT_SERVICE_URL),
  pathRewrite: { '^/api': '' }
}));
// Public catalog endpoints (GET)
app.use('/api/products', createProxyMiddleware({
  ...proxyOptions(PRODUCT_SERVICE_URL),
  pathRewrite: { '^/api': '' }
}));

// 3. Order Service Routes (All Cart & Order endpoints are protected)
app.use('/api/cart', verifyToken, createProxyMiddleware({
  ...proxyOptions(ORDER_SERVICE_URL),
  pathRewrite: { '^/api': '' }
}));
app.use('/api/orders', verifyToken, createProxyMiddleware({
  ...proxyOptions(ORDER_SERVICE_URL),
  pathRewrite: { '^/api': '' }
}));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Gateway] API Gateway running on port ${PORT}`);
    console.log(`[Gateway] User Service: ${USER_SERVICE_URL}`);
    console.log(`[Gateway] Product Service: ${PRODUCT_SERVICE_URL}`);
    console.log(`[Gateway] Order Service: ${ORDER_SERVICE_URL}`);
  });
}

module.exports = app;
