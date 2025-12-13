'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { SearchDropdown } from './SearchDropdown';
import { CartIcon } from '@/components/cart/CartIcon';
import { CartDropdown } from '@/components/cart/CartDropdown';

export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 font-medium text-sm hidden sm:block">
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition text-sm"
                  >
                    Đăng xuất
                  </button>
                </>
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
