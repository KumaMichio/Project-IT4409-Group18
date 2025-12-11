const {
  signup,
  signin,
  getMeFromToken,
  AuthError,
} = require('../../../src/services/auth.service');
const {
  findUserByEmail,
  addUser,
  getUsers,
} = require('../../../src/repositories/user.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/repositories/user.repository');
jest.mock('bcryptjs');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const mockUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
    };

    it('should successfully signup a new user', async () => {
      // Arrange
      findUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      addUser.mockResolvedValue({
        id: 'user-123',
        name: mockUserData.name,
        email: mockUserData.email,
        role: mockUserData.role,
      });

      // Act
      const result = await signup(mockUserData);

      // Assert
      expect(findUserByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(addUser).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toMatchObject({
        name: mockUserData.name,
        email: mockUserData.email,
        role: mockUserData.role,
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw AuthError when required fields are missing', async () => {
      // Test missing name
      await expect(signup({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(AuthError);
      await expect(signup({ email: 'test@example.com', password: 'pass' })).rejects.toThrow('Missing fields');

      // Test missing email
      await expect(signup({ name: 'Test', password: 'pass' })).rejects.toThrow(AuthError);

      // Test missing password
      await expect(signup({ name: 'Test', email: 'test@example.com' })).rejects.toThrow(AuthError);
    });

    it('should throw AuthError when email already exists', async () => {
      // Arrange
      findUserByEmail.mockResolvedValue({ id: 'existing-user', email: 'test@example.com' });

      // Act & Assert
      await expect(signup(mockUserData)).rejects.toThrow(AuthError);
      await expect(signup(mockUserData)).rejects.toThrow('Email already in use');
    });

    it('should throw AuthError when role is invalid', async () => {
      // Arrange
      findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(signup({ ...mockUserData, role: 'invalid_role' })).rejects.toThrow(AuthError);
      await expect(signup({ ...mockUserData, role: 'invalid_role' })).rejects.toThrow('Invalid role');
    });

    it('should default role to student when not provided', async () => {
      // Arrange
      findUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      addUser.mockResolvedValue({
        id: 'user-123',
        name: mockUserData.name,
        email: mockUserData.email,
        role: 'STUDENT',
      });

      // Act
      const { name, email, password } = mockUserData;
      const result = await signup({ name, email, password });

      // Assert
      // Role được map sang database enum format (STUDENT)
      expect(addUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'STUDENT' })
      );
    });

    it('should normalize role and map to database enum', async () => {
      // Arrange
      findUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      addUser.mockResolvedValue({
        id: 'user-123',
        name: mockUserData.name,
        email: mockUserData.email,
        role: 'INSTRUCTOR',
      });

      // Act
      const result = await signup({ ...mockUserData, role: 'TEACHER' });

      // Assert
      // Role được normalize và map sang database enum format (INSTRUCTOR)
      expect(addUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'INSTRUCTOR' })
      );
    });
  });

  describe('signin', () => {
    const mockCredentials = {
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

    it('should successfully signin with valid credentials', async () => {
      // Arrange
      findUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await signin(mockCredentials);

      // Assert
      expect(findUserByEmail).toHaveBeenCalledWith(mockCredentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockCredentials.password, mockUser.passwordHash);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw AuthError when email or password is missing', async () => {
      // Test missing email
      await expect(signin({ password: 'pass' })).rejects.toThrow(AuthError);
      await expect(signin({ password: 'pass' })).rejects.toThrow('Missing fields');

      // Test missing password
      await expect(signin({ email: 'test@example.com' })).rejects.toThrow(AuthError);
    });

    it('should throw AuthError when user does not exist', async () => {
      // Arrange
      findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(signin(mockCredentials)).rejects.toThrow(AuthError);
      await expect(signin(mockCredentials)).rejects.toThrow('Invalid credentials');
    });

    it('should throw AuthError when password is incorrect', async () => {
      // Arrange
      findUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(signin(mockCredentials)).rejects.toThrow(AuthError);
      await expect(signin(mockCredentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getMeFromToken', () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
    };

    it('should successfully get user from valid token', async () => {
      // Arrange
      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role, name: mockUser.name },
        process.env.JWT_SECRET || 'test-jwt-secret-key'
      );
      getUsers.mockResolvedValue([mockUser]);

      // Act
      const result = await getMeFromToken(token);

      // Assert
      expect(result).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw AuthError when token is invalid', async () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act & Assert
      await expect(getMeFromToken(invalidToken)).rejects.toThrow(AuthError);
      await expect(getMeFromToken(invalidToken)).rejects.toThrow('Invalid token');
    });

    it('should throw AuthError when token is expired', async () => {
      // Arrange
      const expiredToken = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET || 'test-jwt-secret-key',
        { expiresIn: '-1h' }
      );

      // Act & Assert
      await expect(getMeFromToken(expiredToken)).rejects.toThrow(AuthError);
    });

    it('should throw AuthError when user not found', async () => {
      // Arrange
      const token = jwt.sign(
        { id: 'non-existent-id' },
        process.env.JWT_SECRET || 'test-jwt-secret-key'
      );
      getUsers.mockResolvedValue([mockUser]);

      // Act & Assert
      await expect(getMeFromToken(token)).rejects.toThrow(AuthError);
      await expect(getMeFromToken(token)).rejects.toThrow('Not found');
    });
  });
});


