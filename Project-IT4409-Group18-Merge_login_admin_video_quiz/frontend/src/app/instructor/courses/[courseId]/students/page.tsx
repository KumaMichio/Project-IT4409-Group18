'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseApi, Student, Course } from '@/lib/courseApi';
import Button from '@/components/common/Button';

export default function CourseStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);

  const [students, setStudents] = useState<Student[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, courseData] = await Promise.all([
          courseApi.getCourseStudents(courseId),
          courseApi.getInstructorCourse(courseId)
        ]);
        setStudents(studentsData);
        setCourse(courseData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Students Enrolled</h1>
          <p className="text-gray-600">Course: {course?.title}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Courses
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrolled Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No students enrolled in this course yet.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(student.enrolled_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {Math.round(student.progress)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
