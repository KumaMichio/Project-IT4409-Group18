'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUser, getToken } from '@/lib/auth';

export default function InstructorLayout({
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
      if (userRole !== 'teacher') {
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

  if (userRole !== 'teacher') {
    return null;
  }

  const menuItems = [
    { path: '/instructor/courses', label: 'Khóa học', icon: '📚' },
    { path: '/instructor/students', label: 'Học viên', icon: '👥' },
    { path: '/instructor/revenue', label: 'Doanh thu', icon: '💰' },
  ];

  const getPageTitle = () => {
    if (pathname === '/instructor/courses') return 'Quản lý khóa học';
    if (pathname?.startsWith('/instructor/courses/')) return 'Chi tiết khóa học';
    if (pathname === '/instructor/students') return 'Quản lý học viên';
    if (pathname === '/instructor/revenue') return 'Doanh thu';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Giảng viên</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path === '/instructor/courses' && pathname?.startsWith('/instructor/courses/'));
            return (
              <a
                key={item.path}
                href={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
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

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{currentUser?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500">{currentUser?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              router.replace('/auth/login');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>→</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h2>
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

