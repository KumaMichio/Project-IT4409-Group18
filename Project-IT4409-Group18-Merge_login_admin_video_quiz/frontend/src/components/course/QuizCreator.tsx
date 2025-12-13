import React, { useState } from 'react';
import Button from '../common/Button';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { courseApi } from '@/lib/courseApi';

interface QuizCreatorProps {
  courseId: number;
  lessonId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function QuizCreator({ courseId, lessonId, onCancel, onSuccess }: QuizCreatorProps) {
  const [title, setTitle] = useState('');
  const [passScore, setPassScore] = useState(60);
  const [questions, setQuestions] = useState<any[]>([
    { question: '', qtype: 'SINGLE_CHOICE', points: 1, options: [{ option_text: '', is_correct: false }] }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', qtype: 'SINGLE_CHOICE', points: 1, options: [{ option_text: '', is_correct: false }] }]);
  };

  const handleAddOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quizData = {
        course_id: courseId,
        lesson_id: lessonId,
        title,
        pass_score: passScore,
        time_limit_s: 0, // Unlimited for now
        attempts_allowed: 0, // Unlimited
        questions
      };
      await courseApi.createQuiz(quizData);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white p-4 border rounded shadow-lg mt-2">
      <h3 className="font-bold mb-4">Create Quiz</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Quiz Title</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Pass Score (%)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={passScore}
            onChange={e => setPassScore(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="border p-3 rounded bg-gray-50">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Question {qIndex + 1}</span>
                {questions.length > 1 && (
                  <button type="button" onClick={() => {
                    const newQ = [...questions];
                    newQ.splice(qIndex, 1);
                    setQuestions(newQ);
                  }} className="text-red-500"><DeleteOutlined /></button>
                )}
              </div>
              <input
                className="w-full p-2 border rounded mb-2"
                placeholder="Question Text"
                value={q.question}
                onChange={e => {
                  const newQ = [...questions];
                  newQ[qIndex].question = e.target.value;
                  setQuestions(newQ);
                }}
                required
              />
              
              <div className="space-y-2 pl-4">
                {q.options.map((opt: any, optIndex: number) => (
                  <div key={optIndex} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name={`q-${qIndex}-correct`}
                      checked={opt.is_correct}
                      onChange={() => {
                        const newQ = [...questions];
                        newQ[qIndex].options.forEach((o: any) => o.is_correct = false);
                        newQ[qIndex].options[optIndex].is_correct = true;
                        setQuestions(newQ);
                      }}
                    />
                    <input
                      className="flex-1 p-1 border rounded"
                      placeholder={`Option ${optIndex + 1}`}
                      value={opt.option_text}
                      onChange={e => {
                        const newQ = [...questions];
                        newQ[qIndex].options[optIndex].option_text = e.target.value;
                        setQuestions(newQ);
                      }}
                      required
                    />
                    <button type="button" onClick={() => {
                      const newQ = [...questions];
                      newQ[qIndex].options.splice(optIndex, 1);
                      setQuestions(newQ);
                    }} className="text-red-500"><DeleteOutlined /></button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={() => handleAddOption(qIndex)}>+ Add Option</Button>
              </div>
            </div>
          ))}
          <Button type="button" onClick={handleAddQuestion} className="w-full">+ Add Question</Button>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Create Quiz</Button>
        </div>
      </form>
    </div>
  );
}