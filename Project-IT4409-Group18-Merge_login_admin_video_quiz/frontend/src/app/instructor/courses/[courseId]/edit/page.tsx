'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { courseApi, UpdateCourseData } from '@/lib/courseApi';
import Button from '@/components/common/Button';
import CourseContentManager from '@/components/course/CourseContentManager';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.courseId as string);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await courseApi.updateCourse(courseId, formData);
      router.push('/instructor/courses');
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading course...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <input
              type="text"
              name="language"
              required
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
          <input
            type="url"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </form>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
        <CourseContentManager courseId={courseId} />
      </div>
    </div>
  );
}
