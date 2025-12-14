'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  price_cents: number;
  currency: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  total_students: number;
  total_modules: number;
  total_lessons: number;
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ courses: Course[] }>('/api/courses/instructor/my-courses');
      setCourses(response.data.courses);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải danh sách khóa học');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/courses/instructor/my-courses/${courseId}`);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa khóa học');
    }
  };

  const handlePublishToggle = async (course: Course) => {
    try {
      await apiClient.put(`/api/courses/instructor/my-courses/${course.id}`, {
        is_published: !course.is_published,
      });
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
        <button
          onClick={() => router.push('/instructor/courses/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tạo khóa học mới
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">Bạn chưa có khóa học nào</p>
          <button
            onClick={() => router.push('/instructor/courses/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo khóa học đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {course.description || 'Không có mô tả'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{course.total_modules} mô-đun</span>
                  <span>{course.total_lessons} bài học</span>
                  <span>{course.total_students} học viên</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    course.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {course.price_cents === 0 ? 'Miễn phí' : `${(course.price_cents / 100).toLocaleString('vi-VN')} ${course.currency}`}
                  </span>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => router.push(`/instructor/courses/${course.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handlePublishToggle(course)}
                    className="px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm"
                  >
                    {course.is_published ? 'Ẩn' : 'Xuất bản'}
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

