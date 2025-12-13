'use client';

import { useParams } from 'next/navigation';
import { useCourseChannelChat } from '@/hooks/useChat';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CourseChatPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    messages,
    channel,
    isLoading,
    isConnected,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
  } = useCourseChannelChat(courseId);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
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

  if (!user) {
    return null;
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
            Chat khóa học #{courseId}
          </h1>
          {channel && (
            <p className="text-gray-600 mt-1">{channel.name}</p>
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
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            title={`Chat khóa học #${courseId}`}
            placeholder="Nhập tin nhắn của bạn..."
          />
        </div>
      </div>
    </div>
  );
}

