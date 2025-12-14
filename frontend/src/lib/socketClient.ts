import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

/**
 * Create Socket.IO connection for course channels
 */
export function createChannelSocket(): Socket {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return io(`${SOCKET_URL}/chat/channel`, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
}

/**
 * Create Socket.IO connection for direct messages
 */
export function createDMSocket(): Socket {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return io(`${SOCKET_URL}/chat/dm`, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
}

/**
 * Disconnect socket
 */
export function disconnectSocket(socket: Socket | null) {
  if (socket) {
    socket.disconnect();
  }
}

