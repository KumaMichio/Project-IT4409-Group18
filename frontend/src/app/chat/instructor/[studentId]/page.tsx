'use client';

import { useParams } from 'next/navigation';
import { useDMChat } from '@/hooks/useChat';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function InstructorDMPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [studentInfo, setStudentInfo] = useState<any>(null);

  // Get instructor ID from current user (ensure it's a string)
  const instructorId = user?.id ? String(user.id) : '';

  const {
    messages,
    thread,
    isLoading,
    isConnected,
    error,
    sendMessage,
  } = useDMChat(studentId, instructorId);

  // Load student info
  useEffect(() => {
    async function loadStudentInfo() {
      try {
        const response = await apiClient.get(`/api/chat/users/${studentId}`);
        setStudentInfo(response.data.user);
      } catch (err) {
        console.error('Failed to load student info:', err);
      }
    }

    if (studentId) {
      loadStudentInfo();
    }
  }, [studentId]);

  // Redirect if not authenticated or not instructor
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  if (!instructorId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Không tìm thấy thông tin giảng viên</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Chat với học viên
          </h1>
          {studentInfo && (
            <p className="text-gray-600 mt-1">
              {studentInfo.name} ({studentInfo.email})
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="h-[600px]">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            isConnected={isConnected}
            onSendMessage={sendMessage}
            title={
              studentInfo
                ? `Chat với ${studentInfo.name}`
                : `Chat với học viên #${studentId}`
            }
            placeholder="Nhập tin nhắn của bạn..."
          />
        </div>
      </div>
    </div>
  );
}

