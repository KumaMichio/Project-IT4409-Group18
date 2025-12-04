'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type RevenueItem = {
  course_id: number;
  course_title: string;
  total_revenue: string;
  total_students: number;
};

export default function InstructorRevenuePage() {
  const [data, setData] = useState<RevenueItem[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const loadData = async () => {
    const params = new URLSearchParams();
    if (from) params.append('from', new Date(from).toISOString());
    if (to) params.append('to', new Date(to).toISOString());

    const res = await apiFetch(
      `/api/revenue/instructor/my-courses?${params.toString()}`
    );
    setData(res.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Doanh thu khóa học của tôi
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={loadData}
          className="px-3 py-1 border rounded hover:bg-gray-50"
        >
          Lọc
        </button>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Khóa học</th>
            <th className="border px-2 py-1 text-right">
              Số học viên
            </th>
            <th className="border px-2 py-1 text-right">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.course_id}>
              <td className="border px-2 py-1">{row.course_title}</td>
              <td className="border px-2 py-1 text-right">
                {row.total_students}
              </td>
              <td className="border px-2 py-1 text-right">
                {Number(row.total_revenue || 0).toLocaleString('vi-VN')} đ
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
