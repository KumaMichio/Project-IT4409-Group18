'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseCardSkeleton } from '@/components/course/CourseCardSkeleton';
import { FilterSidebar, FilterState } from '@/components/course/FilterSidebar';
import apiClient from '@/lib/apiClient';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  price_cents: number;
  currency: string;
  instructor_name: string;
  instructor_id: number;
  avg_rating: number;
  enrollment_count: number;
  review_count: number;
}

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [courses, setCourses] = useState<Course[]>([]);
  const [displayCourses, setDisplayCourses] = useState<Course[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoadingNew, setIsLoadingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: searchParams.get('price_range') || null,
    minRating: searchParams.get('min_rating') || null,
    sortBy: searchParams.get('sort_by') || null,
    sortOrder: searchParams.get('sort_order') || 'desc',
  });

  // Fetch courses function - memoized
  const fetchCourses = useCallback(async (keyword: string = '', currentFilters: FilterState, isInitialLoad: boolean = false) => {
    // Only show full loading spinner on initial load
    if (isInitialLoad) {
      setInitialLoading(true);
    } else {
      // For filter changes, keep old courses visible
      setIsLoadingNew(true);
    }
    
    setError(null);
    try {
      const params: any = { page: 1, limit: 50 };
      const trimmedKeyword = keyword ? keyword.trim() : '';
      
      if (trimmedKeyword) {
        params.q = trimmedKeyword;
      }
      
      // Add filter params
      if (currentFilters.priceRange) {
        params.price_range = currentFilters.priceRange;
      }
      if (currentFilters.minRating) {
        params.min_rating = currentFilters.minRating;
      }
      if (currentFilters.sortBy) {
        params.sort_by = currentFilters.sortBy;
        params.sort_order = currentFilters.sortOrder;
      }
      
      const response = await apiClient.get('/courses', { params });
      const newCourses = response.data.courses || [];
      
      // Update courses state
      setCourses(newCourses);
      setTotalResults(response.data.pagination?.total || 0);
      
      // Smooth transition: fade out old, fade in new
      if (!isInitialLoad) {
        // Fade out old courses, then fade in new
        setTimeout(() => {
          setDisplayCourses(newCourses);
          setIsLoadingNew(false);
        }, 150);
      } else {
        // Initial load - show immediately
        setDisplayCourses(newCourses);
        setIsLoadingNew(false);
      }
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể tải danh sách khóa học. Vui lòng thử lại sau.';
      setError(errorMessage);
      setCourses([]);
      setDisplayCourses([]);
      setTotalResults(0);
      setIsLoadingNew(false);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // Initial load - when searchParams change
  useEffect(() => {
    const initialKeyword = searchParams.get('q') || '';
    const initialFilters: FilterState = {
      priceRange: searchParams.get('price_range') || null,
      minRating: searchParams.get('min_rating') || null,
      sortBy: searchParams.get('sort_by') || null,
      sortOrder: searchParams.get('sort_order') || 'desc',
    };
    
    setSearchKeyword(initialKeyword);
    setFilters(initialFilters);
    fetchCourses(initialKeyword, initialFilters, true);
  }, [searchParams, fetchCourses]);

  // Handle filter change with smooth transition
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Use startTransition for smooth updates
    startTransition(() => {
      fetchCourses(searchKeyword, newFilters, false);
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchKeyword ? `Kết quả tìm kiếm: "${searchKeyword}"` : 'Tất cả khóa học'}
          </h1>
          <p className="text-gray-600">
            {searchKeyword 
              ? `Tìm thấy ${totalResults} khóa học`
              : 'Khám phá các khóa học được cung cấp bởi các giảng viên chuyên nghiệp'
            }
          </p>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <FilterSidebar onFilterChange={handleFilterChange} isLoading={isPending || isLoadingNew} />
          </aside>

          {/* Course List */}
          <div className="flex-1">
            {initialLoading ? (
              // Initial load - show skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <CourseCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-red-700 font-semibold mb-2">⚠️ Lỗi khi tải dữ liệu</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={() => fetchCourses(searchKeyword, filters, true)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : displayCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                  <p className="text-gray-700 font-semibold mb-2">Không tìm thấy khóa học</p>
                  <p className="text-gray-600 text-sm">
                    {searchKeyword || filters.priceRange || filters.minRating || filters.sortBy
                      ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.'
                      : 'Chưa có khóa học nào trong hệ thống.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Subtle loading indicator when filtering */}
                {(isPending || isLoadingNew) && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-blue-600">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Đang tải kết quả...</span>
                  </div>
                )}
                
                {totalResults > 0 && !isPending && !isLoadingNew && (
                  <div className="mb-4 text-sm text-gray-600">
                    Hiển thị <span className="font-semibold">{displayCourses.length}</span> trong tổng số{' '}
                    <span className="font-semibold">{totalResults}</span> khóa học
                  </div>
                )}
                
                <div 
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${
                    isLoadingNew ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  {displayCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

