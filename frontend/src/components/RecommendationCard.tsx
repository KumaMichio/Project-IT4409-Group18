'use client';

import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

type RecommendationCardProps = {
  course: {
    course_id: number;
    title: string;
    description?: string;
  };
  onHide?: () => void;
};

export default function RecommendationCard({
  course,
  onHide,
}: RecommendationCardProps) {
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (action: string) => {
    try {
      setLoading(true);
      await apiFetch('/api/recommendations/feedback', {
        method: 'POST',
        body: JSON.stringify({
          courseId: course.course_id,
          action,
        }),
      });

      if (action === 'HIDE' && onHide) onHide();
    } catch (err) {
      console.error(err);
      alert('Gửi phản hồi thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg bg-white p-4 shadow-sm mb-3">
      <h3 className="font-semibold text-lg mb-1">
        {course.title}
      </h3>
      {!!course.description && (
        <p className="text-sm text-gray-600 mb-2">
          {course.description}
        </p>
      )}

      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => handleFeedback('NOT_INTERESTED')}
          className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Không quan tâm
        </button>
        <button
          disabled={loading}
          onClick={() => handleFeedback('PRIORITY')}
          className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Ưu tiên
        </button>
        <button
          disabled={loading}
          onClick={() => handleFeedback('HIDE')}
          className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Ẩn
        </button>
      </div>
    </div>
  );
}