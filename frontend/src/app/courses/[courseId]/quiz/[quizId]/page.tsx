'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Radio, Space, Typography, Progress, message, Spin } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../../../../config/api';

const { Title, Paragraph, Text } = Typography;

const STUDENT_ID = 1; // TODO: Get from auth context

type QuizOption = {
  id: number;
  option_text: string;
  is_correct: boolean;
  position: number;
};

type QuizQuestion = {
  id: number;
  question: string;
  qtype: string;
  position: number;
  points: number;
  options: QuizOption[];
};

type Quiz = {
  id: number;
  title: string;
  time_limit_s: number | null;
  attempts_allowed: number | null;
  pass_score: number;
  questions: QuizQuestion[];
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const quizId = params?.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${quizId}`);
      setQuiz(response.data);
      if (response.data.time_limit_s) {
        setTimeLeft(response.data.time_limit_s);
      }
      
      // Tạo quiz attempt
      const attemptResponse = await axios.post(`${API_URL}/quizzes/${quizId}/attempts`, {
        studentId: STUDENT_ID
      });
      setAttemptId(attemptResponse.data.attemptId);
    } catch (error: any) {
      console.error('Error fetching quiz:', error);
      if (error.response?.status === 403) {
        message.error('Bạn đã hết lượt làm bài quiz này');
        router.push(`/courses/${courseId}/learn`);
      } else {
        message.error('Không thể tải quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (questionId: number, value: number | number[]) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (submitted || !quiz || !attemptId) return;

    const unanswered = quiz.questions.filter(q => !(q.id in answers));
    if (unanswered.length > 0) {
      message.warning('Hãy trả lời tất cả câu hỏi trước khi nộp bài');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/quizzes/${quizId}/attempts/${attemptId}/submit`, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          selectedOptionIds: Array.isArray(answer) ? answer : [answer]
        }))
      });

      setScore(response.data.score);
      setSubmitted(true);

      if (response.data.passed) {
        message.success(`Chúc mừng! Bạn đã đạt ${response.data.score}/${response.data.totalPoints} điểm`);
      } else {
        message.error(`Bạn đạt ${response.data.score}/${response.data.totalPoints} điểm. Vui lòng thử lại!`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      message.error('Không thể nộp bài');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text>Không tìm thấy quiz</Text>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Title level={2} className="!mb-2">{quiz.title}</Title>
              <Space>
                <Text type="secondary">{totalQuestions} câu hỏi</Text>
                <Text type="secondary">•</Text>
                <Text type="secondary">Điểm đạt: {quiz.pass_score}%</Text>
                {quiz.attempts_allowed && (
                  <>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">Tối đa {quiz.attempts_allowed} lần làm</Text>
                  </>
                )}
              </Space>
            </div>
            
            {timeLeft !== null && !submitted && (
              <div className={`text-center p-3 rounded-lg ${timeLeft < 60 ? 'bg-red-100' : 'bg-blue-50'}`}>
                <ClockCircleOutlined className={`text-2xl ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`} />
                <div className={`text-xl font-bold mt-1 ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}
          </div>

          {!submitted && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Text>Tiến độ: {answeredCount}/{totalQuestions}</Text>
                <Text>{Math.round(progressPercent)}%</Text>
              </div>
              <Progress percent={progressPercent} showInfo={false} strokeColor="#00ADEF" />
            </div>
          )}

          {submitted && (
            <div className={`p-4 rounded-lg ${score >= quiz.pass_score ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-3">
                {score >= quiz.pass_score ? (
                  <CheckCircleOutlined className="text-3xl text-green-600" />
                ) : (
                  <CloseCircleOutlined className="text-3xl text-red-600" />
                )}
                <div>
                  <Text strong className="text-lg">
                    {score >= quiz.pass_score ? 'Đạt!' : 'Chưa đạt'}
                  </Text>
                  <div>
                    <Text>Điểm: {score}/{quiz.questions.reduce((sum, q) => sum + q.points, 0)}</Text>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Questions */}
        <Space direction="vertical" size="large" className="w-full">
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isMultiChoice = question.qtype === 'MULTI_CHOICE';
            
            return (
              <Card key={question.id} className="shadow-sm">
                <div className="mb-4">
                  <Text strong className="text-base">
                    Câu {index + 1}: {question.question}
                  </Text>
                  {isMultiChoice && (
                    <Text type="secondary" className="block mt-1 text-sm">
                      (Chọn nhiều đáp án)
                    </Text>
                  )}
                  <Text type="secondary" className="block mt-1 text-sm">
                    ({question.points} điểm)
                  </Text>
                </div>

                <Radio.Group
                  value={userAnswer}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  disabled={submitted}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    {question.options.map(option => {
                      const isSelected = Array.isArray(userAnswer) 
                        ? userAnswer.includes(option.id)
                        : userAnswer === option.id;
                      const showCorrect = submitted && option.is_correct;
                      const showWrong = submitted && isSelected && !option.is_correct;

                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded border ${
                            showCorrect ? 'border-green-500 bg-green-50' :
                            showWrong ? 'border-red-500 bg-red-50' :
                            isSelected ? 'border-blue-500 bg-blue-50' :
                            'border-gray-200'
                          }`}
                        >
                          <Radio value={option.id} className="w-full">
                            <span className={showCorrect ? 'text-green-700 font-medium' : showWrong ? 'text-red-700' : ''}>
                              {option.option_text}
                            </span>
                            {showCorrect && <CheckCircleOutlined className="ml-2 text-green-600" />}
                            {showWrong && <CloseCircleOutlined className="ml-2 text-red-600" />}
                          </Radio>
                        </div>
                      );
                    })}
                  </Space>
                </Radio.Group>
              </Card>
            );
          })}
        </Space>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            size="large"
            onClick={() => router.push(`/courses/${courseId}/learn`)}
          >
            Quay lại học
          </Button>
          {!submitted && (
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              disabled={answeredCount < totalQuestions}
              className="bg-[#00ADEF] hover:bg-[#0096d6]"
            >
              Nộp bài
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
