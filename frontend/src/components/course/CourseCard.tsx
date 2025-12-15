'use client';

import Link from 'next/link';
import Image from 'next/image';
import { normalizeImageUrl } from '@/utils/imageUrl';

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

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const formatPrice = (cents: number) => {
    if (cents === 0) {
      return 'Miễn phí';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group relative h-full flex flex-col">
      <Link href={`/courses/${course.id}`} className="block">
        <div className="relative h-48 bg-gray-200">
          {course.thumbnail_url ? (
            <Image
              src={normalizeImageUrl(course.thumbnail_url)}
              alt={course.title}
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
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/courses/${course.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {course.description}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          {course.instructor_name}
        </p>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">
                {parseFloat(course.avg_rating.toString()).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({course.review_count})
              </span>
            </div>
            <div className="text-lg font-bold text-red-600">
              {formatPrice(course.price_cents)}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {course.enrollment_count} học viên
          </div>
        </div>
      </div>
    </div>
  );
}

