const revenueService = require('../src/services/revenueService');
const revenueModel = require('../src/models/revenueModel');

jest.mock('../src/models/revenueModel');

describe('Revenue Service (UC17)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAdminRevenueSummary sử dụng default date range khi không truyền from/to', async () => {
    const mockSummary = {
      total_revenue: '1000000',
      total_paid_transactions: '5',
      total_courses: '3',
    };
    revenueModel.getRevenueSummary.mockResolvedValue(mockSummary);

    const result = await revenueService.getAdminRevenueSummary();

    expect(revenueModel.getRevenueSummary).toHaveBeenCalledTimes(1);
    const [fromArg, toArg] = revenueModel.getRevenueSummary.mock.calls[0];

    expect(typeof fromArg).toBe('string');
    expect(typeof toArg).toBe('string');

    expect(result).toMatchObject({
      total_revenue: '1000000',
      total_paid_transactions: '5',
      total_courses: '3',
    });
    expect(result.from).toBeDefined();
    expect(result.to).toBeDefined();
  });

  test('getAdminRevenueByCourse trả về đúng dữ liệu', async () => {
    const fakeData = [
      {
        course_id: 1,
        course_title: 'Node.js',
        instructor_name: 'A',
        total_revenue: '500000',
        total_students: 10,
      },
    ];
    revenueModel.getRevenueByCourse.mockResolvedValue(fakeData);

    const from = '2025-01-01T00:00:00.000Z';
    const to = '2025-01-31T23:59:59.000Z';

    const result = await revenueService.getAdminRevenueByCourse(from, to);

    expect(revenueModel.getRevenueByCourse).toHaveBeenCalledWith(from, to);
    expect(result).toEqual({
      from,
      to,
      data: fakeData,
    });
  });

  test('getInstructorRevenue gọi model với instructorId đúng', async () => {
    const instructorId = 99;
    const fakeData = [
      {
        course_id: 7,
        course_title: 'React',
        total_revenue: '123456',
        total_students: 4,
      },
    ];
    revenueModel.getRevenueByInstructorCourses.mockResolvedValue(fakeData);

    const res = await revenueService.getInstructorRevenue(
      instructorId,
      '2025-02-01T00:00:00.000Z',
      '2025-02-28T23:59:59.000Z'
    );

    expect(revenueModel.getRevenueByInstructorCourses).toHaveBeenCalledWith(
      instructorId,
      '2025-02-01T00:00:00.000Z',
      '2025-02-28T23:59:59.000Z'
    );
    expect(res.data).toEqual(fakeData);
  });
});
