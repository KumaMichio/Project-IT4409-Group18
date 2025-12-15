'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type RevenueSummary = {
  total_revenue: string;
  today_transactions: number;
  total_students: number;
  total_courses: number;
};

type RevenueByCourse = {
  course_id: number;
  course_title: string;
  total_revenue: string;
  total_students: number;
};

type RevenueByDate = {
  date: string;
  revenue: string;
};

type RevenueByTag = {
  tag_id: number;
  tag_name: string;
  total_revenue: string;
  course_count: number;
};

export default function AdminRevenuePage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [byCourse, setByCourse] = useState<RevenueByCourse[]>([]);
  const [revenueByDate, setRevenueByDate] = useState<RevenueByDate[]>([]);
  const [revenueByTag, setRevenueByTag] = useState<RevenueByTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchData();
  }, [from, to, timeFrame]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (from) params.append('from', new Date(from).toISOString());
      if (to) params.append('to', new Date(to).toISOString());
      
      // Set default date range if not provided
      if (!from || !to) {
        const now = new Date();
        const defaultTo = now.toISOString();
        let defaultFrom: Date;
        if (timeFrame === 'day') {
          defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
        } else if (timeFrame === 'week') {
          defaultFrom = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks
        } else {
          defaultFrom = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // 12 months
        }
        params.set('from', defaultFrom.toISOString());
        params.set('to', defaultTo);
      }

      const chartParams = new URLSearchParams(params);
      chartParams.append('groupBy', timeFrame === 'month' ? 'month' : 'day');

      const [summaryRes, byCourseRes, revenueByDateRes, revenueByTagRes] = await Promise.all([
        apiFetch(`/api/revenue/admin/summary?${params.toString()}`),
        apiFetch(`/api/revenue/admin/by-course?${params.toString()}`),
        apiFetch(`/api/revenue/admin/by-date?${chartParams.toString()}`),
        apiFetch(`/api/revenue/admin/by-tag?${params.toString()}`),
      ]);

      setSummary(summaryRes);
      setByCourse(byCourseRes.data || []);
      setRevenueByDate(revenueByDateRes.data || []);
      setRevenueByTag(revenueByTagRes.data || []);
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
              <p className="text-2xl font-semibold text-gray-900">
                {summary ? (summary.today_transactions || 0) : '0'}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900">
                {summary ? (summary.total_courses || 0) : '0'}
              </p>
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
                {summary ? (summary.total_students || 0) : '0'}
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
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-500 text-sm">Đang tải...</p>
                </div>
              </div>
            ) : revenueByDate.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDate.map(item => ({
                  date: item.date,
                  revenue: Number(item.revenue), // Amount is already in VND
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                      return value.toString();
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                    labelFormatter={(label) => timeFrame === 'month' ? `Tháng: ${label}` : `Ngày: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#9333ea" 
                    strokeWidth={2}
                    name="Doanh thu"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue Distribution by Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố doanh thu theo Tags</h3>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-500 text-sm">Đang tải...</p>
                </div>
              </div>
            ) : revenueByTag.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByTag.map(item => ({
                      name: item.tag_name,
                      value: Number(item.total_revenue),
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByTag.map((entry, index) => {
                      const colors = [
                        '#9333ea', '#3b82f6', '#10b981', '#f59e0b', 
                        '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899',
                        '#84cc16', '#f97316', '#6366f1', '#14b8a6'
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => {
                      const item = revenueByTag.find(t => t.tag_name === value);
                      return `${value} (${item ? Number(item.total_revenue).toLocaleString('vi-VN') : 0} đ)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
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