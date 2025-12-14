'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import { Icon } from '@iconify/react';
import { CourseCard } from '@/components/course/CourseCard';
import apiClient from '@/lib/apiClient';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
  total_lessons?: number;
}

export function PopularCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPopularCourses = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch courses and sort by enrollment_count (popular)
      const response = await apiClient.get('/courses', {
        params: { page: 1, limit: 20 }
      });
      const allCourses = response.data.courses || [];
      // Sort by enrollment_count descending and take top 9
      const popularCourses = allCourses
        .sort((a: Course, b: Course) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
        .slice(0, 9);
      setCourses(popularCourses);
    } catch (error) {
      console.error('Failed to fetch popular courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularCourses();
  }, [fetchPopularCourses]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-midnight-text">
            Popular Courses
          </h2>
          <Link 
            href="/courses" 
            className="flex items-center gap-2 text-secondary hover:text-secondary-dark font-medium transition"
          >
            Browse All Courses
            <Icon icon="mdi:arrow-right" className="w-5 h-5" />
          </Link>
        </div>

        {/* Slider */}
        <div className="relative">
          <Slider {...sliderSettings}>
            {courses.map((course) => (
              <div key={course.id} className="px-2">
                <CourseCard course={course} showBestSeller={course.enrollment_count > 50} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

