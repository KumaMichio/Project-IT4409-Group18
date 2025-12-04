const recommendationService = require('../src/services/recommendationService');
const recommendationModel = require('../src/models/recommendationFeedbackModel');

jest.mock('../src/middleware/authMiddleware');
jest.mock('../src/models/recommendationFeedbackModel');

describe('Recommendation Service (UC16)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('submitFeedback gọi upsertFeedback với tham số đúng', async () => {
    const mockFeedback = {
      feedback_id: 1,
      user_id: 10,
      course_id: 20,
      action: 'PRIORITY',
    };

    recommendationModel.upsertFeedback.mockResolvedValue(mockFeedback);

    const result = await recommendationService.submitFeedback(
      10,
      20,
      'PRIORITY'
    );

    expect(recommendationModel.upsertFeedback).toHaveBeenCalledWith(
      10,
      20,
      'PRIORITY'
    );
    expect(result).toEqual(mockFeedback);
  });

  test('submitFeedback ném lỗi nếu action không hợp lệ', async () => {
    await expect(
      recommendationService.submitFeedback(10, 20, 'INVALID_ACTION')
    ).rejects.toMatchObject({
      message: 'Invalid action',
      status: 400,
    });

    expect(recommendationModel.upsertFeedback).not.toHaveBeenCalled();
  });

  test('listUserFeedback trả về list feedback của user', async () => {
    const fakeList = [
      { feedback_id: 1, user_id: 10, course_id: 100, action: 'HIDE' },
      { feedback_id: 2, user_id: 10, course_id: 101, action: 'PRIORITY' },
    ];

    recommendationModel.getFeedbackByUser.mockResolvedValue(fakeList);

    const result = await recommendationService.listUserFeedback(10);

    expect(recommendationModel.getFeedbackByUser).toHaveBeenCalledWith(10);
    expect(result).toEqual(fakeList);
  });
});
