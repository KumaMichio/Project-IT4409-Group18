const { authRequired } = require('../../../src/middlewares/auth.middleware');
const { verifyToken } = require('../../../src/utils/jwt');
const AppError = require('../../../src/utils/AppError');

// Mock dependencies
jest.mock('../../../src/utils/jwt');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() when valid token is provided', () => {
    // Arrange
    req.headers.authorization = 'Bearer valid-token';
    verifyToken.mockReturnValue({
      userId: 'user-123',
      role: 'student',
    });

    // Act
    authRequired(req, res, next);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(req.user).toMatchObject({
      id: 'user-123',
      role: 'student',
    });
    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call next with AppError when token is missing', () => {
    // Arrange
    req.headers.authorization = '';

    // Act
    authRequired(req, res, next);

    // Assert
    expect(verifyToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Yêu cầu đăng nhập');
  });

  it('should call next with AppError when Authorization header is missing', () => {
    // Arrange
    delete req.headers.authorization;

    // Act
    authRequired(req, res, next);

    // Assert
    expect(verifyToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should call next with AppError when token format is invalid', () => {
    // Arrange
    req.headers.authorization = 'InvalidFormat token';

    // Act
    authRequired(req, res, next);

    // Assert
    expect(verifyToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should call next with AppError when scheme is not Bearer', () => {
    // Arrange
    req.headers.authorization = 'Basic token-here';

    // Act
    authRequired(req, res, next);

    // Assert
    expect(verifyToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('should call next with AppError when token verification fails', () => {
    // Arrange
    req.headers.authorization = 'Bearer invalid-token';
    verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Act
    authRequired(req, res, next);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith('invalid-token');
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Token không hợp lệ hoặc đã hết hạn');
  });

  it('should handle case-insensitive Bearer scheme', () => {
    // Arrange
    req.headers.authorization = 'bearer valid-token';
    verifyToken.mockReturnValue({
      userId: 'user-123',
      role: 'student',
    });

    // Act
    authRequired(req, res, next);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(next).toHaveBeenCalledWith();
  });
});


