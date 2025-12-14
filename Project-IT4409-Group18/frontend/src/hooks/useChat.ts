'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import apiClient from '@/lib/apiClient';
import { createChannelSocket, createDMSocket, disconnectSocket } from '@/lib/socketClient';

export interface Message {
  id: number;
  content: string;
  user_id?: number;
  sender_id?: number;
  user_name?: string;
  sender_name?: string;
  avatar_url?: string;
  sender_avatar?: string;
  role?: string;
  sender_role?: string;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  is_read?: boolean;
}

export interface Channel {
  id: number;
  course_id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface DMThread {
  thread_id: number;
  student_id: number;
  instructor_id: number;
  student_name?: string;
  instructor_name?: string;
  student_avatar?: string;
  instructor_avatar?: string;
  unread_count: number;
  last_message_content?: string;
  last_message_at?: string;
}

/**
 * Hook for course channel chat (UC13)
 */
export function useCourseChannelChat(courseId: string | number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load initial messages
  useEffect(() => {
    async function loadMessages() {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/api/chat/course/${courseId}/messages`);
        setMessages(response.data.messages || []);
        setChannel(response.data.channel);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    }

    if (courseId) {
      loadMessages();
    }
  }, [courseId]);

  // Setup socket connection
  useEffect(() => {
    if (!courseId) return;

    const socket = createChannelSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:course', { courseId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('joined:course', () => {
      console.log('Joined course channel');
    });

    socket.on('message:new', ({ message }: { message: Message }) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('message:updated', ({ message }: { message: Message }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    });

    socket.on('message:deleted', ({ messageId }: { messageId: number }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    socket.on('error', ({ message }: { message: string }) => {
      setError(message);
    });

    return () => {
      socket.emit('leave:course', { courseId });
      disconnectSocket(socket);
    };
  }, [courseId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !socketRef.current) return;

      try {
        // Send via socket for real-time
        socketRef.current.emit('message:send', { courseId, content });
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
      }
    },
    [courseId]
  );

  const editMessage = useCallback(
    (messageId: number, content: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit('message:edit', { messageId, content });
    },
    []
  );

  const deleteMessage = useCallback((messageId: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit('message:delete', { messageId });
  }, []);

  return {
    messages,
    channel,
    isLoading,
    isConnected,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}

/**
 * Hook for direct message chat (UC14)
 */
export function useDMChat(studentId: string | number, instructorId: string | number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thread, setThread] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load initial messages
  useEffect(() => {
    async function loadMessages() {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/api/chat/dm/${studentId}/${instructorId}/messages`
        );
        setMessages(response.data.messages || []);
        setThread(response.data.thread);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    }

    if (studentId && instructorId) {
      loadMessages();
    }
  }, [studentId, instructorId]);

  // Setup socket connection
  useEffect(() => {
    if (!studentId || !instructorId) return;

    const socket = createDMSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:thread', { studentId, instructorId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('joined:thread', () => {
      console.log('Joined DM thread');
      // Mark messages as read
      socket.emit('messages:read', {
        studentId: String(studentId),
        instructorId: String(instructorId),
      });
    });

    socket.on('message:new', ({ message }: { message: Message }) => {
      setMessages((prev) => [...prev, message]);
      // Mark as read
      if (socketRef.current) {
        socketRef.current.emit('messages:read', {
          studentId: String(studentId),
          instructorId: String(instructorId),
        });
      }
    });

    socket.on('messages:read', () => {
      // Update read status if needed
      setMessages((prev) =>
        prev.map((m) => ({ ...m, is_read: true }))
      );
    });

    socket.on('error', ({ message }: { message: string }) => {
      setError(message);
    });

    return () => {
      if (thread) {
        socket.emit('leave:thread', { threadId: thread.id });
      }
      disconnectSocket(socket);
    };
  }, [studentId, instructorId, thread]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !socketRef.current) return;

      try {
        // Ensure IDs are strings for consistency
        socketRef.current.emit('message:send', {
          studentId: String(studentId),
          instructorId: String(instructorId),
          content,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
      }
    },
    [studentId, instructorId]
  );

  return {
    messages,
    thread,
    isLoading,
    isConnected,
    error,
    sendMessage,
  };
}

/**
 * Hook to get user's DM threads
 */
export function useDMThreads() {
  const [threads, setThreads] = useState<DMThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadThreads() {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/api/chat/dm/threads');
        setThreads(response.data.threads || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load threads');
      } finally {
        setIsLoading(false);
      }
    }

    loadThreads();
  }, []);

  return { threads, isLoading, error };
}

/**
 * Hook for chatbot consultation (không lưu lịch sử)
 */
export function useBotChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Always connected (no socket needed)
  const [error, setError] = useState<string | null>(null);

  // Không load messages từ server (vì không lưu lịch sử)
  // Messages chỉ tồn tại trong session hiện tại

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        setIsLoading(true);
        setError(null);

        // Add user message to UI immediately
        const userMessage: Message = {
          id: Date.now(),
          content,
          sender_id: undefined, // Will be set by backend
          sender_name: 'Bạn',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Build conversation history from current messages (last 10)
        const recentMessages = messages.slice(-10);
        const conversationHistory = recentMessages.map((msg) => ({
          role: msg.sender_name === 'Chatbot' || msg.sender_name === 'Bot' ? 'assistant' : 'user',
          content: msg.content,
        }));

        // Send to backend
        console.log('Sending message to /api/chat/bot/messages');
        const response = await apiClient.post('/api/chat/bot/messages', {
          content,
          conversationHistory,
        });

        console.log('Response received:', response.status, response.data);

        // Add bot response
        if (response.data.message) {
          const botMessage: Message = {
            id: response.data.message.id || Date.now() + 1,
            content: response.data.message.content,
            sender_id: undefined,
            sender_name: 'Chatbot',
            created_at: response.data.message.created_at || new Date().toISOString(),
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      } catch (err: any) {
        console.error('Error sending message:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
          baseURL: err.config?.baseURL,
          fullURL: err.config?.baseURL + err.config?.url,
        });
        
        let errorMessage = 'Không thể gửi tin nhắn';
        
        if (err.response) {
          // Server responded with error
          if (err.response.status === 404) {
            errorMessage = `Không tìm thấy endpoint. Vui lòng kiểm tra server có đang chạy không. (404)`;
          } else if (err.response.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (err.response.data?.error) {
            errorMessage = err.response.data.error;
          } else {
            errorMessage = `Lỗi server: ${err.response.status}`;
          }
        } else if (err.request) {
          // Request was made but no response received
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy không.';
        } else {
          // Error setting up request
          errorMessage = err.message || 'Lỗi không xác định';
        }
        
        setError(errorMessage);
        // Remove user message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
  };
}

