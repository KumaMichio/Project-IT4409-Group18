'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Flex, message, Radio, Space, Tag, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

const mockQuiz = {
  title: 'Quiz: Client-Server cơ bản',
  description: 'Kiểm tra nhanh kiến thức sau bài học.',
  duration: 10,
  questions: [
    {
      id: 1,
      text: 'HTTP là giao thức tầng nào trong mô hình TCP/IP?',
      options: ['Tầng ứng dụng', 'Tầng giao vận', 'Tầng mạng', 'Tầng liên kết dữ liệu'],
      answer: 0
    },
    {
      id: 2,
      text: 'Mã trạng thái 404 nghĩa là gì?',
      options: ['Server lỗi', 'Không tìm thấy tài nguyên', 'Không có quyền truy cập', 'Chuyển hướng tạm thời'],
      answer: 1
    },
    {
      id: 3,
      text: 'Phương thức HTTP nào dùng để cập nhật một phần tài nguyên?',
      options: ['GET', 'POST', 'PUT', 'PATCH'],
      answer: 3
    }
  ]
};

export default function QuizPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const totalQuestions = mockQuiz.questions.length;

  const handleChange = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    if (Object.keys(answers).length !== totalQuestions) {
      message.warning('Hãy chọn đáp án cho tất cả câu hỏi');
      return;
    }
    let s = 0;
    mockQuiz.questions.forEach(q => {
      if (answers[q.id] === q.answer) s += 1;
    });
    setScore(s);
    setSubmitted(true);
    message.success('Đã nộp bài, đây là điểm tạm tính.');
  };

  const resultTag = useMemo(() => {
    if (!submitted) return null;
    const percent = Math.round((score / totalQuestions) * 100);
    const passed = percent >= 70;
    return (
      <Tag color={passed ? 'green' : 'red'}>
        {passed ? 'Đạt' : 'Chưa đạt'} · {score}/{totalQuestions} ({percent}%)
      </Tag>
    );
  }, [submitted, score, totalQuestions]);

  return (
    <Flex vertical gap={16} style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <Card>
        <Flex justify="space-between" align="center">
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>{mockQuiz.title}</Title>
            <Paragraph style={{ marginBottom: 0 }}>{mockQuiz.description}</Paragraph>
          </div>
          <Tag color="blue">{mockQuiz.duration} phút</Tag>
        </Flex>
        {resultTag}
      </Card>

      {mockQuiz.questions.map((q, idx) => (
        <Card key={q.id} title={<span>Câu {idx + 1}</span>}>
          <Paragraph strong>{q.text}</Paragraph>
          <Radio.Group
            onChange={(e) => handleChange(q.id, e.target.value)}
            value={answers[q.id]}
            disabled={submitted}
          >
            <Space direction="vertical">
              {q.options.map((opt, i) => {
                const isCorrect = submitted && i === q.answer;
                const isChosenWrong = submitted && answers[q.id] === i && i !== q.answer;
                return (
                  <Radio key={i} value={i}>
                    <Text style={{ color: isCorrect ? '#52c41a' : isChosenWrong ? '#f5222d' : undefined }}>
                      {opt}
                    </Text>
                  </Radio>
                );
              })}
            </Space>
          </Radio.Group>
        </Card>
      ))}

      <Flex gap={8}>
        <Button type="primary" onClick={handleSubmit} disabled={submitted}>
          Nộp bài
        </Button>
        {submitted && <Text type="secondary">Điểm của bạn: {score}/{totalQuestions}</Text>}
      </Flex>
    </Flex>
  );
}
