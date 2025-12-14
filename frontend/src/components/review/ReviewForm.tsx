'use client';

import { useState, useEffect } from 'react';
import { Card, Rate, Button, message, Input } from 'antd';
import { StarFilled } from '@ant-design/icons';
import apiClient from '@/lib/apiClient';

const { TextArea } = Input;

interface ReviewFormProps {
  courseId: string;
  onSuccess?: () => void;
  existingReview?: {
    id: number;
    rating: number;
    comment: string;
  };
}

export default function ReviewForm({ courseId, onSuccess, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    }
  }, [existingReview]);

  const handleSubmit = async () => {
    if (rating === 0) {
      message.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      setSubmitting(true);

      if (existingReview) {
        // Update existing review
        await apiClient.put(`/reviews/${existingReview.id}`, {
          rating,
          comment
        });
        message.success('Đã cập nhật đánh giá thành công!');
      } else {
        // Create new review
        await apiClient.post(`/reviews/courses/${courseId}`, {
          rating,
          comment
        });
        message.success('Cảm ơn bạn đã đánh giá khóa học!');
      }

      // Reset form
      setRating(0);
      setComment('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Không thể gửi đánh giá';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        {existingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá khóa học'}
      </h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Đánh giá của bạn:</p>
        <Rate
          value={rating}
          onChange={setRating}
          className="text-2xl"
          character={<StarFilled />}
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Nhận xét (không bắt buộc):</p>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
          rows={4}
          maxLength={500}
          showCount
        />
      </div>

      <Button
        type="primary"
        onClick={handleSubmit}
        loading={submitting}
        disabled={rating === 0}
      >
        {existingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
      </Button>
    </Card>
  );
}
