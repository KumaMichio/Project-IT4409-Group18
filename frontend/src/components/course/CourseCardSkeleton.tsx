'use client';

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200"></div>
      
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded mb-2"></div>
        <div className="h-5 bg-gray-200 rounded mb-4 w-3/4"></div>
        
        {/* Description skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-3 w-5/6"></div>
        
        {/* Instructor skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
        
        {/* Rating and price skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Enrollment skeleton */}
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

