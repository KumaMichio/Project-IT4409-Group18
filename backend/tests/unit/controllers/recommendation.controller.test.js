const {
  postFeedback,
  getMyFeedback,
} = require('../../../src/controllers/recommendation.controller');
const recommendationService = require('../../../src/services/recommendation.service');

// Mock dependencies
jest.mock('../../../src/services/recommendation.service');

describe('Recommendation Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('postFeedback', () => {
    it('should submit feedback successfully', async () => {
      // Arrange
      req.body = {
        courseId: 100,
        action: 'HIDE',
      };
      const mockFeedback = {
        id: 1,
        user_id: 1,
        course_id: 100,
        feedback_type: 'HIDE',
      };
      recommendationService.submitFeedback.mockResolvedValue(mockFeedback);

      // Act
      await postFeedback(req, res, next);

      // Assert
      expect(recommendationService.submitFeedback).toHaveBeenCalledWith(
        1,
        100,
        'HIDE'
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Feedback saved',
        feedback: mockFeedback,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when courseId is missing', async () => {
      // Arrange
      req.body = {
        action: 'HIDE',
      };

      // Act
      await postFeedback(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'courseId and action are required',
      });
      expect(recommendationService.submitFeedback).not.toHaveBeenCalled();
    });

    it('should return 400 when action is missing', async () => {
      // Arrange
      req.body = {
        courseId: 100,
      };

      // Act
      await postFeedback(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'courseId and action are required',
      });
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      req.body = {
        courseId: 100,
        action: 'HIDE',
      };
      const error = new Error('Database error');
      recommendationService.submitFeedback.mockRejectedValue(error);

      // Act
      await postFeedback(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMyFeedback', () => {
    it('should return user feedback list', async () => {
      // Arrange
      const mockFeedbackList = [
        {
          id: 1,
          user_id: 1,
          course_id: 100,
          feedback_type: 'HIDE',
        },
        {
          id: 2,
          user_id: 1,
          course_id: 200,
          feedback_type: 'PRIORITY',
        },
      ];
      recommendationService.listUserFeedback.mockResolvedValue(
        mockFeedbackList
      );

      // Act
      await getMyFeedback(req, res, next);

      // Assert
      expect(recommendationService.listUserFeedback).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockFeedbackList);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no feedback', async () => {
      // Arrange
      recommendationService.listUserFeedback.mockResolvedValue([]);

      // Act
      await getMyFeedback(req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Database error');
      recommendationService.listUserFeedback.mockRejectedValue(error);

      // Act
      await getMyFeedback(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

