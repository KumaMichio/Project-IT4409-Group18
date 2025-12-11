const request = require('supertest');
const app = require('../../src/app');
const {
  findUserByEmail,
  addUser,
  getUsers,
} = require('../../src/repositories/user.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../src/repositories/user.repository');
jest.mock('bcryptjs');

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret-key';
  });

  describe('POST /auth/signup', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
      };
      findUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      addUser.mockResolvedValue({
        id: 'user-123',
        ...userData,
        passwordHash: 'hashed_password',
      });

      // Act
      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 400 when required fields are missing', async () => {
      // Act
      const response = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 when email already exists', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };
      findUserByEmail.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
      });

      // Act
      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already in use');
    });

    it('should return 400 when role is invalid', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid_role',
      };
      findUserByEmail.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid role');
    });
  });

  describe('POST /auth/signin', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: 'student',
      };
      findUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post('/auth/signin')
        .send(credentials);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should return 401 when email does not exist', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      findUserByEmail.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/auth/signin')
        .send(credentials);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 when password is incorrect', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };
      findUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/auth/signin')
        .send(credentials);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 when email or password is missing', async () => {
      // Act
      const response = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user info with valid token', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
      };
      const token = jwt.sign(
        {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          name: mockUser.name,
        },
        process.env.JWT_SECRET
      );
      getUsers.mockResolvedValue([mockUser]);

      // Act
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject(mockUser);
    });

    it('should return 401 when token is missing', async () => {
      // Act
      const response = await request(app)
        .get('/auth/me');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Missing token');
    });

    it('should return 401 when token format is invalid', async () => {
      // Act
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'InvalidFormat token');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Missing token');
    });

    it('should return 401 when token is invalid', async () => {
      // Act
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token-here');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      const token = jwt.sign(
        { id: 'non-existent-id', email: 'test@example.com', role: 'student', name: 'Test' },
        process.env.JWT_SECRET
      );
      getUsers.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
    });
  });

  describe('GET /', () => {
    it('should return health check status', async () => {
      // Act
      const response = await request(app)
        .get('/');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});


