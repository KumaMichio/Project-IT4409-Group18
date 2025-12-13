import React, { useState, useEffect } from 'react';
import { courseApi } from '@/lib/courseApi';
import Button from '@/components/common/Button';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import QuizCreator from './QuizCreator';

interface QuizViewerProps {
  courseId: number;
  lessonId: number;
  quizId: number;
  onClose: () => void;
  readOnly?: boolean;
}

export default function QuizViewer({ courseId, lessonId, quizId, onClose, readOnly = false }: QuizViewerProps) {
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const data = await courseApi.getInstructorQuiz(quizId);
      setQuiz(data);
    } catch (err: any) {
      alert('Failed to load quiz: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <QuizCreator
        courseId={courseId}
        lessonId={lessonId}
        quizId={quizId}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false);
          fetchQuiz(); // Reload data after edit
        }}
      />
    );
  }

  if (isLoading) return <div className="p-4 border rounded mt-2 bg-gray-50">Loading quiz...</div>;
  if (!quiz) return <div className="p-4 border rounded mt-2 text-red-500 bg-red-50">Quiz not found</div>;

  return (
    <div className="bg-white p-6 border rounded shadow-lg mt-2 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <CloseOutlined />
      </button>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">{quiz.title}</h3>
          <p className="text-gray-600 text-sm">Pass Score: {quiz.pass_score}%</p>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q: any, index: number) => (
          <div key={q.id} className="border p-4 rounded-lg bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Question {index + 1}</span>
              <span className="text-sm text-gray-500">{q.points} points</span>
            </div>
            <p className="mb-3 text-lg">{q.question}</p>
            
            <div className="space-y-2 pl-4">
              {q.options.map((opt: any) => (
                <div 
                  key={opt.id} 
                  className={`p-2 rounded border ${
                    opt.is_correct 
                      ? 'bg-green-100 border-green-300 text-green-800' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border ${opt.is_correct ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}></div>
                    <span>{opt.option_text}</span>
                    {opt.is_correct && <span className="ml-auto text-xs font-bold text-green-700">CORRECT</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end gap-2">
        {!readOnly && (
          <Button onClick={() => setIsEditing(true)}>
            <EditOutlined /> Edit Quiz
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}