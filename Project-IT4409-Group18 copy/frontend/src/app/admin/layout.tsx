'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUser, getToken } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    async function checkAuth() {
      const token = getToken();
      const userData = getUser();

      if (!token || !userData) {
        router.replace('/auth/login');
        return;
      }

      const userRole = userData.role?.toLowerCase();
      if (userRole !== 'admin') {
        router.replace('/');
        return;
      }

      setIsChecking(false);
    }

    checkAuth();
  }, [router]);

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  const currentUser = user || getUser();
  const userRole = currentUser?.role?.toLowerCase();

  if (userRole !== 'admin') {
    return null;
  }

  const menuItems = [
    { path: '/admin/system', label: 'Hệ thống', icon: '📊' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥' },
    { path: '/admin/revenue', label: 'Doanh thu', icon: '💰' },
  ];

  const getPageTitle = () => {
    if (pathname === '/admin/system') return 'Quản lý hệ thống';
    if (pathname === '/admin/users') return 'Quản lý người dùng';
    if (pathname === '/admin/revenue') return 'Quản lý doanh thu';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Logo</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              router.replace('/auth/login');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>→</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h2>
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <span className="text-gray-600 text-sm">📅</span>
                <span className="text-sm text-gray-700">Jan 2024 → Dec 2024</span>
              </div>
              {/* Search Icon */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                🔍
              </button>
              {/* Dark Mode Toggle */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                🌙
              </button>
              {/* Expand Icon */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                ⛶
              </button>
              {/* Add Widget Icon */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                +
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
