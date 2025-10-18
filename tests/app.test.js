const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iqembulamanzi_test';
    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    // Clean up test database
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /', () => {
    test('should serve user form page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.text).toContain('Register User');
    });
  });

  describe('POST /submit', () => {
    test('should create a new user', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+27123456789',
        password: 'password123',
        role: 'Guardian',
        address: '123 Test St',
        lat: -26.2041,
        lng: 28.0473
      };

      const response = await request(app)
        .post('/submit')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Welcome, John!');
    });

    test('should reject invalid email', async () => {
      const userData = {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'invalid-email',
        phone: '+27123456789',
        password: 'password123',
        role: 'Guardian',
        address: '123 Test St',
        lat: -26.2041,
        lng: 28.0473
      };

      const response = await request(app)
        .post('/submit')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email must be a valid format');
    });
  });

  describe('POST /login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('john@example.com');
    });

    test('should reject invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('Security Tests', () => {
    test('should have security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    test('should rate limit requests', async () => {
      const promises = [];
      for (let i = 0; i < 105; i++) {
        promises.push(request(app).get('/'));
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
