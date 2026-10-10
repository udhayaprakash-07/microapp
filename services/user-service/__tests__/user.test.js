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
const User = require('../models/User');

// Mock User Model
jest.mock('../models/User', () => {
  const mockModel = jest.fn().mockImplementation(function(data) {
    Object.assign(this, data);
    this._id = 'mocked_user_id_123';
    this.save = jest.fn().mockResolvedValue(this);
    return this;
  });
  mockModel.findOne = jest.fn();
  mockModel.findById = jest.fn();
  return mockModel;
});

describe('User Service API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      // Mock findOne to return null (meaning user does not exist)
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'customer'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual({
        id: 'mocked_user_id_123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should fail registration if the user already exists', async () => {
      // Mock findOne to return an existing user
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const response = await request(app)
        .post('/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('User already exists');
    });
  });

  describe('POST /login', () => {
    it('should authenticate user and return token successfully', async () => {
      const mockUser = {
        _id: 'mocked_user_id_123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.name).toBe('Test User');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
    });

    it('should fail login if the credentials are invalid', async () => {
      User.findOne.mockResolvedValue(null); // User not found

      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /me', () => {
    it('should return user profile if correct user ID header is supplied', async () => {
      const mockUser = {
        _id: 'mocked_user_id_123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      };

      // Mock chainable findById().select()
      const selectMock = jest.fn().mockResolvedValue(mockUser);
      User.findById.mockReturnValue({
        select: selectMock
      });

      const response = await request(app)
        .get('/me')
        .set('x-user-id', 'mocked_user_id_123');

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(User.findById).toHaveBeenCalledWith('mocked_user_id_123');
      expect(selectMock).toHaveBeenCalledWith('-password');
    });

    it('should fail profile retrieval if x-user-id header is absent', async () => {
      const response = await request(app).get('/me');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toContain('verification failed');
    });
  });
});
