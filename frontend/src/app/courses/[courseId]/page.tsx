'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { CheckCircleTwoTone, UserOutlined, StarFilled, MinusOutlined, PlusOutlined, PlayCircleOutlined, FileTextOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Rate, Input } from 'antd';

const { TextArea } = Input;
import { Header } from '../../../components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/lib/toast';
import ReviewForm from '../../../components/review/ReviewForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  if (!avatarPath) return '';
  
  // If already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // Remove /api/ from base URL for static files
  const baseUrl = API_BASE_URL.replace('/api', '');
  const fullUrl = `${baseUrl}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
  
  // Add timestamp to bust cache
  return `${fullUrl}?t=${Date.now()}`;
};

interface Module {
  id: number;
  title: string;
  position: number;
  lessons?: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  lesson_type: string;
  duration_s: number;
  position: number;
}

interface CourseDetail {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail_url: string;
    price_cents: number;
    currency: string;
    instructor_id: number;
    instructor_name: string;
    instructor_avatar: string;
    instructor_bio: string;
    instructor_headline: string;
    total_students: number;
    total_lessons: number;
    total_duration_s: number;
    total_modules: number;
  };
  modules: Module[];
  rating: {
    average: string;
    total_reviews: number;
    rating_distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    student_id: number;
    student_name: string;
    student_avatar: string;
  }>;
  enrollment: {
    enrolled: boolean;
    status?: string;
    enrolled_at?: string;
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, isCourseInCart, actionLoading } = useCart();
  const courseId = params?.courseId as string;

  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [relatedCourses, setRelatedCourses] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [updatingReview, setUpdatingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState<any>(null);

  useEffect(() => {
    fetchCourseDetail();
    fetchRelatedCourses();
    if (user) {
      fetchMyReview();
    }
  }, [courseId, user]);

  const fetchRelatedCourses = async () => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/related`);
      setRelatedCourses(response.data);
    } catch (error: any) {
      console.error('Error fetching related courses:', error);
      console.error('Error details:', error.response?.data);
      // If API fails, keep empty array
      setRelatedCourses([]);
    }
  };

  const fetchCourseDetail = async () => {
    try {
      // Get course detail - token will be sent automatically via apiClient
      // This now includes modules and lessons for all users
      const detailResponse = await apiClient.get(`/courses/${courseId}`);
      setCourseDetail(detailResponse.data);
    } catch (error) {
      console.error('Error fetching course detail:', error);
      alert('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      setLoadingReview(true);
      const response = await apiClient.get(`/reviews/courses/${courseId}/my-review`);
      setMyReview(response.data.review);
    } catch (error) {
      console.error('Error fetching my review:', error);
      setMyReview(null);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleReviewSuccess = () => {
    fetchMyReview();
    fetchCourseDetail(); // Refresh to update ratings
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleUpdateReview = async (reviewId: number) => {
    if (editRating === 0) {
      toast.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      setUpdatingReview(true);
      await apiClient.put(`/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment
      });
      toast.success('Đã cập nhật đánh giá thành công!');
      setEditingReviewId(null);
      fetchMyReview();
      fetchCourseDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể cập nhật đánh giá');
    } finally {
      setUpdatingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await apiClient.delete(`/reviews/${reviewId}`);
      toast.success('Đã xóa đánh giá thành công');
      setMyReview(null);
      setDeletingReview(null);
      fetchCourseDetail(); // Refresh to update ratings
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể xóa đánh giá');
      console.error('Error deleting review:', error);
    }
  };

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('vi-VN').format(cents) + ' đ';
  };

  const formatOriginalPrice = (cents: number) => {
    const originalPrice = Math.floor(cents * 1.6); // Assuming 37.5% discount
    return new Intl.NumberFormat('vi-VN').format(originalPrice) + ' đ';
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/auth/login');
      return;
    }

    if (!courseDetail) return;

    // If course is free (price = 0), enroll directly instead of adding to cart
    if (courseDetail.course.price_cents === 0) {
      try {
        setAddingToCart(true);
        const response = await apiClient.post('/enrollments/enroll', {
          courseId: courseDetail.course.id
        });
        toast.success('Đã đăng ký khóa học miễn phí thành công!');
        // Refresh course detail to show enrolled state
        await fetchCourseDetail();
        // Redirect to learning page
        setTimeout(() => {
          router.push(`/courses/${courseId}/learn`);
        }, 500);
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Không thể đăng ký khóa học';
        toast.error(errorMessage);
        console.error('Error enrolling in free course:', error);
      } finally {
        setAddingToCart(false);
      }
      return;
    }

    // Paid course - normal flow
    // Check if already in cart
    if (isCourseInCart(courseDetail.course.id)) {
      toast.info('Khóa học đã có trong giỏ hàng');
      router.push('/cart');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(courseDetail.course.id, {
        title: courseDetail.course.title,
        slug: courseDetail.course.title.toLowerCase().replace(/\s+/g, '-'),
        description: courseDetail.course.description,
        thumbnail_url: courseDetail.course.thumbnail_url,
        price_cents: courseDetail.course.price_cents,
        currency: courseDetail.course.currency,
        instructor_id: courseDetail.course.instructor_id,
        instructor_name: courseDetail.course.instructor_name,
      });
      // Redirect to cart page after successful add
      setTimeout(() => {
        router.push('/cart');
      }, 500);
    } catch (error: any) {
      // Error already handled in useCart with toast
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để mua khóa học');
      router.push('/auth/login');
      return;
    }

    if (!courseDetail) return;

    // If course is free (price = 0), enroll directly
    if (courseDetail.course.price_cents === 0) {
      try {
        setAddingToCart(true);
        const response = await apiClient.post('/enrollments/enroll', {
          courseId: courseDetail.course.id
        });
        toast.success('Đã đăng ký khóa học miễn phí thành công!');
        // Refresh course detail to show enrolled state
        await fetchCourseDetail();
        // Redirect to learning page
        setTimeout(() => {
          router.push(`/courses/${courseId}/learn`);
        }, 500);
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Không thể đăng ký khóa học';
        toast.error(errorMessage);
        console.error('Error enrolling in free course:', error);
      } finally {
        setAddingToCart(false);
      }
      return;
    }

    // Paid course - normal flow
    // If already in cart, just redirect to checkout
    if (isCourseInCart(courseDetail.course.id)) {
      router.push('/payments/checkout');
      return;
    }

    // Add to cart first, then redirect to checkout
    try {
      setAddingToCart(true);
      await addToCart(courseDetail.course.id, {
        title: courseDetail.course.title,
        slug: courseDetail.course.title.toLowerCase().replace(/\s+/g, '-'),
        description: courseDetail.course.description,
        thumbnail_url: courseDetail.course.thumbnail_url,
        price_cents: courseDetail.course.price_cents,
        currency: courseDetail.course.currency,
        instructor_id: courseDetail.course.instructor_id,
        instructor_name: courseDetail.course.instructor_name,
      });
      // Small delay to show success toast before redirect
      setTimeout(() => {
        router.push('/payments/checkout');
      }, 500);
    } catch (error: any) {
      // Error already handled in useCart with toast
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleStartLearning = () => {
    router.push(`/courses/${courseId}/learn`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!courseDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Không tìm thấy khóa học</div>
      </div>
    );
  }

  const { course, modules, rating, reviews, enrollment } = courseDetail;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with reduced height */}
      <div className="bg-gray-900 text-white py-8 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2 pb-32">
              <div className="mb-3">
                <span className="bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded font-medium">
                  Bán chạy nhất
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-4">{course.description}</p>
              
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">
                    {rating.average}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarFilled
                        key={star}
                        className={`text-xs ${
                          star <= parseFloat(rating.average)
                            ? 'text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-300">
                    ({rating.total_reviews} đánh giá)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  <span>{course.total_students} học viên</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span>Giảng viên:</span>
                <span className="font-semibold text-blue-400 hover:underline cursor-pointer">
                  {course.instructor_name}
                </span>
              </div>
            </div>

            {/* Right: Placeholder for sidebar positioning */}
            <div className="lg:col-span-1"></div>
          </div>
        </div>

        {/* Sidebar - Positioned absolute to overlay banner */}
        <div className="absolute top-8 right-0 w-full lg:w-auto lg:right-[calc((100%-1280px)/2+2rem)] z-10 px-4 lg:px-0">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-[340px] ml-auto">
            <div className="relative">
              <img
                src={course.thumbnail_url || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <PlayCircleOutlined className="text-white text-6xl hover:scale-110 transition cursor-pointer" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <div className="text-3xl font-bold text-red-600">
                  {formatPrice(course.price_cents)}
                </div>
                <div className="text-lg text-gray-400 line-through">
                  {formatOriginalPrice(course.price_cents)}
                </div>
              </div>

              {enrollment.enrolled ? (
                <button
                  onClick={handleStartLearning}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-2"
                >
                  Vào học ngay
                </button>
              ) : (
                <>
                  {isCourseInCart(course.id) ? (
                    <Link href="/cart">
                      <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mb-2 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Chuyển tới giỏ hàng
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || actionLoading?.add === course.id}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingToCart || actionLoading?.add === course.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang thêm...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Thêm vào giỏ hàng</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleBuyNow}
                    disabled={isCourseInCart(course.id) || addingToCart}
                    className="w-full border-2 border-gray-900 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mua ngay
                  </button>
                </>
              )}

              <div className="text-center text-xs text-gray-500 mb-4">
                Đảm bảo hoàn tiền trong 30 ngày
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-3 text-gray-900">Khóa học này bao gồm:</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <PlayCircleOutlined className="text-gray-700" />
                    <span>{formatDuration(course.total_duration_s)} video theo yêu cầu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-gray-700" />
                    <span>1 bài viết</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-gray-700" />
                    <span>8 tài nguyên có thể tải xuống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                    <span>Truy cập trên thiết bị di động và TV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Quyền truy cập đầy đủ suốt đời</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {enrollment.enrolled && modules.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold mb-4">Những gì bạn sẽ học</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modules.slice(0, 6).map((module) => (
                    <div key={module.id} className="flex items-start gap-2">
                      <CheckCircleTwoTone twoToneColor="#52c41a" className="mt-1 flex-shrink-0" />
                      <span className="text-sm">{module.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-4">Nội dung khóa học</h2>
              <div className="mb-4 text-sm text-gray-600">
                {course.total_modules} phần • {course.total_lessons} bài giảng •{' '}
                {formatDuration(course.total_duration_s)}
              </div>

              {modules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Đang tải nội dung khóa học...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {modules.map((module) => {
                  const isExpanded = expandedModules.has(module.id);
                  const hasLessons = module.lessons && module.lessons.length > 0;
                  const totalLessons = module.lessons?.length || 0;
                  const totalDuration = module.lessons?.reduce((sum, lesson) => sum + (lesson.duration_s || 0), 0) || 0;
                  
                  return (
                    <div key={module.id} className="border border-gray-300 rounded overflow-hidden">
                      <div 
                        className={`p-4 flex justify-between items-center ${
                          hasLessons ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                        } transition bg-white`}
                        onClick={() => hasLessons && toggleModule(module.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-bold text-gray-900">
                            {module.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {hasLessons && (
                            <>
                              {isExpanded ? (
                                <MinusOutlined className="text-gray-600 text-lg font-bold" />
                              ) : (
                                <PlusOutlined className="text-gray-600 text-lg font-bold" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {isExpanded && hasLessons && (
                        <div className="bg-white border-t border-gray-300">
                          {module.lessons.map((lesson) => (
                            <div 
                              key={lesson.id} 
                              onClick={() => {
                                if (enrollment.enrolled) {
                                  // Navigate to learning page with the lesson
                                  router.push(`/courses/${courseId}/learn?lessonId=${lesson.id}`);
                                } else {
                                  // Show message to enroll
                                  toast.warning('Vui lòng đăng ký khóa học để xem bài học này');
                                }
                              }}
                              className={`px-4 py-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0 ${
                                enrollment.enrolled 
                                  ? 'hover:bg-gray-50 cursor-pointer' 
                                  : 'cursor-not-allowed opacity-75'
                              }`}
                            >
                              <PlayCircleOutlined 
                                className="text-xl flex-shrink-0" 
                                style={{ color: enrollment.enrolled ? '#00ADEF' : '#9CA3AF' }} 
                              />
                              <span 
                                className={`font-medium ${
                                  enrollment.enrolled ? 'hover:underline' : ''
                                }`}
                                style={{ color: enrollment.enrolled ? '#00ADEF' : '#9CA3AF' }}
                              >
                                {lesson.title}
                              </span>
                              {!enrollment.enrolled && (
                                <span className="ml-auto text-xs text-gray-400">
                                  🔒
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              )}
            </div>

            {/* Instructor Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold mb-6">Giảng viên</h2>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  {course.instructor_avatar ? (
                    <img
                      src={course.instructor_avatar}
                      alt={course.instructor_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserOutlined className="text-3xl text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1" style={{ color: '#00ADEF' }}>
                    {course.instructor_name}
                  </h3>
                  {course.instructor_headline && (
                    <div className="text-sm text-gray-600 mb-3">{course.instructor_headline}</div>
                  )}
                  {course.instructor_bio && (
                    <p className="text-gray-700 leading-relaxed">{course.instructor_bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Review Form Section - Only show if no review yet */}
            {enrollment.enrolled && user && !myReview && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <ReviewForm
                  courseId={courseId}
                  onSuccess={handleReviewSuccess}
                />
              </div>
            )}
          </div>

          {/* Right: Empty for spacing */}
          <div className="lg:col-span-1"></div>
        </div>

        {/* Related Courses - Full Width */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Học viên khác cũng mua</h2>
          {relatedCourses.length > 0 ? (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
                {relatedCourses.map((relatedCourse) => (
                  <div 
                    key={relatedCourse.id} 
                    className="bg-white rounded-lg shadow-sm border overflow-hidden flex-shrink-0 cursor-pointer hover:shadow-lg transition"
                    style={{ width: '320px' }}
                    onClick={() => router.push(`/courses/${relatedCourse.id}`)}
                  >
                    <img
                      src={relatedCourse.thumbnail_url || '/placeholder-course.jpg'}
                      alt={relatedCourse.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-2 line-clamp-2 min-h-[48px]">
                        {relatedCourse.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{relatedCourse.instructor_name}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-500 font-bold">
                          {parseFloat(relatedCourse.avg_rating).toFixed(1)}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarFilled
                              key={star}
                              className={`text-xs ${
                                star <= Math.round(parseFloat(relatedCourse.avg_rating)) 
                                  ? 'text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({relatedCourse.total_students})
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-red-600">{formatPrice(relatedCourse.price_cents)}</span>
                        {relatedCourse.price_cents > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatOriginalPrice(relatedCourse.price_cents)}
                          </span>
                        )}
                      </div>
                      {relatedCourse.total_students > 100 && (
                        <div className="mt-2">
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Bán chạy nhất
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Không có khóa học liên quan
            </div>
          )}
        </div>

        {/* Student Reviews - Testimonial Style */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-8 text-center">Đánh giá của học viên</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="bg-white rounded-lg shadow-sm border p-6 flex flex-col relative"
                >
                  {editingReviewId === review.id ? (
                    // Inline Edit Form
                    <>
                      <h3 className="text-lg font-semibold mb-4">Chỉnh sửa đánh giá</h3>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Đánh giá của bạn:</p>
                        <Rate
                          value={editRating}
                          onChange={setEditRating}
                          className="text-2xl"
                          character={<StarFilled />}
                        />
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Nhận xét (không bắt buộc):</p>
                        <TextArea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                          rows={4}
                          maxLength={500}
                          showCount
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="primary"
                          onClick={() => handleUpdateReview(review.id)}
                          loading={updatingReview}
                          disabled={editRating === 0}
                        >
                          Cập nhật
                        </Button>
                        <Button onClick={handleCancelEdit}>
                          Hủy
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Normal Review Display
                    <>
                      {/* Edit/Delete buttons - only for user's own review */}
                      {user && String(review.student_id) === String(user.id) && (
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditClick(review)}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => setDeletingReview(review)}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          {review.student_avatar ? (
                            <img
                              src={getAvatarUrl(review.student_avatar)}
                              alt={review.student_name}
                              className="w-full h-full rounded-full object-cover"
                              key={getAvatarUrl(review.student_avatar)}
                            />
                          ) : (
                            <UserOutlined className="text-2xl text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{review.student_name}</div>
                          <div className="text-sm text-gray-500">Marketing Manager</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed mb-4 flex-1">
                        {review.comment}
                      </p>
                      
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarFilled
                            key={star}
                            className={`text-xl ${
                              star <= review.rating ? 'text-red-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa đánh giá"
        open={!!deletingReview}
        onOk={() => deletingReview && handleDeleteReview(deletingReview.id)}
        onCancel={() => setDeletingReview(null)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa đánh giá này không?</p>
      </Modal>
    </div>
  );
}
