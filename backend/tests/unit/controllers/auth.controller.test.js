// Import AuthError from the actual service BEFORE mocking
const { AuthError: RealAuthError } = require('../../../src/services/auth.service');

// Mock dependencies - must be before importing controller
jest.mock('../../../src/services/auth.service', () => {
  const actualService = jest.requireActual('../../../src/services/auth.service');
  return {
    ...actualService,
    signup: jest.fn(),
    signin: jest.fn(),
    getMeFromToken: jest.fn(),
    AuthError: actualService.AuthError, // Keep the real AuthError class
  };
});

const {
  signupController,
  signinController,
  meController,
} = require('../../../src/controllers/auth.controller');

// Get the mocked service
const authService = require('../../../src/services/auth.service');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('signupController', () => {
    it('should return 201 with token and user on successful signup', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
      };
      const mockResult = {
        token: 'jwt-token-here',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
      };
      authService.signup.mockResolvedValue(mockResult);

      // Act
      await signupController(req, res);

      // Assert
      expect(authService.signup).toHaveBeenCalledWith({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when AuthError with status 400 is thrown', async () => {
      // Arrange
      req.body = { email: 'test@example.com' }; // Missing required fields
      const error = new RealAuthError(400, 'Missing fields');
      authService.signup.mockRejectedValue(error);

      // Act
      await signupController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing fields' });
    });

    it('should return 409 when email already exists', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };
      const error = new authService.AuthError(409, 'Email already in use');
      authService.signup.mockRejectedValue(error);

      // Act
      await signupController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already in use' });
    });

    it('should return 500 when non-AuthError is thrown', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      authService.signup.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await signupController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });

    it('should handle empty body gracefully', async () => {
      // Arrange
      req.body = null;
      const error = new RealAuthError(400, 'Missing fields');
      authService.signup.mockRejectedValue(error);

      // Act
      await signupController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('signinController', () => {
    it('should return 200 with token and user on successful signin', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResult = {
        token: 'jwt-token-here',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
      };
      authService.signin.mockResolvedValue(mockResult);

      // Act
      await signinController(req, res);

      // Assert
      expect(authService.signin).toHaveBeenCalledWith({
        email: req.body.email,
        password: req.body.password,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 401 when credentials are invalid', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const error = new authService.AuthError(401, 'Invalid credentials');
      authService.signin.mockRejectedValue(error);

      // Act
      await signinController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 500 when non-AuthError is thrown', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };
      authService.signin.mockRejectedValue(new Error('Database error'));

      // Act
      await signinController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('meController', () => {
    it('should return user info when valid token is provided', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-jwt-token';
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
      };
      authService.getMeFromToken.mockResolvedValue(mockUser);

      // Act
      await meController(req, res);

      // Assert
      expect(authService.getMeFromToken).toHaveBeenCalledWith('valid-jwt-token');
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 401 when Authorization header is missing', async () => {
      // Arrange
      req.headers.authorization = '';

      // Act
      await meController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing token' });
      expect(authService.getMeFromToken).not.toHaveBeenCalled();
    });

    it('should return 401 when token format is invalid', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat token';

      // Act
      await meController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing token' });
    });

    it('should return 401 when token is missing in header', async () => {
      // Arrange
      req.headers.authorization = 'Bearer';

      // Act
      await meController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing token' });
    });

    it('should return 401 when AuthError with status 401 is thrown', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid-token';
      const error = new authService.AuthError(401, 'Invalid token');
      authService.getMeFromToken.mockRejectedValue(error);

      // Act
      await meController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';
      const error = new authService.AuthError(404, 'Not found');
      authService.getMeFromToken.mockRejectedValue(error);

      // Act
      await meController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });

    it('should return 500 when non-AuthError is thrown', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid-token';
      authService.getMeFromToken.mockRejectedValue(new Error('Database error'));

      // Act
      await meController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});

