'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { courseApi, UpdateCourseData } from '@/lib/courseApi';
import Button from '@/components/common/Button';
import CourseContentManager from '@/components/course/CourseContentManager';

export default function ViewCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.courseId as string);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UpdateCourseData>({
    title: '',
    description: '',
    price: 0,
    level: 'Beginner',
    language: 'Vietnamese',
    thumbnail: '',
    status: 'draft'
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const course = await courseApi.getInstructorCourse(courseId);
        setFormData({
          title: course.title,
          description: course.description,
          price: course.price,
          level: course.level,
          language: course.language,
          thumbnail: course.thumbnail,
          status: course.status
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (isLoading) return <div className="p-8 text-center">Loading course...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">View Course</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
          <input
            type="text"
            value={formData.title}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              value={formData.price}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <input
              type="text"
              value={formData.level}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <input
              type="text"
              value={formData.language}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <input
              type="text"
              value={formData.status}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
          <input
            type="url"
            value={formData.thumbnail}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
        <CourseContentManager courseId={courseId} readOnly={true} />
      </div>

      <div className="flex justify-end gap-4 pt-4 pb-8">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
