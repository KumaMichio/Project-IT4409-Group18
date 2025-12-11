const {
  getAdminRevenueSummary,
  getAdminRevenueByCourse,
  getInstructorRevenue,
} = require('../../../src/services/revenue.service');
const revenueModel = require('../../../src/models/revenue.model');

// Mock dependencies
jest.mock('../../../src/models/revenue.model');

describe('Revenue Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdminRevenueSummary', () => {
    it('should return revenue summary with date range', async () => {
      // Arrange
      const from = '2024-01-01T00:00:00Z';
      const to = '2024-01-31T23:59:59Z';
      const mockSummary = {
        total_revenue: '1000000',
        total_paid_transactions: 50,
        total_courses: 10,
      };
      revenueModel.getRevenueSummary.mockResolvedValue(mockSummary);

      // Act
      const result = await getAdminRevenueSummary(from, to);

      // Assert
      expect(revenueModel.getRevenueSummary).toHaveBeenCalledWith(from, to);
      expect(result).toMatchObject({
        ...mockSummary,
        from,
        to,
      });
    });

    it('should use default date range when not provided', async () => {
      // Arrange
      const mockSummary = {
        total_revenue: '500000',
        total_paid_transactions: 25,
        total_courses: 5,
      };
      revenueModel.getRevenueSummary.mockResolvedValue(mockSummary);

      // Act
      const result = await getAdminRevenueSummary();

      // Assert
      expect(revenueModel.getRevenueSummary).toHaveBeenCalled();
      expect(result).toHaveProperty('from');
      expect(result).toHaveProperty('to');
      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
    });

    it('should handle null date range', async () => {
      // Arrange
      const mockSummary = {
        total_revenue: '0',
        total_paid_transactions: 0,
        total_courses: 0,
      };
      revenueModel.getRevenueSummary.mockResolvedValue(mockSummary);

      // Act
      const result = await getAdminRevenueSummary(null, null);

      // Assert
      expect(result).toHaveProperty('from');
      expect(result).toHaveProperty('to');
    });
  });

  describe('getAdminRevenueByCourse', () => {
    it('should return revenue by course with date range', async () => {
      // Arrange
      const from = '2024-01-01T00:00:00Z';
      const to = '2024-01-31T23:59:59Z';
      const mockData = [
        {
          course_id: 1,
          course_title: 'Course 1',
          instructor_name: 'Instructor 1',
          total_revenue: '500000',
          total_students: 25,
        },
        {
          course_id: 2,
          course_title: 'Course 2',
          instructor_name: 'Instructor 2',
          total_revenue: '300000',
          total_students: 15,
        },
      ];
      revenueModel.getRevenueByCourse.mockResolvedValue(mockData);

      // Act
      const result = await getAdminRevenueByCourse(from, to);

      // Assert
      expect(revenueModel.getRevenueByCourse).toHaveBeenCalledWith(from, to);
      expect(result).toMatchObject({
        from,
        to,
        data: mockData,
      });
    });

    it('should use default date range when not provided', async () => {
      // Arrange
      const mockData = [];
      revenueModel.getRevenueByCourse.mockResolvedValue(mockData);

      // Act
      const result = await getAdminRevenueByCourse();

      // Assert
      expect(result).toHaveProperty('from');
      expect(result).toHaveProperty('to');
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getInstructorRevenue', () => {
    it('should return instructor revenue with date range', async () => {
      // Arrange
      const instructorId = 1;
      const from = '2024-01-01T00:00:00Z';
      const to = '2024-01-31T23:59:59Z';
      const mockData = [
        {
          course_id: 1,
          course_title: 'My Course 1',
          total_revenue: '200000',
          total_students: 10,
        },
      ];
      revenueModel.getRevenueByInstructorCourses.mockResolvedValue(mockData);

      // Act
      const result = await getInstructorRevenue(instructorId, from, to);

      // Assert
      expect(revenueModel.getRevenueByInstructorCourses).toHaveBeenCalledWith(
        instructorId,
        from,
        to
      );
      expect(result).toMatchObject({
        from,
        to,
        data: mockData,
      });
    });

    it('should use default date range when not provided', async () => {
      // Arrange
      const instructorId = 1;
      const mockData = [];
      revenueModel.getRevenueByInstructorCourses.mockResolvedValue(mockData);

      // Act
      const result = await getInstructorRevenue(instructorId);

      // Assert
      expect(result).toHaveProperty('from');
      expect(result).toHaveProperty('to');
      expect(result.data).toEqual(mockData);
    });

    it('should handle instructor with no revenue', async () => {
      // Arrange
      const instructorId = 999;
      const mockData = [];
      revenueModel.getRevenueByInstructorCourses.mockResolvedValue(mockData);

      // Act
      const result = await getInstructorRevenue(instructorId);

      // Assert
      expect(result.data).toEqual([]);
    });
  });
});

