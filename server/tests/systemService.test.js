const systemService = require('../src/services/systemService');
const systemModel = require('../src/models/systemModel');
const logModel = require('../src/models/logModel');

jest.mock('../src/models/systemModel');
jest.mock('../src/models/logModel');

describe('System Service (UC18)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getOverview trả về dữ liệu từ systemModel.getSystemOverview', async () => {
    const overview = {
      total_users: 100,
      total_students: 70,
      total_instructors: 30,
      total_courses: 20,
      published_courses: 15,
      today_transactions: 3,
      month_revenue: '999999',
    };

    systemModel.getSystemOverview.mockResolvedValue(overview);

    const res = await systemService.getOverview();

    expect(systemModel.getSystemOverview).toHaveBeenCalledTimes(1);
    expect(res).toEqual(overview);
  });

  test('listLogs dùng limit mặc định = 50 nếu không truyền', async () => {
    const fakeLogs = [{ log_id: 1, action: 'USER_LOGIN' }];
    logModel.getLogs.mockResolvedValue(fakeLogs);

    const res = await systemService.listLogs();

    expect(logModel.getLogs).toHaveBeenCalledWith(50, undefined);
    expect(res).toEqual(fakeLogs);
  });

  test('listLogs parse limit từ query', async () => {
    logModel.getLogs.mockResolvedValue([]);

    await systemService.listLogs('10', 'COURSE_PURCHASED');

    expect(logModel.getLogs).toHaveBeenCalledWith(10, 'COURSE_PURCHASED');
  });
});
