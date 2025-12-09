// tests/recommendationRoutes.test.js

// 1. Mock authMiddleware trước khi import app/router
//   CHÚ Ý: dùng đúng module name giống trong recommendationRoutes.js:
//   const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
jest.mock('../src/middleware/authMiddleware', () => ({
  authMiddleware: (req, res, next) => {
    // gắn user giả cho tất cả request trong test
    req.user = { 
      id: 123,
      user_id: 123,
      userId: 123,
      role: 'STUDENT',
    };
    next();
  },
  // requireRole trả về 1 middleware, ở test chỉ cần cho qua
  requireRole: () => (req, res, next) => next(),
}));

// 2. Mock recommendationService để khỏi gọi DB thật
jest.mock('../src/services/recommendationService', () => ({
  submitFeedback: jest.fn(),
  listUserFeedback: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const recommendationService = require('../src/services/recommendationService');

describe('Recommendation Routes (UC16)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/recommendations/feedback trả 400 nếu thiếu courseId hoặc action', async () => {
    const res = await request(app)
      .post('/api/recommendations/feedback')
      .send({ courseId: 1 }); // thiếu action

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('courseId and action are required');
  });

  test('POST /api/recommendations/feedback thành công', async () => {
    const fakeFeedback = {
      feedback_id: 1,
      user_id: 123,
      course_id: 10,
      action: 'PRIORITY',
    };

    recommendationService.submitFeedback.mockResolvedValue(fakeFeedback);

    const res = await request(app)
      .post('/api/recommendations/feedback')
      .send({ courseId: 10, action: 'PRIORITY' });

    expect(res.status).toBe(200);
    expect(recommendationService.submitFeedback).toHaveBeenCalledWith(
      123,      // lấy từ req.user.user_id do mock gắn vào
      10,
      'PRIORITY'
    );
    expect(res.body).toEqual({
      message: 'Feedback saved',
      feedback: fakeFeedback,
    });
  });

  test('GET /api/recommendations/feedback trả list feedback', async () => {
    const fakeList = [{ feedback_id: 1, course_id: 10, action: 'HIDE' }];
    recommendationService.listUserFeedback.mockResolvedValue(fakeList);

    const res = await request(app)
      .get('/api/recommendations/feedback')
      .send();

    expect(res.status).toBe(200);
    expect(recommendationService.listUserFeedback).toHaveBeenCalledWith(123);
    expect(res.body).toEqual(fakeList);
  });
});
