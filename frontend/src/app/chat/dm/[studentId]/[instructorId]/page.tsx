'use client';

import { useParams } from 'next/navigation';
import { useDMChat } from '@/hooks/useChat';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function DMPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const instructorId = params.instructorId as string;
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [otherUserInfo, setOtherUserInfo] = useState<any>(null);

  const {
    messages,
    thread,
    isLoading,
    isConnected,
    error,
    sendMessage,
  } = useDMChat(studentId, instructorId);

  // Determine which user info to load
  useEffect(() => {
    async function loadOtherUserInfo() {
      try {
        // If current user is student, load instructor info
        // If current user is instructor, load student info
        const otherUserId = user?.role === 'student' ? instructorId : studentId;
        const response = await apiClient.get(`/api/chat/users/${otherUserId}`);
        setOtherUserInfo(response.data.user);
      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    }

    if (user && (studentId || instructorId)) {
      loadOtherUserInfo();
    }
  }, [user, studentId, instructorId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Verify user is part of this conversation
  useEffect(() => {
    if (user && studentId && instructorId) {
      const userId = String(user.id);
      if (userId !== studentId && userId !== instructorId) {
        router.push('/chat');
      }
    }
  }, [user, studentId, instructorId, router]);

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

  const isStudent = user.role === 'student';
  const isInstructor = user.role === 'teacher' || user.role === 'admin';

  if (!isStudent && !isInstructor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Bạn không có quyền truy cập</div>
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
            {isStudent ? 'Chat với giảng viên' : 'Chat với học viên'}
          </h1>
          {otherUserInfo && (
            <p className="text-gray-600 mt-1">
              {otherUserInfo.name} ({otherUserInfo.email})
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
              otherUserInfo
                ? `Chat với ${otherUserInfo.name}`
                : isStudent
                ? `Chat với giảng viên`
                : `Chat với học viên`
            }
            placeholder="Nhập tin nhắn của bạn..."
          />
        </div>
      </div>
    </div>
  );
}

