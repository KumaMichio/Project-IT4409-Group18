'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getUser, getToken } from '@/lib/auth';

type Overview = {
  total_users: number;
  total_students: number;
  total_instructors: number;
  total_courses: number;
  published_courses: number;
  today_transactions: number;
  month_revenue: string;
};

type LogItem = {
  log_id: number;
  user_id: number | null;
  full_name: string | null;
  action: string;
  detail: Record<string, unknown>;
  created_at: string;
};

type MaintenanceMode = {
  enabled: boolean;
};

export default function AdminSystemPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>({ enabled: false });
  const [isToggling, setIsToggling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    let isMounted = true;

    async function fetchData() {
      try {
        const [overviewRes, logsRes, maintenanceRes] = await Promise.all([
          apiFetch('/api/admin/system/overview'),
          apiFetch('/api/admin/system/logs?limit=50'),
          apiFetch('/api/admin/system/maintenance-mode'),
        ]);

        if (!isMounted) return;

        setOverview(overviewRes);
        setLogs(logsRes);
        setMaintenanceMode(maintenanceRes);
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        if (err.message?.includes('401') || err.message?.includes('403')) {
          router.push('/auth/login');
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isLoading, router]);

  const handleToggleMaintenance = async () => {
    try {
      setIsToggling(true);
      const newValue = !maintenanceMode.enabled;
      const result = await apiFetch('/api/admin/system/maintenance-mode', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: newValue }),
      });
      setMaintenanceMode(result);
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err);
      alert('Không thể cập nhật maintenance mode. Vui lòng thử lại.');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            icon="👥"
            value={`${overview.total_users}+`}
            label="Tổng người dùng"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <SummaryCard
            icon="🎓"
            value={`${overview.total_students}+`}
            label="Học viên"
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <SummaryCard
            icon="👨‍🏫"
            value={`${overview.total_instructors}+`}
            label="Giảng viên"
            iconBg="bg-red-100"
            iconColor="text-red-600"
          />
          <SummaryCard
            icon="🚫"
            value={`${overview.total_courses - overview.published_courses}+`}
            label="Khóa chưa publish"
            iconBg="bg-gray-100"
            iconColor="text-gray-600"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tổng quan hệ thống</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Day</button>
              <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded font-medium">Week</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Month</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500 text-sm">Chart visualization</p>
            </div>
          </div>
        </div>

        {/* Courses Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố khóa học</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-500 text-sm">Donut chart visualization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-600">Bật/tắt chế độ bảo trì hệ thống</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode.enabled}
              onChange={handleToggleMaintenance}
              disabled={isToggling}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {maintenanceMode.enabled ? 'Đang bật' : 'Đang tắt'}
            </span>
          </label>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Chưa có log nào
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.full_name || '(system)'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <pre className="whitespace-pre-wrap text-xs max-w-md overflow-auto">
                        {JSON.stringify(log.detail, null, 2)}
                      </pre>
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
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  iconBg,
  iconColor,
}: {
  icon: string;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <span className={`text-2xl ${iconColor}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
