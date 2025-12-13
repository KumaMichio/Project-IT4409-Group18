const { errorHandler } = require('../../../src/middlewares/error.middleware');
const AppError = require('../../../src/utils/AppError');

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should handle AppError correctly', () => {
    // Arrange
    const error = new AppError(404, 'Not found', 'NOT_FOUND');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Not found',
      code: 'NOT_FOUND',
    });
  });

  it('should handle AppError with different status codes', () => {
    // Arrange
    const error = new AppError(401, 'Unauthorized', 'UNAUTHORIZED');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  });

  it('should handle generic errors with 500 status', () => {
    // Arrange
    const error = new Error('Database connection failed');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
    expect(console.error).toHaveBeenCalledWith('[UNHANDLED ERROR]', error);
  });

  it('should handle errors without message', () => {
    // Arrange
    const error = new Error();

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  });
});


