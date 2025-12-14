'use client';

import { useBotChat } from '@/hooks/useChat';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BotChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
  } = useBotChat();

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
            onClick={() => router.push('/chat')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Quay lại
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              🤖
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tư vấn với Chatbot
              </h1>
              <p className="text-gray-600 mt-1">
                Trợ lý AI của bạn sẵn sàng trả lời mọi câu hỏi
              </p>
            </div>
          </div>
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
            title="Tư vấn với Chatbot"
            placeholder="Nhập câu hỏi của bạn..."
          />
        </div>
      </div>
    </div>
  );
}


