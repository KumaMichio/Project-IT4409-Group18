'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { SearchOutlined } from '@ant-design/icons';

interface Course {
  id: number;
  title: string;
  thumbnail_url: string;
  instructor_name: string;
  price_cents: number;
}

interface SearchDropdownProps {
  keyword: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (courseId: number) => void;
}

export function SearchDropdown({ keyword, isOpen, onClose, onSelectCourse }: SearchDropdownProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !keyword.trim()) {
      setSuggestions([]);
      setCourses([]);
      return;
    }

    const searchCourses = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/courses', {
          params: { q: keyword.trim(), limit: 5 }
        });
        
        const results = response.data.courses || [];
        setCourses(results);
        
        // Generate suggestions from course titles (unique titles only)
        const titleSuggestions = Array.from(
          new Set(
            results
              .map((c: Course) => c.title)
              .filter((title: string) => title.toLowerCase().includes(keyword.toLowerCase()))
          )
        ).slice(0, 5);
        setSuggestions(titleSuggestions);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(searchCourses, 300);
    return () => clearTimeout(timeout);
  }, [keyword, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !keyword.trim()) {
    return null;
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[500px] overflow-y-auto"
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm">Đang tìm kiếm...</p>
        </div>
      ) : (
        <>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Gợi ý tìm kiếm
              </div>
              {suggestions.map((suggestion, index) => {
                // Find course by title
                const course = courses.find(c => c.title === suggestion);
                return (
                  <button
                    key={index}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => {
                      if (course?.id) {
                        onSelectCourse(course.id);
                      }
                    }}
                  >
                    <SearchOutlined className="text-gray-400" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Course Results */}
          {courses.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                Khóa học
              </div>
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-10 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-gray-400 text-xs ${course.thumbnail_url ? 'hidden' : ''}`}>
                        No Img
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.instructor_name}
                      </p>
                      <p className="text-sm font-semibold text-red-600 mt-1">
                        {formatPrice(course.price_cents)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && suggestions.length === 0 && courses.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Không tìm thấy kết quả nào
            </div>
          )}
        </>
      )}
    </div>
  );
}

