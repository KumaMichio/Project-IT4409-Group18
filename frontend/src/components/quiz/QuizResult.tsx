import React from 'react';
import { Card, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface QuizResultProps {
  score: number;
  totalPoints: number;
  passScore: number;
  passed: boolean;
}

export default function QuizResult({
  score,
  totalPoints,
  passScore,
  passed
}: QuizResultProps) {
  return (
    <Card className="mb-6 shadow-md">
      <div className={`p-4 rounded-lg ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-center gap-3">
          {passed ? (
            <CheckCircleOutlined className="text-3xl text-green-600" />
          ) : (
            <CloseCircleOutlined className="text-3xl text-red-600" />
          )}
          <div>
            <Text strong className="text-lg">
              {passed ? 'Đạt!' : 'Chưa đạt'}
            </Text>
            <div>
              <Text>Điểm: {score}/{totalPoints}</Text>
              <Text type="secondary" className="ml-2">
                (Yêu cầu: {passScore}%)
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
