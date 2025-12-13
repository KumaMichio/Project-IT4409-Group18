'use client';

import { Message } from '@/hooks/useChat';
import { getUser } from '@/lib/auth';

interface MessageItemProps {
  message: Message;
  onEdit?: (messageId: number, content: string) => void;
  onDelete?: (messageId: number) => void;
}

export default function MessageItem({ message, onEdit, onDelete }: MessageItemProps) {
  const currentUser = getUser();
  const isOwnMessage =
    currentUser?.id === String(message.user_id || message.sender_id);
  const userName = message.user_name || message.sender_name || 'Unknown';
  const avatarUrl = message.avatar_url || message.sender_avatar;
  const role = message.role || message.sender_role;

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`flex gap-3 p-3 hover:bg-gray-50 ${
        isOwnMessage ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{userName}</span>
          {role && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              {role === 'INSTRUCTOR' ? 'Giảng viên' : role === 'STUDENT' ? 'Học viên' : role}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {formatTime(message.created_at)}
          </span>
          {message.edited_at && (
            <span className="text-xs text-gray-400 italic">(đã chỉnh sửa)</span>
          )}
        </div>

        <div
          className={`rounded-lg px-4 py-2 max-w-md ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {message.deleted_at ? (
            <p className="italic text-gray-400">Tin nhắn đã bị xóa</p>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {/* Actions for own messages */}
        {isOwnMessage && !message.deleted_at && (onEdit || onDelete) && (
          <div className="flex gap-2 mt-1">
            {onEdit && (
              <button
                onClick={() => {
                  const newContent = prompt('Chỉnh sửa tin nhắn:', message.content);
                  if (newContent && newContent !== message.content) {
                    onEdit(message.id, newContent);
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Sửa
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
                    onDelete(message.id);
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Xóa
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

