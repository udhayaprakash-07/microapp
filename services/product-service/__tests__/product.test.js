const request = require('supertest');
const mongoose = require('mongoose');

// Mock mongoose connect before requiring server
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true)
  };
});

const app = require('../server');
const Product = require('../models/Product');

// Mock Product Model
jest.mock('../models/Product', () => {
  const mockModel = jest.fn().mockImplementation(function(data) {
    Object.assign(this, data);
    this._id = 'new_prod_id';
    this.save = jest.fn().mockResolvedValue(this);
    return this;
  });
  mockModel.find = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.findByIdAndDelete = jest.fn();
  return mockModel;
});

describe('Product Service API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProductsList = [
    { _id: 'prod1', name: 'Keyboard', price: 99.99, category: 'Keyboards', countInStock: 10 },
    { _id: 'prod2', name: 'Mouse', price: 49.99, category: 'Accessories', countInStock: 5 }
  ];

  describe('GET /products', () => {
    it('should fetch all products successfully', async () => {
      Product.find.mockResolvedValue(mockProductsList);

      const response = await request(app).get('/products');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Keyboard');
      expect(Product.find).toHaveBeenCalledWith({});
    });

    it('should query products by category and search filter', async () => {
      Product.find.mockResolvedValue([mockProductsList[0]]);

      const response = await request(app)
        .get('/products?category=Keyboards&search=key');

      expect(response.statusCode).toBe(200);
      expect(Product.find).toHaveBeenCalledWith({
        category: 'Keyboards',
        name: { $regex: 'key', $options: 'i' }
      });
    });
  });

  describe('GET /products/:id', () => {
    it('should fetch product details by ID', async () => {
      Product.findById.mockResolvedValue(mockProductsList[0]);

      const response = await request(app).get('/products/prod1');

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('Keyboard');
      expect(Product.findById).toHaveBeenCalledWith('prod1');
    });

    it('should return 404 if product does not exist', async () => {
      Product.findById.mockResolvedValue(null);

      const response = await request(app).get('/products/invalid_id');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toContain('Product not found');
    });
  });

  describe('POST /products', () => {
    it('should create product successfully if role is admin', async () => {

      const response = await request(app)
        .post('/products')
        .set('x-user-role', 'admin')
        .send({
          name: 'Monitor',
          description: '4K UltraHD Monitor',
          price: 399.99,
          category: 'Monitors',
          image: 'image_url',
          countInStock: 5
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('_id', 'new_prod_id');
      expect(response.body.name).toBe('Monitor');
    });

    it('should deny product creation if role is customer', async () => {
      const response = await request(app)
        .post('/products')
        .set('x-user-role', 'customer')
        .send({
          name: 'Monitor',
          price: 399.99
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toContain('Access denied. Admin authorization required');
    });
  });

  describe('PUT /products/:id', () => {
    it('should update product successfully if role is admin', async () => {
      const mockProduct = {
        _id: 'prod1',
        name: 'Keyboard',
        price: 99.99,
        save: jest.fn().mockResolvedValue(true)
      };
      Product.findById.mockResolvedValue(mockProduct);

      const response = await request(app)
        .put('/products/prod1')
        .set('x-user-role', 'admin')
        .send({
          price: 109.99
        });

      expect(response.statusCode).toBe(200);
      expect(mockProduct.price).toBe(109.99);
      expect(mockProduct.save).toHaveBeenCalled();
    });

    it('should deny product update if role is customer', async () => {
      const response = await request(app)
        .put('/products/prod1')
        .set('x-user-role', 'customer')
        .send({
          price: 109.99
        });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product successfully if role is admin', async () => {
      Product.findByIdAndDelete.mockResolvedValue({ _id: 'prod1' });

      const response = await request(app)
        .delete('/products/prod1')
        .set('x-user-role', 'admin');

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith('prod1');
    });

    it('should deny product deletion if role is customer', async () => {
      const response = await request(app)
        .delete('/products/prod1')
        .set('x-user-role', 'customer');

      expect(response.statusCode).toBe(403);
    });
  });
});
