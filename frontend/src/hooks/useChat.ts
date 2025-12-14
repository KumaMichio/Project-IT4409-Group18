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

