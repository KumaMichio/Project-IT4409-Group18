const {
  submitFeedback,
  listUserFeedback,
} = require('../../../src/services/recommendation.service');
const recommendationModel = require('../../../src/models/recommendationFeedback.model');

// Mock dependencies
jest.mock('../../../src/models/recommendationFeedback.model');

describe('Recommendation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should submit valid feedback successfully', async () => {
      // Arrange
      const userId = 1;
      const courseId = 100;
      const action = 'HIDE';
      const mockFeedback = {
        id: 1,
        user_id: userId,
        course_id: courseId,
        feedback_type: action,
      };
      recommendationModel.upsertFeedback.mockResolvedValue(mockFeedback);

      // Act
      const result = await submitFeedback(userId, courseId, action);

      // Assert
      expect(recommendationModel.upsertFeedback).toHaveBeenCalledWith(
        userId,
        courseId,
        action
      );
      expect(result).toEqual(mockFeedback);
    });

    it('should accept NOT_INTERESTED action', async () => {
      // Arrange
      const userId = 1;
      const courseId = 100;
      const action = 'NOT_INTERESTED';
      const mockFeedback = {
        id: 1,
        user_id: userId,
        course_id: courseId,
        feedback_type: action,
      };
      recommendationModel.upsertFeedback.mockResolvedValue(mockFeedback);

      // Act
      const result = await submitFeedback(userId, courseId, action);

      // Assert
      expect(result).toEqual(mockFeedback);
    });

    it('should accept PRIORITY action', async () => {
      // Arrange
      const userId = 1;
      const courseId = 100;
      const action = 'PRIORITY';
      const mockFeedback = {
        id: 1,
        user_id: userId,
        course_id: courseId,
        feedback_type: action,
      };
      recommendationModel.upsertFeedback.mockResolvedValue(mockFeedback);

      // Act
      const result = await submitFeedback(userId, courseId, action);

      // Assert
      expect(result).toEqual(mockFeedback);
    });

    it('should throw error for invalid action', async () => {
      // Arrange
      const userId = 1;
      const courseId = 100;
      const action = 'INVALID_ACTION';

      // Act & Assert
      await expect(submitFeedback(userId, courseId, action)).rejects.toThrow();
      await expect(submitFeedback(userId, courseId, action)).rejects.toThrow(
        'Invalid action'
      );
      expect(recommendationModel.upsertFeedback).not.toHaveBeenCalled();
    });

    it('should throw error with status 400 for invalid action', async () => {
      // Arrange
      const userId = 1;
      const courseId = 100;
      const action = 'INVALID_ACTION';

      // Act & Assert
      try {
        await submitFeedback(userId, courseId, action);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('Invalid action');
      }
    });
  });

  describe('listUserFeedback', () => {
    it('should return user feedback list', async () => {
      // Arrange
      const userId = 1;
      const mockFeedbackList = [
        {
          id: 1,
          user_id: userId,
          course_id: 100,
          feedback_type: 'HIDE',
        },
        {
          id: 2,
          user_id: userId,
          course_id: 200,
          feedback_type: 'PRIORITY',
        },
      ];
      recommendationModel.getFeedbackByUser.mockResolvedValue(mockFeedbackList);

      // Act
      const result = await listUserFeedback(userId);

      // Assert
      expect(recommendationModel.getFeedbackByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFeedbackList);
    });

    it('should return empty array when user has no feedback', async () => {
      // Arrange
      const userId = 1;
      recommendationModel.getFeedbackByUser.mockResolvedValue([]);

      // Act
      const result = await listUserFeedback(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

