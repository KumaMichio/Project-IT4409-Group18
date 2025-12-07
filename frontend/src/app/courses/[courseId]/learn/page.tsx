'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '../../../../config/api';
import { VideoPlayer } from '../../../../components/learn/VideoPlayer';
import { LessonSidebar } from '../../../../components/learn/LessonSidebar';
import { LessonMeta } from '../../../../components/learn/LessonMeta';
import { Course, Lesson, Module } from '../../../../components/learn/types';

const STUDENT_ID = 1; // TODO: Get from auth context

export default function CourseViewerPage() {
  const params = useParams();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const currentLessonRef = useRef<Lesson | null>(null);

  const updateLessonState = (lessonId: number, watchedSeconds: number, isCompleted: boolean) => {
    setModules(prev => prev.map(m => ({
      ...m,
      lessons: m.lessons.map(l => l.id === lessonId ? {
        ...l,
        watched_s: Math.max(l.watched_s, watchedSeconds),
        is_completed: l.is_completed || isCompleted
      } : l)
    })));

    setCurrentLesson(prev => prev && prev.id === lessonId ? {
      ...prev,
      watched_s: Math.max(prev.watched_s, watchedSeconds),
      is_completed: prev.is_completed || isCompleted
    } : prev);
  };

  useEffect(() => {
    currentLessonRef.current = currentLesson;
  }, [currentLesson]);

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  useEffect(() => {
    // Auto-play first video when course loads
    if (modules.length > 0 && !currentLesson) {
      const firstLesson = modules[0].lessons[0];
      if (firstLesson) {
        setCurrentLesson(firstLesson);
        setExpandedModules(new Set([modules[0].id]));
      }
    }
  }, [modules]);


  const fetchCourseContent = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/content?studentId=${STUDENT_ID}`
      );
      setCourse(response.data.course);
      setModules(response.data.modules);
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Không thể tải nội dung khóa học');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (lesson: Lesson, watchedSeconds: number) => {
    try {
      await axios.post(`${API_URL}/lessons/${lesson.id}/progress`, {
        studentId: STUDENT_ID,
        watchedSeconds
      });

      const duration = lesson.duration_s || 0;
      const alreadyCompleted = lesson.is_completed;
      const isCompleted = alreadyCompleted || (duration > 0 ? watchedSeconds >= duration * 0.9 : alreadyCompleted);
      updateLessonState(lesson.id, watchedSeconds, isCompleted);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleProgress = useCallback((watchedSeconds: number) => {
    const lesson = currentLessonRef.current;
    if (!lesson) return;
    saveProgress(lesson, watchedSeconds);
  }, []);

  const handleComplete = useCallback((watchedSeconds: number) => {
    const lesson = currentLessonRef.current;
    if (!lesson) return;
    saveProgress(lesson, watchedSeconds);
  }, []);

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    currentLessonRef.current = lesson;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main Content - Video Player */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 p-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="text-white hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-white">
            <h1 className="text-xl font-bold">{course?.title}</h1>
          </div>
        </div>

        <VideoPlayer
          key={currentLesson?.id || 'no-lesson'}
          lesson={currentLesson}
          resumeSeconds={currentLesson?.watched_s || 0}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />

        {currentLesson && <LessonMeta lesson={currentLesson} />}
      </div>

      <LessonSidebar
        modules={modules}
        currentLessonId={currentLesson?.id}
        expandedModules={expandedModules}
        onToggleModule={toggleModule}
        onSelectLesson={selectLesson}
        courseId={courseId}
      />
    </div>
  );
}
