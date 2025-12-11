'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUser, getToken } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Chỉ check một lần khi component mount
    if (hasChecked.current) return;
    hasChecked.current = true;

    async function checkAuth() {
      const token = getToken();
      const userData = getUser();

      // Nếu không có token hoặc user data, redirect về login
      if (!token || !userData) {
        router.replace('/auth/login');
        return;
      }

      // Nếu user không phải admin, redirect về home
      const userRole = userData.role?.toLowerCase();
      if (userRole !== 'admin') {
        router.replace('/');
        return;
      }

      // Nếu đã có user data hợp lệ, không cần verify lại với server
      // Chỉ verify khi cần thiết (ví dụ: khi token có nhưng user data không có)
      setIsChecking(false);
    }

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount

  // Show loading while checking or initial load
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Get user from localStorage if useAuth hasn't loaded yet
  const currentUser = user || getUser();
  const userRole = currentUser?.role?.toLowerCase();

  // If user is not admin, don't render children (will redirect)
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex space-x-4">
                <a
                  href="/admin/system"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Quản lý hệ thống
                </a>
                <a
                  href="/admin/users"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Quản lý người dùng
                </a>
                <a
                  href="/admin/revenue"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Doanh thu
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentUser?.name || currentUser?.email}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Admin
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user_data');
                  router.replace('/auth/login');
                }}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

