'use client';

import { ClockCircleOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { Lesson } from './types';

const formatDuration = (seconds: number | null) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

type LessonMetaProps = {
  lesson: Lesson;
};

export function LessonMeta({ lesson }: LessonMetaProps) {
  return (
    <div className="bg-gray-800 p-4 text-white">
      <h2 className="text-lg font-semibold">{lesson.title}</h2>
      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
        <span className="flex items-center gap-1">
          <ClockCircleOutlined /> {formatDuration(lesson.duration_s)}
        </span>
        {lesson.is_completed && (
          <span className="flex items-center gap-1 text-green-500">
            <CheckCircleTwoTone twoToneColor="#52c41a" /> Đã hoàn thành
          </span>
        )}
      </div>
    </div>
  );
}
