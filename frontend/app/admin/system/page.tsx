'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

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

export default function AdminSystemPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [overviewRes, logsRes] = await Promise.all([
          apiFetch('/api/admin/system/overview'),
          apiFetch('/api/admin/system/logs?limit=50'),
        ]);

        if (!isMounted) return; // tránh setState sau khi unmount

        setOverview(overviewRes);
        setLogs(logsRes);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Quản lý hệ thống</h2>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card label="Tổng người dùng" value={overview.total_users} />
          <Card label="Học viên" value={overview.total_students} />
          <Card label="Giảng viên" value={overview.total_instructors} />
          <Card
            label="Khóa học"
            value={`${overview.total_courses} (${overview.published_courses} publish)`}
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

      <h3 className="text-lg font-semibold mb-2">
        Activity logs mới nhất
      </h3>

      <div className="border rounded bg-white max-h-[400px] overflow-auto text-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Thời gian</th>
              <th className="border px-2 py-1">User</th>
              <th className="border px-2 py-1">Action</th>
              <th className="border px-2 py-1">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id}>
                <td className="border px-2 py-1 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('vi-VN')}
                </td>
                <td className="border px-2 py-1">
                  {log.full_name || '(system)'}
                </td>
                <td className="border px-2 py-1">{log.action}</td>
                <td className="border px-2 py-1">
                  <pre className="whitespace-pre-wrap text-xs">
                    {JSON.stringify(log.detail, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
