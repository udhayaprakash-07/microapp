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
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Mock Models
jest.mock('../models/Cart', () => {
  const mockModel = jest.fn().mockImplementation(function(data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    return this;
  });
  mockModel.findOne = jest.fn();
  return mockModel;
});

jest.mock('../models/Order', () => {
  const mockModel = jest.fn().mockImplementation(function(data) {
    Object.assign(this, data);
    this._id = 'order_id_789';
    this.save = jest.fn().mockResolvedValue(this);
    return this;
  });
  mockModel.find = jest.fn();
  return mockModel;
});

describe('Order Service API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserId = 'user_abc';
  const mockCartItem = {
    productId: 'prod1',
    name: 'ApexPro Keyboard',
    price: 189.99,
    quantity: 1,
    image: 'img_url'
  };

  describe('GET /cart', () => {
    it('should fetch user cart, creating it if it does not exist', async () => {
      Cart.findOne.mockResolvedValue(null); // Cart does not exist yet

      const response = await request(app)
        .get('/cart')
        .set('x-user-id', mockUserId);

      expect(response.statusCode).toBe(200);
      expect(response.body.userId).toBe(mockUserId);
      expect(response.body.items).toEqual([]);
      expect(Cart.findOne).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('should return existing cart if it exists in the database', async () => {
      const mockCart = { userId: mockUserId, items: [mockCartItem] };
      Cart.findOne.mockResolvedValue(mockCart);

      const response = await request(app)
        .get('/cart')
        .set('x-user-id', mockUserId);

      expect(response.statusCode).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('ApexPro Keyboard');
    });

    it('should return 401 if x-user-id header is missing', async () => {
      const response = await request(app).get('/cart');
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /cart', () => {
    it('should add a new item to the cart', async () => {
      const mockCart = {
        userId: mockUserId,
        items: [],
        save: jest.fn().mockResolvedValue(true)
      };
      Cart.findOne.mockResolvedValue(mockCart);

      const response = await request(app)
        .post('/cart')
        .set('x-user-id', mockUserId)
        .send(mockCartItem);

      expect(response.statusCode).toBe(200);
      expect(mockCart.items).toHaveLength(1);
      expect(mockCart.items[0].productId).toBe('prod1');
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should update quantity if the item is already in the cart', async () => {
      const mockCart = {
        userId: mockUserId,
        items: [{ ...mockCartItem, quantity: 1 }],
        save: jest.fn().mockResolvedValue(true)
      };
      Cart.findOne.mockResolvedValue(mockCart);

      const response = await request(app)
        .post('/cart')
        .set('x-user-id', mockUserId)
        .send({ ...mockCartItem, quantity: 3 }); // Update qty to 3

      expect(response.statusCode).toBe(200);
      expect(mockCart.items).toHaveLength(1);
      expect(mockCart.items[0].quantity).toBe(3);
      expect(mockCart.save).toHaveBeenCalled();
    });
  });

  describe('DELETE /cart/:productId', () => {
    it('should remove item from the cart', async () => {
      const mockCart = {
        userId: mockUserId,
        items: [mockCartItem],
        save: jest.fn().mockResolvedValue(true)
      };
      Cart.findOne.mockResolvedValue(mockCart);

      const response = await request(app)
        .delete('/cart/prod1')
        .set('x-user-id', mockUserId);

      expect(response.statusCode).toBe(200);
      expect(mockCart.items).toHaveLength(0);
      expect(mockCart.save).toHaveBeenCalled();
    });
  });

  describe('POST /orders (Checkout)', () => {
    const mockShippingAddress = {
      address: '123 Main St',
      city: 'Boston',
      postalCode: '02108',
      country: 'USA'
    };

    it('should create a paid order and clear the cart', async () => {
      const mockCart = {
        userId: mockUserId,
        items: [mockCartItem],
        save: jest.fn().mockResolvedValue(true)
      };
      Cart.findOne.mockResolvedValue(mockCart);

      const response = await request(app)
        .post('/orders')
        .set('x-user-id', mockUserId)
        .send({ shippingAddress: mockShippingAddress });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('_id', 'order_id_789');
      expect(response.body.totalPrice).toBe(189.99);
      expect(response.body.status).toBe('Paid');
      expect(mockCart.items).toHaveLength(0); // Cart is cleared
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should return 400 if checkout is attempted with an empty cart', async () => {
      const mockCart = {
        userId: mockUserId,
        items: []
      };
      Cart.findOne.mockResolvedValue(mockCart);

      const response = await request(app)
        .post('/orders')
        .set('x-user-id', mockUserId)
        .send({ shippingAddress: mockShippingAddress });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('cart is empty');
    });
  });

  describe('GET /orders (Order History)', () => {
    it('should return user order history', async () => {
      const mockOrdersList = [
        { _id: 'order1', userId: mockUserId, totalPrice: 189.99, status: 'Paid' }
      ];

      // Mock chainable Order.find().sort()
      const sortMock = jest.fn().mockResolvedValue(mockOrdersList);
      Order.find.mockReturnValue({
        sort: sortMock
      });

      const response = await request(app)
        .get('/orders')
        .set('x-user-id', mockUserId);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].totalPrice).toBe(189.99);
      expect(Order.find).toHaveBeenCalledWith({ userId: mockUserId });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
