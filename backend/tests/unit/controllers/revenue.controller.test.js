const {
  getAdminSummary,
  getAdminByCourse,
  getInstructorRevenue,
} = require('../../../src/controllers/revenue.controller');
const revenueService = require('../../../src/services/revenue.service');

// Mock dependencies
jest.mock('../../../src/services/revenue.service');

describe('Revenue Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAdminSummary', () => {
    it('should return admin revenue summary', async () => {
      // Arrange
      req.query = {
        from: '2024-01-01T00:00:00Z',
        to: '2024-01-31T23:59:59Z',
      };
      const mockSummary = {
        total_revenue: '1000000',
        total_paid_transactions: 50,
        total_courses: 10,
        from: req.query.from,
        to: req.query.to,
      };
      revenueService.getAdminRevenueSummary.mockResolvedValue(mockSummary);

      // Act
      await getAdminSummary(req, res, next);

      // Assert
      expect(revenueService.getAdminRevenueSummary).toHaveBeenCalledWith(
        req.query.from,
        req.query.to
      );
      expect(res.json).toHaveBeenCalledWith(mockSummary);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing date range', async () => {
      // Arrange
      req.query = {};
      const mockSummary = {
        total_revenue: '500000',
        total_paid_transactions: 25,
        total_courses: 5,
        from: expect.any(String),
        to: expect.any(String),
      };
      revenueService.getAdminRevenueSummary.mockResolvedValue(mockSummary);

      // Act
      await getAdminSummary(req, res, next);

      // Assert
      expect(revenueService.getAdminRevenueSummary).toHaveBeenCalledWith(
        undefined,
        undefined
      );
      expect(res.json).toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Database error');
      revenueService.getAdminRevenueSummary.mockRejectedValue(error);

      // Act
      await getAdminSummary(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAdminByCourse', () => {
    it('should return revenue by course', async () => {
      // Arrange
      req.query = {
        from: '2024-01-01T00:00:00Z',
        to: '2024-01-31T23:59:59Z',
      };
      const mockResult = {
        from: req.query.from,
        to: req.query.to,
        data: [
          {
            course_id: 1,
            course_title: 'Course 1',
            instructor_name: 'Instructor 1',
            total_revenue: '500000',
            total_students: 25,
          },
        ],
      };
      revenueService.getAdminRevenueByCourse.mockResolvedValue(mockResult);

      // Act
      await getAdminByCourse(req, res, next);

      // Assert
      expect(revenueService.getAdminRevenueByCourse).toHaveBeenCalledWith(
        req.query.from,
        req.query.to
      );
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Database error');
      revenueService.getAdminRevenueByCourse.mockRejectedValue(error);

      // Act
      await getAdminByCourse(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getInstructorRevenue', () => {
    it('should return instructor revenue', async () => {
      // Arrange
      req.user = { id: 1 };
      req.query = {
        from: '2024-01-01T00:00:00Z',
        to: '2024-01-31T23:59:59Z',
      };
      const mockResult = {
        from: req.query.from,
        to: req.query.to,
        data: [
          {
            course_id: 1,
            course_title: 'My Course 1',
            total_revenue: '200000',
            total_students: 10,
          },
        ],
      };
      revenueService.getInstructorRevenue.mockResolvedValue(mockResult);

      // Act
      await getInstructorRevenue(req, res, next);

      // Assert
      expect(revenueService.getInstructorRevenue).toHaveBeenCalledWith(
        1,
        req.query.from,
        req.query.to
      );
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should use instructor id from req.user', async () => {
      // Arrange
      req.user = { id: 999 };
      req.query = {};
      const mockResult = {
        from: expect.any(String),
        to: expect.any(String),
        data: [],
      };
      revenueService.getInstructorRevenue.mockResolvedValue(mockResult);

      // Act
      await getInstructorRevenue(req, res, next);

      // Assert
      expect(revenueService.getInstructorRevenue).toHaveBeenCalledWith(
        999,
        undefined,
        undefined
      );
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Database error');
      revenueService.getInstructorRevenue.mockRejectedValue(error);

      // Act
      await getInstructorRevenue(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

