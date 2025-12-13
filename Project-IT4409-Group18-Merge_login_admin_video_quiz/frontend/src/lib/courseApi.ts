import { apiFetch } from './api';

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  level: string;
  language: string;
  thumbnail: string;
  instructor_id: number;
  created_at: string;
  updated_at: string;
  status: string;
  student_count?: number;
  average_rating?: number;
}

export interface CreateCourseData {
  title: string;
  description: string;
  price: number;
  level: string;
  language: string;
  thumbnail?: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  price?: number;
  level?: string;
  language?: string;
  thumbnail?: string;
  status?: string;
}

export interface Student {
  id: number;
  full_name: string;
  email: string;
  enrolled_at: string;
  progress: number;
}

export const courseApi = {
  // Get all courses for the current instructor
  getMyCourses: async (): Promise<Course[]> => {
    return apiFetch('/api/courses/instructor/my-courses');
  },

  // Create a new course
  createCourse: async (data: CreateCourseData): Promise<Course> => {
    return apiFetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a course
  updateCourse: async (courseId: number, data: UpdateCourseData): Promise<Course> => {
    return apiFetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a course
  deleteCourse: async (courseId: number): Promise<void> => {
    return apiFetch(`/api/courses/${courseId}`, {
      method: 'DELETE',
    });
  },

  // Get students enrolled in a course
  getCourseStudents: async (courseId: number): Promise<Student[]> => {
    return apiFetch(`/api/courses/${courseId}/students`);
  },
  
  // Get course details
  getCourse: async (courseId: number): Promise<Course> => {
    const data = await apiFetch(`/api/courses/${courseId}`);
    // Handle response from public detail API which returns { course: {...}, ... }
    const course = data.course || data;
    
    // Map backend fields to frontend interface
    return {
      ...course,
      price: course.price !== undefined ? course.price : (course.price_cents || 0),
      thumbnail: course.thumbnail !== undefined ? course.thumbnail : (course.thumbnail_url || ''),
      language: course.language !== undefined ? course.language : (course.lang || 'vi'),
      status: course.status || (course.is_published ? 'published' : 'draft')
    };
  }
};
