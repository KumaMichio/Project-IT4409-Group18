const { hashPassword, comparePassword } = require('../../../src/utils/password');
const bcrypt = require('bcryptjs');

// Mock bcryptjs
jest.mock('bcryptjs');

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = 'hashed_password_here';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Act
      const result = await hashPassword(plainPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should handle different password inputs', async () => {
      // Arrange
      const passwords = ['password1', 'password2', 'very-long-password-123'];
      bcrypt.hash.mockImplementation((plain) => Promise.resolve(`hash_${plain}`));

      // Act & Assert
      for (const password of passwords) {
        const result = await hashPassword(password);
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(result).toBe(`hash_${password}`);
      }
    });
  });

  describe('comparePassword', () => {
    it('should return true when password matches hash', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = 'hashed_password_here';
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      // Arrange
      const plainPassword = 'wrongpassword';
      const hashedPassword = 'hashed_password_here';
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      // Arrange
      const plainPassword = '';
      const hashedPassword = 'hashed_password_here';
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(result).toBe(false);
    });
  });
});


