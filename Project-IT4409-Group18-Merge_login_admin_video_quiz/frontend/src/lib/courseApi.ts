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

export interface Module {
  id: number;
  title: string;
  position: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  position: number;
  duration_s: number;
  requires_quiz_pass: boolean;
  video_url?: string;
  has_quiz?: boolean;
}

export const courseApi = {
  // ... existing methods ...

  // Module & Lesson Management
  createModule: async (courseId: number, title: string): Promise<Module> => {
    return apiFetch(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  updateModule: async (moduleId: number, title: string): Promise<Module> => {
    return apiFetch(`/api/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  },

  deleteModule: async (moduleId: number): Promise<void> => {
    return apiFetch(`/api/modules/${moduleId}`, {
      method: 'DELETE',
    });
  },

  createLesson: async (moduleId: number, data: { title: string; duration_s?: number; requires_quiz_pass?: boolean; video_url?: string }): Promise<Lesson> => {
    return apiFetch(`/api/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLesson: async (lessonId: number, data: { title?: string; duration_s?: number; requires_quiz_pass?: boolean; video_url?: string }): Promise<Lesson> => {
    return apiFetch(`/api/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    return apiFetch(`/api/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  },

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

  // Get course details for instructor (editing)
  getInstructorCourse: async (courseId: number): Promise<Course> => {
    const course = await apiFetch(`/api/courses/instructor/${courseId}`);
    
    // Map backend fields to frontend interface
    return {
      ...course,
      price: course.price !== undefined ? course.price : (course.price_cents || 0),
      thumbnail: course.thumbnail !== undefined ? course.thumbnail : (course.thumbnail_url || ''),
      language: course.language !== undefined ? course.language : (course.lang || 'vi'),
      status: course.status || (course.is_published ? 'published' : 'draft')
    };
  },

  getInstructorCourseContent: async (courseId: number): Promise<Module[]> => {
    return apiFetch(`/api/courses/instructor/${courseId}/content`);
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
  },

  // Quiz Management
  createQuiz: async (data: any): Promise<any> => {
    return apiFetch('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteQuiz: async (quizId: number): Promise<void> => {
    return apiFetch(`/api/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }
};
