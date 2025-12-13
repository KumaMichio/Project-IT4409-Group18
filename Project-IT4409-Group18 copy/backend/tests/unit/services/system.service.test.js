const {
  getOverview,
  listLogs,
} = require('../../../src/services/system.service');
const systemModel = require('../../../src/models/system.model');
const logModel = require('../../../src/models/log.model');

// Mock dependencies
jest.mock('../../../src/models/system.model');
jest.mock('../../../src/models/log.model');

describe('System Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should return system overview', async () => {
      // Arrange
      const mockOverview = {
        total_users: 100,
        total_students: 80,
        total_instructors: 15,
        total_courses: 50,
        published_courses: 45,
        today_transactions: 10,
        month_revenue: '5000000',
      };
      systemModel.getSystemOverview.mockResolvedValue(mockOverview);

      // Act
      const result = await getOverview();

      // Assert
      expect(systemModel.getSystemOverview).toHaveBeenCalled();
      expect(result).toEqual(mockOverview);
    });

    it('should handle empty system', async () => {
      // Arrange
      const mockOverview = {
        total_users: 0,
        total_students: 0,
        total_instructors: 0,
        total_courses: 0,
        published_courses: 0,
        today_transactions: 0,
        month_revenue: '0',
      };
      systemModel.getSystemOverview.mockResolvedValue(mockOverview);

      // Act
      const result = await getOverview();

      // Assert
      expect(result).toEqual(mockOverview);
    });
  });

  describe('listLogs', () => {
    it('should return logs with default limit', async () => {
      // Arrange
      const mockLogs = [
        {
          log_id: 1,
          user_id: 1,
          full_name: 'User 1',
          action: 'LOGIN',
          detail: { ip: '127.0.0.1' },
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          log_id: 2,
          user_id: 2,
          full_name: 'User 2',
          action: 'LOGOUT',
          detail: null,
          created_at: '2024-01-01T01:00:00Z',
        },
      ];
      logModel.getLogs.mockResolvedValue(mockLogs);

      // Act
      const result = await listLogs();

      // Assert
      expect(logModel.getLogs).toHaveBeenCalledWith(50, undefined);
      expect(result).toEqual(mockLogs);
    });

    it('should return logs with custom limit', async () => {
      // Arrange
      const limit = 10;
      const mockLogs = [];
      logModel.getLogs.mockResolvedValue(mockLogs);

      // Act
      const result = await listLogs(limit);

      // Assert
      expect(logModel.getLogs).toHaveBeenCalledWith(limit, undefined);
      expect(result).toEqual(mockLogs);
    });

    it('should return logs filtered by action', async () => {
      // Arrange
      const limit = 20;
      const actionFilter = 'LOGIN';
      const mockLogs = [
        {
          log_id: 1,
          user_id: 1,
          full_name: 'User 1',
          action: 'LOGIN',
          detail: {},
          created_at: '2024-01-01T00:00:00Z',
        },
      ];
      logModel.getLogs.mockResolvedValue(mockLogs);

      // Act
      const result = await listLogs(limit, actionFilter);

      // Assert
      expect(logModel.getLogs).toHaveBeenCalledWith(limit, actionFilter);
      expect(result).toEqual(mockLogs);
    });

    it('should handle invalid limit by using default', async () => {
      // Arrange
      const invalidLimit = 'invalid';
      const mockLogs = [];
      logModel.getLogs.mockResolvedValue(mockLogs);

      // Act
      const result = await listLogs(invalidLimit);

      // Assert
      expect(logModel.getLogs).toHaveBeenCalledWith(50, undefined);
      expect(result).toEqual(mockLogs);
    });

    it('should handle zero limit', async () => {
      // Arrange
      const limit = 0;
      const mockLogs = [];
      logModel.getLogs.mockResolvedValue(mockLogs);

      // Act
      const result = await listLogs(limit);

      // Assert
      expect(logModel.getLogs).toHaveBeenCalledWith(50, undefined);
    });
  });
});

