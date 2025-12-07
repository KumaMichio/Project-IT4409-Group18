'use client';

import { Module, Lesson } from './types';

type LessonSidebarProps = {
  modules: Module[];
  currentLessonId?: number;
  expandedModules: Set<number>;
  onToggleModule: (moduleId: number) => void;
  onSelectLesson: (lesson: Lesson) => void;
  courseId: string;
};

const formatDuration = (seconds: number | null) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export function LessonSidebar({
  modules,
  currentLessonId,
  expandedModules,
  onToggleModule,
  onSelectLesson,
  courseId
}: LessonSidebarProps) {
  return (
    <div className="w-96 bg-gray-50 overflow-y-auto shadow-lg">
      <div className="p-4 border-b bg-white">
        <h3 className="text-xl font-bold text-gray-900">Nội dung khóa học</h3>
      </div>

      {modules.map(module => (
        <div key={module.id} className="border-b border-gray-200 bg-white">
          <button
            onClick={() => onToggleModule(module.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-base">
                {module.position}. {module.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {module.lessons.filter(l => l.is_completed).length}/{module.lessons.length}
              </span>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${expandedModules.has(module.id) ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedModules.has(module.id) && (
            <div className="bg-gray-50">
              {module.lessons.map(lesson => (
                <div
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className={`p-3 pl-8 cursor-pointer hover:bg-gray-200 border-l-4 transition-colors ${currentLessonId === lesson.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-transparent'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      {lesson.is_completed ? (
                        <span className="text-green-600 text-base">✓</span>
                      ) : lesson.assets.find(a => a.asset_kind === 'VIDEO') ? (
                        <span className="text-red-600 text-base">▶</span>
                      ) : (
                        <span className="text-gray-500 text-base">○</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {lesson.position}. {lesson.title}
                      </div>

                      {lesson.duration_s && (
                        <div className="text-xs text-gray-600 mt-1">
                          ⏱️ {formatDuration(lesson.duration_s)}
                        </div>
                      )}

                      <div className="mt-2 space-y-1">
                        {lesson.assets.map(asset => (
                          <div key={asset.id}>
                            {asset.asset_kind === 'PDF' && (
                              <a
                                href={asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-medium"
                              >
                                📄 Tài liệu PDF
                              </a>
                            )}
                            {asset.asset_kind === 'LINK' && (
                              <a
                                href={asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-medium"
                              >
                                🔗 Link tham khảo
                              </a>
                            )}
                          </div>
                        ))}

                        {lesson.quiz && (
                          <a
                            href={`/courses/${courseId}/quiz/${lesson.quiz.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-purple-700 hover:underline flex items-center gap-1 font-medium"
                          >
                            📝 Làm bài quiz: {lesson.quiz.title}
                          </a>
                        )}
                      </div>
                    </div>

                    {lesson.requires_quiz_pass && !lesson.is_completed && (
                      <div className="flex-shrink-0">
                        <span className="text-gray-500 text-base">🔒</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
