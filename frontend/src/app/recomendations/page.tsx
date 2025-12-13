'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import RecommendationCard from '@/components/RecommendationCard';

type Course = {
  course_id: number;
  title: string;
  description?: string;
};

export default function RecommendationsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      // endpoint bên BE cho list gợi ý, bạn cắm vào route thật của nhóm
      const data = await apiFetch('/api/recommendations'); 
      setCourses(data);
    } catch (err) {
      console.error(err);
      alert('Không tải được danh sách gợi ý');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHide = (courseId: number) => {
    setCourses((prev) => prev.filter((c) => c.course_id !== courseId));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Khóa học được gợi ý cho bạn
      </h2>

      {loading && <p>Đang tải...</p>}

      {!loading && courses.length === 0 && (
        <p>Hiện chưa có gợi ý nào.</p>
      )}

      {courses.map((course) => (
        <RecommendationCard
          key={course.course_id}
          course={course}
          onHide={() => handleHide(course.course_id)}
        />
      ))}
    </div>
  );
}