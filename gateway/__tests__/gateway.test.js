const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock http-proxy-middleware so it doesn't make real network calls
jest.mock('http-proxy-middleware', () => {
  return {
    createProxyMiddleware: jest.fn().mockImplementation((options) => {
      return (req, res, next) => {
        const mockHeaders = {};
        const mockProxyReq = {
          setHeader: (name, value) => {
            mockHeaders[name] = value;
          }
        };

        // Call the proxyReq event handler to populate mockHeaders
        if (options.on && typeof options.on.proxyReq === 'function') {
          options.on.proxyReq(mockProxyReq, req, res);
        }

        res.status(200).json({
          mockProxied: true,
          target: options.target,
          headers: {
            'x-user-id': mockHeaders['x-user-id'] || null,
            'x-user-role': mockHeaders['x-user-role'] || null
          }
        });
      };
    })
  };
});

const app = require('../server');

describe('API Gateway Server', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_987654321';

  describe('GET /health', () => {
    it('should return gateway status directly', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('Gateway is running');
    });
  });

  describe('Protected Routes & JWT Authentication Middleware', () => {
    it('should block protected routes with 401 if Authorization header is missing', async () => {
      const response = await request(app).get('/api/cart');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });

    it('should block protected routes with 401 if Authorization header format is invalid', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', 'InvalidTokenStructure');
      expect(response.statusCode).toBe(401);
    });

    it('should allow access and forward x-user-id and x-user-role headers if a valid JWT is provided', async () => {
      const mockToken = jwt.sign({ id: 'user_123', role: 'customer' }, JWT_SECRET);

      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.mockProxied).toBe(true);
      expect(response.body.headers).toEqual({
        'x-user-id': 'user_123',
        'x-user-role': 'customer'
      });
    });
  });

  describe('Admin Authorization Middleware', () => {
    it('should block admin routes if user is not an admin', async () => {
      const mockToken = jwt.sign({ id: 'user_123', role: 'customer' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ name: 'ApexPro Keyboard' });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('Admin role required');
    });

    it('should allow admin routes if user is admin', async () => {
      const mockToken = jwt.sign({ id: 'admin_456', role: 'admin' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ name: 'ApexPro Keyboard' });

      expect(response.statusCode).toBe(200);
      expect(response.body.mockProxied).toBe(true);
      expect(response.body.headers['x-user-role']).toBe('admin');
    });
  });
});
