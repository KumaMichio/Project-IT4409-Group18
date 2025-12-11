const { signToken, verifyToken } = require('../../../src/utils/jwt');
const jwt = require('jsonwebtoken');

describe('JWT Utils', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      // Arrange
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
      };

      // Act
      const token = signToken(payload);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toMatchObject({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
    });

    it('should create token with 7 days expiration', () => {
      // Arrange
      const payload = { id: 'user-123' };
      const now = Math.floor(Date.now() / 1000);

      // Act
      const token = signToken(payload);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Assert
      const expectedExp = now + 7 * 24 * 60 * 60; // 7 days in seconds
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 60); // Allow 60s tolerance
    });

    it('should use default secret when JWT_SECRET is not set', () => {
      // Arrange
      delete process.env.JWT_SECRET;
      const payload = { id: 'user-123' };

      // Act
      const token = signToken(payload);

      // Assert
      const decoded = jwt.verify(token, 'dev-secret');
      expect(decoded.id).toBe(payload.id);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      // Arrange
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Act
      const decoded = verifyToken(token);

      // Assert
      expect(decoded).toMatchObject({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
    });

    it('should throw error when token is invalid', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act & Assert
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error when token is expired', () => {
      // Arrange
      const expiredToken = jwt.sign(
        { id: 'user-123' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      // Act & Assert
      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it('should throw error when token signature is invalid', () => {
      // Arrange
      const token = jwt.sign({ id: 'user-123' }, 'wrong-secret');

      // Act & Assert
      expect(() => verifyToken(token)).toThrow();
    });

    it('should use default secret when JWT_SECRET is not set', () => {
      // Arrange
      delete process.env.JWT_SECRET;
      const token = jwt.sign({ id: 'user-123' }, 'dev-secret', { expiresIn: '7d' });

      // Act
      const decoded = verifyToken(token);

      // Assert
      expect(decoded.id).toBe('user-123');
    });
  });
});


