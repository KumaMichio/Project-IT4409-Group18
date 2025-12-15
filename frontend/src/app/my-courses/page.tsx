'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/apiClient';
import { LoadingOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { normalizeImageUrl } from '@/utils/imageUrl';

interface EnrolledCourse {
  enrollment_id: number;
  enrollment_status: string;
  enrolled_at: string;
  expires_at: string | null;
  course: {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string;
    price_cents: number;
    currency: string;
    instructor: {
      id: number;
      name: string;
      avatar_url: string | null;
    };
    avg_rating: number;
    review_count: number;
  };
  progress: {
    percent: number;
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Fetch enrolled courses
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/enrollments/my-courses');
        setEnrollments(response.data.data.enrollments || []);
      } catch (err: any) {
        console.error('Failed to fetch enrollments:', err);
        if (err.response?.status === 401) {
          router.push('/auth/login');
        } else {
          setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [isAuthenticated, authLoading, router]);

  const formatPrice = (cents: number) => {
    if (cents === 0) {
      return 'Miễn phí';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <LoadingOutlined className="text-6xl text-blue-600 mb-4 animate-spin" />
            <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
          </div>
        </main>
      </div>
    );
  }

  // Redirect if not authenticated (will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Khóa học của tôi</h1>
          <p className="text-gray-600">
            Danh sách các khóa học bạn đã đăng ký
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingOutlined className="text-6xl text-blue-600 mb-4 animate-spin" />
            <p className="text-gray-600">Đang tải khóa học...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có khóa học nào</h2>
              <p className="text-gray-600 mb-6">
                Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học có sẵn!
              </p>
              <Link href="/courses">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  Khám phá khóa học
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.enrollment_id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full"
              >
                <Link href={`/courses/${enrollment.course.id}`}>
                  <div className="relative h-48 bg-gray-200">
                    {enrollment.course.thumbnail_url ? (
                      <Image
                        src={normalizeImageUrl(enrollment.course.thumbnail_url)}
                        alt={enrollment.course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {/* Progress overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${enrollment.progress.percent}%` }}
                      />
                    </div>
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-grow">
                  <Link href={`/courses/${enrollment.course.id}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition min-h-[3.5rem]">
                      {enrollment.course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-3">
                    {enrollment.course.instructor.name}
                  </p>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Tiến độ</span>
                      <span className="text-xs font-medium text-blue-600">
                        {Math.round(enrollment.progress.percent)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">
                      {enrollment.course.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({enrollment.course.review_count})
                    </span>
                  </div>

                  {/* Enrolled date */}
                  <p className="text-xs text-gray-500 mb-3">
                    Đăng ký: {formatDate(enrollment.enrolled_at)}
                  </p>

                  {/* Continue learning button - pushed to bottom */}
                  <div className="mt-auto">
                    <Link href={`/courses/${enrollment.course.id}`}>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        <PlayCircleOutlined />
                        Tiếp tục học
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

