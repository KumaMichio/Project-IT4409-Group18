'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { SearchDropdown } from './SearchDropdown';
import { CartIcon } from '@/components/cart/CartIcon';
import { CartDropdown } from '@/components/cart/CartDropdown';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get full avatar URL
const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  // Static files are served from /uploads (not /api/uploads)
  const baseUrl = API_BASE_URL.replace('/api', '');
  const fullUrl = `${baseUrl}${avatarUrl}`;
  // Add timestamp to bust browser cache
  return `${fullUrl}?t=${Date.now()}`;
};

export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    setIsSearchOpen(keyword.trim().length > 0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setIsSearchOpen(false);
      router.push(`/courses?q=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleSelectCourse = (courseId: number) => {
    setIsSearchOpen(false);
    setSearchKeyword('');
    router.push(`/courses/${courseId}`);
  };

  const handleSearchFocus = () => {
    if (searchKeyword.trim()) {
      setIsSearchOpen(true);
    }
  };

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsProfileDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Online Courses</span>
          </Link>

          {/* Search Bar - Center, same row as logo */}
          <div className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchKeyword}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-12 pr-10 py-2.5 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-gray-300 transition-all"
              />
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </form>
            
            {/* Search Dropdown */}
            {isSearchOpen && (
              <SearchDropdown
                keyword={searchKeyword}
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectCourse={handleSelectCourse}
              />
            )}
          </div>

          {/* Right side - Navigation & Auth */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/courses" className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                Khóa học
              </Link>
              {isAuthenticated && (
                <Link href="/my-courses" className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                  Khóa học của tôi
                </Link>
              )}
            </nav>

            {/* Cart Icon - Right, before auth buttons */}
            {isAuthenticated && (
              <div className="relative flex-shrink-0">
                <CartIcon onClick={() => setIsCartOpen(!isCartOpen)} />
                {isCartOpen && (
                  <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                )}
              </div>
            )}

            {/* Auth Buttons / User Avatar */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  {/* Avatar */}
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    onMouseEnter={() => setIsProfileDropdownOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    {user?.avatar_url && getAvatarUrl(user.avatar_url) ? (
                      <img
                        key={user.avatar_url}
                        src={getAvatarUrl(user.avatar_url)!}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div
                      onMouseLeave={() => setIsProfileDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/my-courses"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Khóa học của tôi
                      </Link>

                      <Link
                        href="/cart"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Giỏ hàng
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Chỉnh sửa hồ sơ
                      </Link>

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/register">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition text-sm">
                      Đăng ký
                    </button>
                  </Link>
                  <Link href="/auth/login">
                    <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-full font-medium hover:bg-blue-50 transition text-sm">
                      Đăng nhập
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
