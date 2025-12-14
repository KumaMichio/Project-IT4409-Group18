'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

interface Tag {
  id: number;
  name: string;
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [coursesByTag, setCoursesByTag] = useState<{[key: string]: Course[]}>({});
  const [loading, setLoading] = useState(true);

  // Fetch popular tags and courses by tag
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch tags
      const tagsResponse = await apiClient.get('/courses/tags');
      const allTags = tagsResponse.data || [];
      
      // Take first 6 tags as popular
      const popular = allTags.slice(0, 7);
      setPopularTags(popular);
      
      // Fetch courses for each popular tag
      const coursesData: {[key: string]: Course[]} = {};
      for (const tag of popular) {
        try {
          const response = await apiClient.get('/courses', { 
            params: { tags: tag.name, limit: 8 } 
          });
          coursesData[tag.name] = response.data.courses || [];
        } catch (err) {
          coursesData[tag.name] = [];
        }
      }
      setCoursesByTag(coursesData);
    } catch (error) {
      // Error handled
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

        {/* Browse All Courses Button */}
        <div className="mt-12 text-center">
          <Link href="/courses">
            <Button variant="primary" size="lg">
              Xem tất cả khóa học
            </Button>
          </Link>
        </div>

        {/* Tags Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Bạn đang quan tâm gì?
          </h2>
          
          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {popularTags.map((tag, index) => {
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-gray-500 to-gray-600', 
                  'from-green-500 to-green-600',
                  'from-purple-500 to-purple-600',
                  'from-orange-400 to-orange-500',
                  'from-red-400 to-red-500',
                  'from-slate-600 to-slate-700'
                ];
                return (
                  <Link 
                    key={tag.id} 
                    href={`/courses?tags=${tag.name}`}
                    className={`flex-shrink-0 w-44 h-36 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl shadow-md hover:shadow-xl transition-shadow flex flex-col items-start justify-end p-5 text-white cursor-pointer group`}
                  >
                    <h3 className="text-lg font-bold mb-1">{tag.name}</h3>
                    <p className="text-sm opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Xem chi tiết 
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </Link>
                );
              })}
              <Link 
                href="/courses"
                className="flex-shrink-0 w-44 h-36 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow flex items-center justify-center text-white cursor-pointer"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold mb-1">+4 chủ đề</p>
                  <p className="text-sm opacity-90">Xem thêm</p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Courses by Category */}
        {!loading && popularTags.map((tag) => {
          const courses = coursesByTag[tag.name] || [];
          if (courses.length === 0) return null;
          
          return <CourseCarousel key={tag.id} tag={tag} courses={courses} />;
        })}

        {/* Why Choose Us Section */}
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

// Course Carousel Component with navigation arrows
function CourseCarousel({ tag, courses }: { tag: Tag; courses: Course[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [courses]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-16 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Khóa học {tag.name}
          </h2>
          <Link 
            href={`/courses?tags=${tag.name}`}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mt-1"
          >
            Xem toàn bộ
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Scrollable Course Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course) => (
            <div key={course.id} className="flex-shrink-0 w-[280px] h-[420px]">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}