'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDMThreads } from '@/hooks/useChat';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  instructor_id: number;
}

interface Instructor {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ChatIndexPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { threads, isLoading: threadsLoading } = useDMThreads();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const courseIdInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load enrolled courses
  useEffect(() => {
    async function loadEnrolledCourses() {
      try {
        // Thử các endpoint có thể có
        const endpoints = [
          '/api/enrollments/my-courses',
          '/api/enrollments',
          '/api/courses/my-courses',
        ];

        let courses = [];
        for (const endpoint of endpoints) {
          try {
            const response = await apiClient.get(endpoint);
            if (response.data.courses) {
              courses = response.data.courses;
              break;
            } else if (response.data.enrollments) {
              // Nếu trả về enrollments, extract courses
              courses = response.data.enrollments.map((e: any) => e.course || e);
              break;
            }
          } catch {
            continue;
          }
        }

        setEnrolledCourses(courses);
      } catch (err) {
        console.error('Failed to load enrolled courses:', err);
        // Nếu không có API, để trống - user có thể nhập courseId trực tiếp
      } finally {
        setIsLoadingCourses(false);
      }
    }

    if (user) {
      loadEnrolledCourses();
    }
  }, [user]);

  // Load instructors for students
  useEffect(() => {
    async function loadInstructors() {
      if (user?.role !== 'student') return;

      try {
        setIsLoadingInstructors(true);
        const response = await apiClient.get('/api/chat/instructors');
        setInstructors(response.data.instructors || []);
      } catch (err) {
        console.error('Failed to load instructors:', err);
      } finally {
        setIsLoadingInstructors(false);
      }
    }

    if (user) {
      loadInstructors();
    }
  }, [user]);

  // Filter instructors by search query
  const filteredInstructors = instructors.filter((instructor: Instructor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      instructor.name.toLowerCase().includes(query) ||
      instructor.email.toLowerCase().includes(query)
    );
  });

  // Handle start new DM
  const handleStartDM = (instructorId: number) => {
    if (user?.role === 'student' && user.id) {
      router.push(`/chat/dm/${user.id}/${instructorId}`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
          <p className="text-gray-600 mt-2">Chọn khóa học hoặc cuộc trò chuyện để bắt đầu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Channels Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Khóa học của tôi
            </h2>

            {isLoadingCourses ? (
              <div className="text-gray-500">Đang tải khóa học...</div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-gray-500 py-4">
                <p className="mb-3">Bạn chưa đăng ký khóa học nào hoặc chưa có API để load danh sách.</p>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Truy cập trực tiếp bằng Course ID:</p>
                  <div className="flex gap-2">
                    <input
                      ref={courseIdInputRef}
                      type="number"
                      placeholder="Nhập Course ID"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const courseId = courseIdInputRef.current?.value;
                          if (courseId) {
                            router.push(`/chat/${courseId}`);
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const courseId = courseIdInputRef.current?.value;
                        if (courseId) {
                          router.push(`/chat/${courseId}`);
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Vào chat
                    </button>
                  </div>
                </div>
                <Link href="/courses" className="text-blue-600 hover:underline block mt-3">
                  Khám phá khóa học →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {enrolledCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/chat/${course.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Course channel</p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Direct Messages Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Tin nhắn trực tiếp
              </h2>
              {user.role === 'student' && (
                <button
                  onClick={() => {
                    const modal = document.getElementById('new-dm-modal');
                    if (modal) {
                      (modal as HTMLDialogElement).showModal();
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                  + Tin nhắn mới
                </button>
              )}
            </div>

            {threadsLoading ? (
              <div className="text-gray-500">Đang tải cuộc trò chuyện...</div>
            ) : threads.length === 0 ? (
              <div className="text-gray-500 py-4">
                {user.role === 'teacher' || user.role === 'admin' ? (
                  <div>
                    Chưa có cuộc trò chuyện nào với học viên.
                  </div>
                ) : (
                  <div>
                    Chưa có cuộc trò chuyện nào với giảng viên.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => {
                  const isInstructor = user.role === 'teacher' || user.role === 'admin';
                  const otherUserId = isInstructor ? thread.student_id : thread.instructor_id;
                  const otherUserName = isInstructor
                    ? thread.student_name
                    : thread.instructor_name;
                  const otherUserAvatar = isInstructor
                    ? thread.student_avatar
                    : thread.instructor_avatar;

                  return (
                    <Link
                      key={thread.thread_id}
                      href={`/chat/dm/${thread.student_id}/${thread.instructor_id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {otherUserAvatar ? (
                            <img
                              src={otherUserAvatar}
                              alt={otherUserName || 'User'}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {(otherUserName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {otherUserName || `User #${otherUserId}`}
                            </h3>
                            {thread.last_message_content && (
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {thread.last_message_content}
                              </p>
                            )}
                            {thread.unread_count > 0 && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                                {thread.unread_count} tin nhắn mới
                              </span>
                            )}
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tư vấn với Chatbot Section */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tư vấn với Chatbot
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Nhận tư vấn nhanh chóng về khóa học, lộ trình học tập và các câu hỏi thường gặp
              </p>
            </div>
          </div>
          <Link
            href="/chat/bot"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Bắt đầu tư vấn
          </Link>
        </div>

        {/* Quick Access */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Truy cập nhanh</h2>
          <div className="flex flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              <strong>Course Chat:</strong> Truy cập{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">/chat/[courseId]</code>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Direct Message:</strong> Truy cập{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">
                /chat/dm/[studentId]/[instructorId]
              </code>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Bot Chat:</strong> Truy cập{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">/chat/bot</code>
            </div>
          </div>
        </div>
      </div>

      {/* New DM Modal for Students */}
      {user?.role === 'student' && (
        <dialog id="new-dm-modal" className="modal">
          <div className="modal-box max-w-2xl w-full p-0 bg-white rounded-xl shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Tin nhắn mới</h3>
                    <p className="text-sm text-white/90">
                      Chọn giảng viên để bắt đầu cuộc trò chuyện
                    </p>
                  </div>
                </div>
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Search input */}
              <div className="mb-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm kiếm giảng viên theo tên hoặc email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Instructors list */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {isLoadingInstructors ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                    <p className="text-gray-500">Đang tải danh sách giảng viên...</p>
                  </div>
                ) : filteredInstructors.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      {searchQuery ? 'Không tìm thấy giảng viên' : 'Không có giảng viên nào'}
                    </p>
                    {searchQuery && (
                      <p className="text-sm text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredInstructors.map((instructor) => {
                      // Check if thread already exists
                      const existingThread = threads.find(
                        (t) => t.instructor_id === instructor.id
                      );

                      return (
                        <button
                          key={instructor.id}
                          onClick={() => {
                            if (existingThread) {
                              router.push(
                                `/chat/dm/${user.id}/${instructor.id}`
                              );
                            } else {
                              handleStartDM(instructor.id);
                            }
                            const modal = document.getElementById('new-dm-modal');
                            if (modal) {
                              (modal as HTMLDialogElement).close();
                            }
                          }}
                          className="w-full p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                                {instructor.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {instructor.name}
                                </h4>
                                <p className="text-sm text-gray-500 truncate mt-0.5">
                                  {instructor.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {existingThread && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                  Đã có cuộc trò chuyện
                                </span>
                              )}
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop bg-black/50 backdrop-blur-sm">
            <button className="hidden"></button>
          </form>
        </dialog>
      )}
    </div>
  );
}

