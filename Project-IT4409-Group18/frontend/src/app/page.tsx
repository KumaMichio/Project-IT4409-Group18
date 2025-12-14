'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { CourseCard } from '@/components/course/CourseCard';
import Button from '@/components/common/Button';
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

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses function - memoized
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 12 };
      const response = await apiClient.get('/courses', { params });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-blue-600">Online Course Platform</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Learn new skills, advance your career, and achieve your goals with
            our comprehensive online courses.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-gray-600 mb-4">
                You are logged in as{' '}
                <span className="font-semibold capitalize">{user?.role}</span>
              </p>
              {user?.role === 'student' && (
                <div className="flex space-x-4">
                  <Link href="/my-courses">
                    <Button variant="primary">My Courses</Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline">Browse All Courses</Button>
                  </Link>
                </div>
              )}
              {user?.role !== 'student' && (
                <div className="flex space-x-4">
                  <Link href="/courses">
                    <Button variant="primary">Browse Courses</Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin/system">
                      <Button variant="outline">Admin Dashboard</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Get Started Today
              </h2>
              <p className="text-gray-600 mb-6">
                Join thousands of students learning new skills and advancing
                their careers.
              </p>
              <div className="flex space-x-4 justify-center">
                <Link href="/auth/register">
                  <Button variant="primary" size="lg">
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Course List Section - Visible to everyone */}
        <div className="mt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Tất cả khóa học
            </h2>
            <p className="text-gray-600">
              Khám phá các khóa học được cung cấp bởi các giảng viên chuyên nghiệp
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              {courses.length >= 12 && (
                <div className="mt-8 text-center">
                  <Link href="/courses">
                    <Button variant="outline" size="lg">
                      Xem tất cả khóa học
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert Instructors
              </h3>
              <p className="text-gray-600">
                Learn from industry experts with years of real-world experience.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flexible Learning
              </h3>
              <p className="text-gray-600">
                Study at your own pace, anytime, anywhere. No deadlines or
                pressure.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Certificate of Completion
              </h3>
              <p className="text-gray-600">
                Get certified upon course completion to showcase your skills.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}