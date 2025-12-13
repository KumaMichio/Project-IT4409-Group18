const {
  getUsers,
  findUserByEmail,
  addUser,
  createUser,
} = require('../../../src/repositories/user.repository');
const { pool } = require('../../../src/config/db');

// Mock database pool
jest.mock('../../../src/config/db');

describe('User Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users from database', async () => {
      // Arrange
      const mockRows = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          password_hash: 'hash1',
          full_name: 'User One',
          role: 'student',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          password_hash: 'hash2',
          full_name: 'User Two',
          role: 'teacher',
        },
      ];
      pool.query = jest.fn().mockResolvedValue({ rows: mockRows });

      // Act
      const result = await getUsers();

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, email, password_hash, full_name, role FROM users ORDER BY id'
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User One',
        role: 'student',
        passwordHash: 'hash1',
      });
      expect(result[1]).toMatchObject({
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User Two',
        role: 'teacher',
        passwordHash: 'hash2',
      });
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await getUsers();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email (case-insensitive)', async () => {
      // Arrange
      const mockRow = {
        id: 'user-1',
        email: 'test@example.com',
        password_hash: 'hash1',
        full_name: 'Test User',
        role: 'student',
      };
      pool.query = jest.fn().mockResolvedValue({ rows: [mockRow] });

      // Act
      const result = await findUserByEmail('TEST@EXAMPLE.COM');

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, email, password_hash, full_name, role FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
        ['TEST@EXAMPLE.COM']
      );
      expect(result).toMatchObject({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        passwordHash: 'hash1',
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await findUserByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('addUser', () => {
    it('should add a new user to database', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: 'student',
      };
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await addUser(userData);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [userData.id, userData.email, userData.passwordHash, userData.name, userData.role]
      );
      expect(result).toMatchObject({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
    });

    it('should generate ID when not provided', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: 'student',
      };
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await addUser(userData);

      // Assert
      expect(result.id).toBeDefined();
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([expect.any(String), userData.email, userData.passwordHash, userData.name, userData.role])
      );
    });

    it('should default role to student when not provided', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await addUser(userData);

      // Assert
      expect(result.role).toBe('student');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([expect.any(String), userData.email, userData.passwordHash, userData.name, 'student'])
      );
    });

    it('should handle full_name field name', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        full_name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: 'student',
      };
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await addUser(userData);

      // Assert
      expect(result.name).toBe('Test User');
    });

    it('should handle password_hash field name', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'student',
      };
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await addUser(userData);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([userData.id, userData.email, 'hashed_password', userData.name, userData.role])
      );
    });
  });

  describe('createUser', () => {
    it('should call addUser with correct parameters', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: 'teacher',
      };
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(pool.query).toHaveBeenCalled();
    });

    it('should default role to student', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      // Act
      const result = await createUser(userData);

      // Assert
      expect(result.role).toBe('student');
    });
  });
});


