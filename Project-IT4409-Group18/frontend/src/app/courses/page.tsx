'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CourseCard } from '@/components/course/CourseCard';
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
  const [totalResults, setTotalResults] = useState(0);

  // Fetch courses function - memoized
  const fetchCourses = useCallback(async (keyword: string = '') => {
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 50 };
      const trimmedKeyword = keyword ? keyword.trim() : '';
      
      if (trimmedKeyword) {
        params.q = trimmedKeyword;
      }
      
      const response = await apiClient.get('/api/courses', { params });
      setCourses(response.data.courses || []);
      setTotalResults(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - only when searchParams change
  useEffect(() => {
    const initialKeyword = searchParams.get('q') || '';
    setSearchKeyword(initialKeyword);
    fetchCourses(initialKeyword);
  }, [searchParams, fetchCourses]);

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

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chưa có khóa học nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

