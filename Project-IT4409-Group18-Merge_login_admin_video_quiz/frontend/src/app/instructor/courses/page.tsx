'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { courseApi, Course } from '@/lib/courseApi';
import Button from '@/components/common/Button';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseApi.getMyCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await courseApi.deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading courses...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Link href="/instructor/courses/create">
          <Button>Create New Course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
          <Link href="/instructor/courses/create">
            <Button variant="outline">Create Your First Course</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Thumbnail
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-semibold shadow">
                  {course.status}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 truncate" title={course.title}>
                  {course.title}
                </h3>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{course.level}</span>
                  <span>${course.price}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Link href={`/instructor/courses/${course.id}/view`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">View</Button>
                    </Link>
                    <Link href={`/instructor/courses/${course.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">Edit</Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <Link href={`/instructor/courses/${course.id}/students`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Manage Students
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
