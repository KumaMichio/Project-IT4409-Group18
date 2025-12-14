'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Space, Typography, Progress, message, Spin, Modal, List } from 'antd';
import { ClockCircleOutlined, ArrowLeftOutlined, HomeOutlined, ArrowRightOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import apiClient from '../../../../../lib/apiClient';
import QuizQuestion, { QuizQuestionData } from '../../../../../components/quiz/QuizQuestion';
import QuizResult from '../../../../../components/quiz/QuizResult';
import { useAuth } from '../../../../../hooks/useAuth';

const { Title, Text } = Typography;

type Quiz = {
  id: number;
  title: string;
  time_limit_s: number | null;
  attempts_allowed: number | null;
  pass_score: number;
  lesson_id: number | null;
  questions: QuizQuestionData[];
};

interface Lesson {
  id: number;
  title: string;
  position: number;
  module_id: number;
}

interface Module {
  id: number;
  title: string;
  position: number;
  lessons: Lesson[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params?.courseId as string;
  const quizId = params?.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [nextLessonId, setNextLessonId] = useState<number | null>(null);
  const [loadingNextLesson, setLoadingNextLesson] = useState(false);
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchQuiz();
    }
  }, [quizId, user?.id]);

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
      const response = await apiClient.get(`/quizzes/${quizId}`);
      setQuiz(response.data);
      if (response.data.time_limit_s) {
        setTimeLeft(response.data.time_limit_s);
      }
      
      // Lưu lesson_id nếu có
      if (response.data.lesson_id) {
        setCurrentLessonId(response.data.lesson_id);
      }
      
      // Tạo quiz attempt
      if (!user?.id) {
        message.error('Vui lòng đăng nhập để làm quiz');
        router.push('/auth/login');
        return;
      }
      console.log('Creating quiz attempt for quiz:', quizId);
      const attemptResponse = await apiClient.post(`/quizzes/${quizId}/attempts`);
      console.log('Attempt created:', attemptResponse.data);
      const attemptId = attemptResponse.data.attemptId || attemptResponse.data.id;
      setAttemptId(attemptId);
      
      // Check if this is a passed attempt (review mode)
      if (attemptResponse.data.submitted_at && attemptResponse.data.passed) {
        console.log('This is a passed attempt, loading in review mode');
        setSubmitted(true);
        setPassed(true);
        setScore(attemptResponse.data.score || 0);
        setTimeLeft(0); // Stop timer
        message.info('Bạn đã hoàn thành quiz này. Đang xem lại kết quả.');
        
        // Load previous answers and quiz with correct answers
        try {
          const [answersResponse, quizWithAnswersResponse] = await Promise.all([
            apiClient.get(`/quizzes/${quizId}/attempts/${attemptId}/answers`),
            apiClient.get(`/quizzes/${quizId}?includeCorrectAnswers=true`)
          ]);
          
          // Set previous answers
          const previousAnswers: Record<number, number | number[]> = {};
          answersResponse.data.forEach((answer: any) => {
            const optionIds = answer.selected_option_ids || [];
            previousAnswers[answer.question_id] = optionIds.length === 1 ? optionIds[0] : optionIds;
          });
          setAnswers(previousAnswers);
          
          // Update quiz with correct answers
          if (quizWithAnswersResponse.data) {
            setQuiz(quizWithAnswersResponse.data);
          }
          
          fetchNextLesson();
        } catch (err) {
          console.error('Error loading review data:', err);
        }
      }
    } catch (error: any) {
      console.error('Error fetching quiz:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 403) {
        // Fetch previous attempts
        try {
          const attemptsResponse = await apiClient.get(`/quizzes/${quizId}/attempts`);
          setPreviousAttempts(attemptsResponse.data || []);
        } catch (err) {
          console.error('Error fetching attempts:', err);
        }
        
        const errorMessage = error.response?.data?.message || 'Bạn đã hết lượt làm bài quiz này';
        const alreadyPassed = error.response?.data?.alreadyPassed || false;
        
        message.warning(errorMessage);
        setShowAttemptsModal(true);
      } else if (error.response?.status === 401) {
        message.error('Vui lòng đăng nhập để làm quiz');
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        message.error(error.response?.data?.message || 'Không thể tải quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch next lesson after quiz is submitted
  const fetchNextLesson = async () => {
    if (!currentLessonId || !user?.id) return;
    
    try {
      setLoadingNextLesson(true);
      const response = await apiClient.get(`/courses/${courseId}/content`);
      const modules: Module[] = response.data.modules || [];
      
      // Flatten all lessons with their module info
      const allLessons: (Lesson & { module_position: number })[] = [];
      modules.forEach(module => {
        module.lessons.forEach(lesson => {
          allLessons.push({
            ...lesson,
            module_position: module.position
          });
        });
      });
      
      // Sort by module position and lesson position
      allLessons.sort((a, b) => {
        if (a.module_position !== b.module_position) {
          return a.module_position - b.module_position;
        }
        return a.position - b.position;
      });
      
      // Find current lesson index
      const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
      
      // Find next lesson
      if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
        setNextLessonId(allLessons[currentIndex + 1].id);
      } else {
        setNextLessonId(null);
      }
    } catch (error) {
      console.error('Error fetching next lesson:', error);
    } finally {
      setLoadingNextLesson(false);
    }
  };

  const handleChange = (questionId: number, value: number | number[]) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (submitted || !quiz || !attemptId) {
      if (submitted) {
        message.warning('Bạn đã hoàn thành quiz này rồi!');
      }
      return;
    }

    const unanswered = quiz.questions.filter(q => !(q.id in answers));
    if (unanswered.length > 0) {
      message.warning('Hãy trả lời tất cả câu hỏi trước khi nộp bài');
      return;
    }

    try {
      const response = await apiClient.post(`/quizzes/${quizId}/attempts/${attemptId}/submit`, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          selectedOptionIds: Array.isArray(answer) ? answer : [answer]
        }))
      });

      setScore(response.data.score);
      setSubmitted(true);
      setPassed(response.data.passed);
      
      // Update quiz with correct answers from response
      if (response.data.quiz) {
        setQuiz(response.data.quiz);
      }
      
      // Fetch next lesson after submission
      fetchNextLesson();

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
            <QuizResult
              score={score}
              totalPoints={quiz.questions.reduce((sum, q) => sum + q.points, 0)}
              passScore={quiz.pass_score}
              passed={passed}
            />
          )}
        </Card>

        {/* Questions */}
        <Space direction="vertical" size="large" className="w-full">
          {quiz.questions.map((question, index) => (
            <QuizQuestion
              key={question.id}
              question={question}
              questionNumber={index + 1}
              userAnswer={answers[question.id]}
              submitted={submitted}
              onChange={handleChange}
            />
          ))}
        </Space>

        {/* Submit Button / Navigation Buttons */}
        <div className="mt-8">
          {!submitted ? (
            <div className="flex justify-center gap-4">
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  if (currentLessonId) {
                    router.push(`/courses/${courseId}/learn?lessonId=${currentLessonId}`);
                  } else {
                    router.push(`/courses/${courseId}/learn`);
                  }
                }}
              >
                Quay lại bài học
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                disabled={answeredCount < totalQuestions}
                className="bg-[#00ADEF] hover:bg-[#0096d6]"
              >
                Nộp bài
              </Button>
            </div>
          ) : (
            <Card className="shadow-md">
              <div className="text-center mb-4">
                <Title level={4} className="!mb-2">Quiz đã hoàn thành!</Title>
                <Text type="secondary">Bạn muốn làm gì tiếp theo?</Text>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {currentLessonId && (
                  <Button
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push(`/courses/${courseId}/learn?lessonId=${currentLessonId}`)}
                  >
                    Quay lại bài học
                  </Button>
                )}
                <Button
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={() => router.push(`/courses/${courseId}`)}
                >
                  Về trang khóa học
                </Button>
                {nextLessonId ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={() => router.push(`/courses/${courseId}/learn?lessonId=${nextLessonId}`)}
                    loading={loadingNextLesson}
                    className="bg-[#00ADEF] hover:bg-[#0096d6]"
                  >
                    Bài học tiếp theo
                  </Button>
                ) : (
                  <Button
                    size="large"
                    onClick={() => router.push(`/courses/${courseId}/learn`)}
                  >
                    Về trang học
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
        {/* Modal hiển thị danh sách attempts trước đó */}
        <Modal
          title={previousAttempts.some((a: any) => a.passed) ? "🎉 Bạn đã hoàn thành quiz này" : "Bạn đã hết lượt làm bài"}
          open={showAttemptsModal}
          onCancel={() => {
            setShowAttemptsModal(false);
            router.push(`/courses/${courseId}/learn`);
          }}
          footer={[
            <Button key="back" onClick={() => {
              setShowAttemptsModal(false);
              router.push(`/courses/${courseId}/learn`);
            }}>
              Quay lại bài học
            </Button>
          ]}
          width={700}
        >
          <div className="mb-4">
            {previousAttempts.some((a: any) => a.passed) ? (
              <Text className="text-green-600">
                Chúc mừng! Bạn đã hoàn thành quiz này. Dưới đây là kết quả các lần làm bài:
              </Text>
            ) : (
              <Text>
                Bạn đã sử dụng hết số lần làm bài cho quiz này. Dưới đây là kết quả các lần làm bài trước:
              </Text>
            )}
          </div>
          
          <List
            dataSource={previousAttempts}
            renderItem={(attempt: any, index: number) => (
              <List.Item key={attempt.id}>
                <Card className="w-full" size="small">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Space direction="vertical" size="small">
                        <Text strong>Lần {attempt.attempt_no}</Text>
                        <Text type="secondary">
                          {new Date(attempt.submitted_at || attempt.started_at).toLocaleString('vi-VN')}
                        </Text>
                      </Space>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {attempt.submitted_at ? (
                        <>
                          <div className="text-center">
                            <Text strong className="text-lg">{attempt.score_percent}%</Text>
                            <br />
                            <Text type="secondary" className="text-sm">Điểm số</Text>
                          </div>
                          
                          <div>
                            {attempt.passed ? (
                              <Space>
                                <CheckCircleOutlined className="text-green-500 text-xl" />
                                <Text className="text-green-600 font-medium">Đạt</Text>
                              </Space>
                            ) : (
                              <Space>
                                <CloseCircleOutlined className="text-red-500 text-xl" />
                                <Text className="text-red-600 font-medium">Chưa đạt</Text>
                              </Space>
                            )}
                          </div>
                        </>
                      ) : (
                        <Text type="warning">Chưa nộp bài</Text>
                      )}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: 'Chưa có lần làm bài nào' }}
          />
        </Modal>      </div>
    </div>
  );
}
