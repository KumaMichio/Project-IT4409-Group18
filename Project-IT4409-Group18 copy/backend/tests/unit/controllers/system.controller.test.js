const {
  getOverview,
  getLogs,
} = require('../../../src/controllers/system.controller');
const systemService = require('../../../src/services/system.service');

// Mock dependencies
jest.mock('../../../src/services/system.service');

describe('System Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
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
      systemService.getOverview.mockResolvedValue(mockOverview);

      // Act
      await getOverview(req, res, next);

      // Assert
      expect(systemService.getOverview).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockOverview);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Database error');
      systemService.getOverview.mockRejectedValue(error);

      // Act
      await getOverview(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getLogs', () => {
    it('should return logs with default parameters', async () => {
      // Arrange
      req.query = {};
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
      systemService.listLogs.mockResolvedValue(mockLogs);

      // Act
      await getLogs(req, res, next);

      // Assert
      expect(systemService.listLogs).toHaveBeenCalledWith(undefined, undefined);
      expect(res.json).toHaveBeenCalledWith(mockLogs);
    });

    it('should return logs with custom limit', async () => {
      // Arrange
      req.query = { limit: '20' };
      const mockLogs = [];
      systemService.listLogs.mockResolvedValue(mockLogs);

      // Act
      await getLogs(req, res, next);

      // Assert
      expect(systemService.listLogs).toHaveBeenCalledWith('20', undefined);
      expect(res.json).toHaveBeenCalledWith(mockLogs);
    });

    it('should return logs filtered by action', async () => {
      // Arrange
      req.query = {
        limit: '10',
        action: 'LOGIN',
      };
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
      systemService.listLogs.mockResolvedValue(mockLogs);

      // Act
      await getLogs(req, res, next);

      // Assert
      expect(systemService.listLogs).toHaveBeenCalledWith('10', 'LOGIN');
      expect(res.json).toHaveBeenCalledWith(mockLogs);
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Database error');
      systemService.listLogs.mockRejectedValue(error);

      // Act
      await getLogs(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

