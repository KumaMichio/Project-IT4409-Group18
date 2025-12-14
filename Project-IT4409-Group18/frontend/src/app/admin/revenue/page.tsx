'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type RevenueSummary = {
  total_revenue: string;
  revenue_by_date?: Array<{ date: string; revenue: string }>;
};

type RevenueByCourse = {
  course_id: number;
  course_title: string;
  total_revenue: string;
  total_students: number;
};

export default function AdminRevenuePage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [byCourse, setByCourse] = useState<RevenueByCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchData();
  }, [from, to]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (from) params.append('from', new Date(from).toISOString());
      if (to) params.append('to', new Date(to).toISOString());

      const [summaryRes, byCourseRes] = await Promise.all([
        apiFetch(`/api/revenue/admin/summary?${params.toString()}`),
        apiFetch(`/api/revenue/admin/by-course?${params.toString()}`),
      ]);

      setSummary(summaryRes);
      setByCourse(byCourseRes.data || []);
    } catch (err: any) {
      console.error('Error fetching revenue:', err);
      alert('Không thể tải dữ liệu doanh thu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary ? `${Number(summary.total_revenue || 0).toLocaleString('vi-VN')} đ` : '0 đ'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-blue-600">💰</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Giao dịch hôm nay</p>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-yellow-600">📊</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Khóa học đã bán</p>
              <p className="text-2xl font-semibold text-gray-900">{byCourse.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-red-600">📚</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng học viên</p>
              <p className="text-2xl font-semibold text-gray-900">
                {byCourse.reduce((sum, c) => sum + c.total_students, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-600">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimeFrame('day')}
                className={`px-3 py-1 text-sm rounded ${
                  timeFrame === 'day'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setTimeFrame('week')}
                className={`px-3 py-1 text-sm rounded ${
                  timeFrame === 'week'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeFrame('month')}
                className={`px-3 py-1 text-sm rounded ${
                  timeFrame === 'month'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Month
              </button>
              <button className="p-1 text-gray-600 hover:bg-gray-100 rounded ml-2">⬇</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-500 text-sm">Line chart visualization</p>
            </div>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố doanh thu</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500 text-sm">Donut chart visualization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Course Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Doanh thu theo khóa học</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">→</button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khóa học</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số học viên</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byCourse.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Chưa có dữ liệu doanh thu
                    </td>
                  </tr>
                ) : (
                  byCourse.map((course) => (
                    <tr key={course.course_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.course_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {course.total_students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">
                        {Number(course.total_revenue || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">⋯</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}