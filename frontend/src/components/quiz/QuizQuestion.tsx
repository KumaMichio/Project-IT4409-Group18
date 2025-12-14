import React from 'react';
import { Card, Radio, Checkbox, Space, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export type QuizOption = {
  id: number;
  option_text: string;
  is_correct: boolean;
  position: number;
};

export type QuizQuestionData = {
  id: number;
  question: string;
  qtype: string;
  position: number;
  points: number;
  options: QuizOption[];
};

interface QuizQuestionProps {
  question: QuizQuestionData;
  questionNumber: number;
  userAnswer?: number | number[];
  submitted: boolean;
  onChange: (questionId: number, value: number | number[]) => void;
}

export default function QuizQuestion({
  question,
  questionNumber,
  userAnswer,
  submitted,
  onChange
}: QuizQuestionProps) {
  const isMultiChoice = question.qtype === 'MULTI_CHOICE';

  const handleCheckboxChange = (optionId: number, checked: boolean) => {
    const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
    const newAnswers = checked
      ? [...currentAnswers, optionId]
      : currentAnswers.filter(id => id !== optionId);
    onChange(question.id, newAnswers);
  };

  return (
    <Card className="shadow-sm">
      <div className="mb-4">
        <Text strong className="text-base">
          Câu {questionNumber}: {question.question}
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

      {isMultiChoice ? (
        <Space direction="vertical" className="w-full">
          {question.options.map(option => {
            const isSelected = Array.isArray(userAnswer) && userAnswer.includes(option.id);
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
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                  disabled={submitted}
                  className="w-full"
                >
                  <span className={showCorrect ? 'text-green-700 font-medium' : showWrong ? 'text-red-700' : ''}>
                    {option.option_text}
                  </span>
                  {showCorrect && <CheckCircleOutlined className="ml-2 text-green-600" />}
                  {showWrong && <CloseCircleOutlined className="ml-2 text-red-600" />}
                </Checkbox>
              </div>
            );
          })}
        </Space>
      ) : (
        <Radio.Group
          value={userAnswer}
          onChange={(e) => onChange(question.id, e.target.value)}
          disabled={submitted}
          className="w-full"
        >
          <Space direction="vertical" className="w-full">
            {question.options.map(option => {
              const isSelected = userAnswer === option.id;
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
      )}
    </Card>
  );
}
