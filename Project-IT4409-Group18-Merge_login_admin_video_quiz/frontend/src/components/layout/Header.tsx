'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchOutlined } from '@ant-design/icons';

export function Header() {
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-4 pr-10 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <SearchOutlined className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
              Trang chủ
            </Link>
            <Link href="/courses" className="text-gray-700 hover:text-gray-900 font-medium">
              Khóa học
            </Link>
            <Link href="/instructors" className="text-gray-700 hover:text-gray-900 font-medium">
              Giảng viên
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">
              About
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 ml-6">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition">
              Đăng ký
            </button>
            <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-full font-medium hover:bg-blue-50 transition">
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
