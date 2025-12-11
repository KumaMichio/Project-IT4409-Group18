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
    // Check authentication and role
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

        if (!isMounted) return; // tránh setState sau khi unmount

        setOverview(overviewRes);
        setLogs(logsRes);
        setMaintenanceMode(maintenanceRes);
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        // If unauthorized, redirect to login
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Quản lý hệ thống</h2>

      {/* Maintenance Mode Toggle */}
      <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Maintenance Mode</h3>
            <p className="text-sm text-gray-600">
              Bật/tắt chế độ bảo trì hệ thống
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode.enabled}
              onChange={handleToggleMaintenance}
              disabled={isToggling}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {maintenanceMode.enabled ? 'Đang bật' : 'Đang tắt'}
            </span>
          </label>
        </div>
      </div>

      {/* Statistics Overview */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card label="Tổng người dùng" value={overview.total_users} />
          <Card label="Học viên" value={overview.total_students} />
          <Card label="Giảng viên" value={overview.total_instructors} />
          <Card
            label="Khóa học"
            value={`${overview.total_courses} (${overview.published_courses} đã publish)`}
          />
          <Card
            label="Giao dịch hôm nay"
            value={overview.today_transactions}
          />
          <Card
            label="Doanh thu tháng này"
            value={`${Number(
              overview.month_revenue || 0
            ).toLocaleString('vi-VN')} đ`}
          />
        </div>
      )}

      {/* Activity Logs */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">
          Activity logs mới nhất
        </h3>

        <div className="border rounded bg-white max-h-[400px] overflow-auto text-sm">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-1 text-left">Thời gian</th>
                <th className="border px-2 py-1 text-left">User</th>
                <th className="border px-2 py-1 text-left">Action</th>
                <th className="border px-2 py-1 text-left">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border px-2 py-4 text-center text-gray-500">
                    Chưa có log nào
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="border px-2 py-1">
                      {log.full_name || '(system)'}
                    </td>
                    <td className="border px-2 py-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="border px-2 py-1">
                      <pre className="whitespace-pre-wrap text-xs max-w-md overflow-auto">
                        {JSON.stringify(log.detail, null, 2)}
                      </pre>
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

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-lg bg-white p-3 shadow-sm">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
