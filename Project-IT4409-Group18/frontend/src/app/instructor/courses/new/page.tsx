'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Modal from '@/components/common/Modal';
import { API_URL } from '@/config/api';

interface Module {
  id?: number;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Lesson {
  id?: number;
  title: string;
  position: number;
  duration_s?: number;
  assets: Asset[];
  quiz?: Quiz;
}

interface Asset {
  id?: number;
  asset_kind: 'VIDEO' | 'PDF' | 'LINK';
  url: string;
  position: number;
}

interface QuizOption {
  id?: number;
  option_text: string;
  is_correct: boolean;
  position: number;
}

interface QuizQuestion {
  id?: number;
  question: string;
  qtype: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT';
  position: number;
  points: number;
  options: QuizOption[];
}

interface Quiz {
  id?: number;
  title: string;
  pass_score: number;
  time_limit_s?: number;
  attempts_allowed?: number;
  questions?: QuizQuestion[];
}

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'content'>('info');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_cents: 0,
    currency: 'VND',
    thumbnail_url: '',
    lang: 'vi',
  });

  // Content management
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);
  
  // Modal states
  const [moduleModal, setModuleModal] = useState({ isOpen: false, editing: null as Module | null, index: -1 });
  const [lessonModal, setLessonModal] = useState({ isOpen: false, moduleIndex: -1, editing: null as Lesson | null, lessonIndex: -1 });
  const [videoModal, setVideoModal] = useState({ isOpen: false, moduleIndex: -1, lessonIndex: -1 });
  const [quizModal, setQuizModal] = useState({ isOpen: false, moduleIndex: -1, lessonIndex: -1 });
  
  // Form states
  const [moduleForm, setModuleForm] = useState({ title: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', duration_s: '' });
  const [videoForm, setVideoForm] = useState({ url: '', uploadType: 'url' as 'url' | 'file', file: null as File | null });
  const [quizForm, setQuizForm] = useState<{
    title: string;
    pass_score: number;
    time_limit_s: string;
    attempts_allowed: string;
    questions: QuizQuestion[];
  }>({
    title: '',
    pass_score: 60,
    time_limit_s: '',
    attempts_allowed: '',
    questions: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề khóa học');
      return;
    }

    try {
      setLoading(true);
      // Step 1: Create course
      const response = await apiClient.post('/courses/instructor/my-courses', formData);
      const courseId = response.data.id;

      // Step 2: Add modules, lessons, videos, quizzes
      for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
        const module = modules[moduleIndex];
        
        // Create module
        const moduleResponse = await apiClient.post(`/courses/instructor/my-courses/${courseId}/modules`, {
          title: module.title,
          position: module.position,
        });
        const moduleId = moduleResponse.data.id;

        // Create lessons in module
        for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
          const lesson = module.lessons[lessonIndex];
          
          // Create lesson
          const lessonResponse = await apiClient.post(`/courses/instructor/modules/${moduleId}/lessons`, {
            title: lesson.title,
            position: lesson.position,
            duration_s: lesson.duration_s ? parseInt(lesson.duration_s.toString()) : null,
          });
          const lessonId = lessonResponse.data.id;

          // Add videos/assets
          for (const asset of lesson.assets) {
            if (asset.uploadType === 'file' && asset.file) {
              // Upload file
              const formData = new FormData();
              formData.append('video', asset.file);
              formData.append('position', asset.position.toString());
              
              const token = localStorage.getItem('token');
              await fetch(`${API_URL}/api/courses/instructor/lessons/${lessonId}/assets/upload`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                body: formData,
              });
            } else {
              // Add URL
              await apiClient.post(`/courses/instructor/lessons/${lessonId}/assets`, {
                asset_kind: asset.asset_kind,
                url: asset.url,
                position: asset.position,
              });
            }
          }

          // Add quiz if exists
          if (lesson.quiz) {
            await apiClient.post(`/courses/instructor/lessons/${lessonId}/quizzes`, {
              title: lesson.quiz.title,
              pass_score: lesson.quiz.pass_score,
              time_limit_s: lesson.quiz.time_limit_s ? parseInt(lesson.quiz.time_limit_s.toString()) : null,
              attempts_allowed: lesson.quiz.attempts_allowed ? parseInt(lesson.quiz.attempts_allowed.toString()) : null,
              questions: lesson.quiz.questions || []
            });
          }
        }
      }

      router.push(`/instructor/courses/${courseId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể tạo khóa học');
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  // Module handlers
  const openModuleModal = (module?: Module, index?: number) => {
    setModuleForm({ title: module?.title || '' });
    setModuleModal({ isOpen: true, editing: module || null, index: index ?? -1 });
  };

  const handleSaveModule = () => {
    if (!moduleForm.title.trim()) {
      alert('Vui lòng nhập tên mô-đun');
      return;
    }

    if (moduleModal.editing && moduleModal.index >= 0) {
      // Update existing
      const updated = [...modules];
      updated[moduleModal.index] = {
        ...updated[moduleModal.index],
        title: moduleForm.title,
      };
      setModules(updated);
    } else {
      // Add new
      const newModule: Module = {
        title: moduleForm.title,
        position: modules.length + 1,
        lessons: [],
      };
      setModules([...modules, newModule]);
    }
    setModuleModal({ isOpen: false, editing: null, index: -1 });
    setModuleForm({ title: '' });
  };

  const handleDeleteModule = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa mô-đun này?')) {
      const updated = modules.filter((_, i) => i !== index);
      // Reorder positions
      updated.forEach((m, i) => { m.position = i + 1; });
      setModules(updated);
    }
  };

  // Lesson handlers
  const openLessonModal = (moduleIndex: number, lesson?: Lesson, lessonIndex?: number) => {
    setLessonForm({ title: lesson?.title || '', duration_s: lesson?.duration_s?.toString() || '' });
    setLessonModal({ isOpen: true, moduleIndex, editing: lesson || null, lessonIndex: lessonIndex ?? -1 });
  };

  const handleSaveLesson = () => {
    if (!lessonForm.title.trim()) {
      alert('Vui lòng nhập tên bài học');
      return;
    }

    const updated = [...modules];
    const module = updated[lessonModal.moduleIndex];

    if (lessonModal.editing && lessonModal.lessonIndex >= 0) {
      // Update existing
      module.lessons[lessonModal.lessonIndex] = {
        ...module.lessons[lessonModal.lessonIndex],
        title: lessonForm.title,
        duration_s: lessonForm.duration_s ? parseInt(lessonForm.duration_s) : undefined,
      };
    } else {
      // Add new
      const newLesson: Lesson = {
        title: lessonForm.title,
        position: module.lessons.length + 1,
        duration_s: lessonForm.duration_s ? parseInt(lessonForm.duration_s) : undefined,
        assets: [],
      };
      module.lessons.push(newLesson);
    }

    setModules(updated);
    setLessonModal({ isOpen: false, moduleIndex: -1, editing: null, lessonIndex: -1 });
    setLessonForm({ title: '', duration_s: '' });
  };

  const handleDeleteLesson = (moduleIndex: number, lessonIndex: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      const updated = [...modules];
      updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
      // Reorder positions
      updated[moduleIndex].lessons.forEach((l, i) => { l.position = i + 1; });
      setModules(updated);
    }
  };

  // Video handlers
  const openVideoModal = (moduleIndex: number, lessonIndex: number) => {
    setVideoForm({ url: '', uploadType: 'url', file: null });
    setVideoModal({ isOpen: true, moduleIndex, lessonIndex });
  };

  const handleSaveVideo = () => {
    if (videoForm.uploadType === 'url' && !videoForm.url.trim()) {
      alert('Vui lòng nhập URL video');
      return;
    }
    if (videoForm.uploadType === 'file' && !videoForm.file) {
      alert('Vui lòng chọn file video');
      return;
    }

    const updated = [...modules];
    const lesson = updated[videoModal.moduleIndex].lessons[videoModal.lessonIndex];
    
    const newAsset: Asset & { uploadType?: string; file?: File | null } = {
      asset_kind: 'VIDEO',
      url: videoForm.uploadType === 'url' ? videoForm.url : '',
      position: lesson.assets.length + 1,
      uploadType: videoForm.uploadType,
      file: videoForm.file,
    };
    
    lesson.assets.push(newAsset);
    setModules(updated);
    setVideoModal({ isOpen: false, moduleIndex: -1, lessonIndex: -1 });
    setVideoForm({ url: '', uploadType: 'url', file: null });
  };

  const handleDeleteVideo = (moduleIndex: number, lessonIndex: number, assetIndex: number) => {
    const updated = [...modules];
    updated[moduleIndex].lessons[lessonIndex].assets = updated[moduleIndex].lessons[lessonIndex].assets.filter((_, i) => i !== assetIndex);
    setModules(updated);
  };

  // Quiz handlers
  const openQuizModal = (moduleIndex: number, lessonIndex: number) => {
    const lesson = modules[moduleIndex]?.lessons[lessonIndex];
    setQuizForm({
      title: lesson?.quiz?.title || '',
      pass_score: lesson?.quiz?.pass_score || 60,
      time_limit_s: lesson?.quiz?.time_limit_s?.toString() || '',
      attempts_allowed: lesson?.quiz?.attempts_allowed?.toString() || '',
      questions: lesson?.quiz?.questions || []
    });
    setQuizModal({ isOpen: true, moduleIndex, lessonIndex });
  };

  const handleSaveQuiz = () => {
    if (!quizForm.title.trim()) {
      alert('Vui lòng nhập tên quiz');
      return;
    }

    const updated = [...modules];
    const lesson = updated[quizModal.moduleIndex].lessons[quizModal.lessonIndex];
    
    lesson.quiz = {
      title: quizForm.title,
      pass_score: quizForm.pass_score,
      time_limit_s: quizForm.time_limit_s ? parseInt(quizForm.time_limit_s) : undefined,
      attempts_allowed: quizForm.attempts_allowed ? parseInt(quizForm.attempts_allowed) : undefined,
      questions: quizForm.questions || []
    };
    
    setModules(updated);
    setQuizModal({ isOpen: false, moduleIndex: -1, lessonIndex: -1 });
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: '',
      qtype: 'SINGLE_CHOICE',
      position: quizForm.questions.length + 1,
      points: 1,
      options: [
        { option_text: '', is_correct: false, position: 1 },
        { option_text: '', is_correct: false, position: 2 }
      ]
    };
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, newQuestion]
    });
  };

  const handleQuestionTypeChange = (qIndex: number, newType: QuizQuestion['qtype']) => {
    const updated = [...quizForm.questions];
    const question = updated[qIndex];
    
    if (newType === 'TRUE_FALSE') {
      // Auto-create Đúng/Sai options
      question.options = [
        { option_text: 'Đúng', is_correct: false, position: 1 },
        { option_text: 'Sai', is_correct: false, position: 2 }
      ];
    } else if (newType === 'SINGLE_CHOICE' || newType === 'MULTI_CHOICE') {
      // Ensure at least 2 options
      if (question.options.length < 2) {
        question.options = [
          { option_text: '', is_correct: false, position: 1 },
          { option_text: '', is_correct: false, position: 2 }
        ];
      }
    } else {
      // SHORT_TEXT - no options needed
      question.options = [];
    }
    
    question.qtype = newType;
    setQuizForm({ ...quizForm, questions: updated });
  };

  const removeQuestion = (index: number) => {
    const updated = quizForm.questions.filter((_, i) => i !== index);
    // Reorder positions
    updated.forEach((q, i) => { q.position = i + 1; });
    setQuizForm({ ...quizForm, questions: updated });
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...quizForm.questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizForm({ ...quizForm, questions: updated });
  };

  const addOption = (questionIndex: number) => {
    const updated = [...quizForm.questions];
    const question = updated[questionIndex];
    question.options.push({
      option_text: '',
      is_correct: false,
      position: question.options.length + 1
    });
    setQuizForm({ ...quizForm, questions: updated });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...quizForm.questions];
    const question = updated[questionIndex];
    question.options = question.options.filter((_, i) => i !== optionIndex);
    // Reorder positions
    question.options.forEach((opt, i) => { opt.position = i + 1; });
    setQuizForm({ ...quizForm, questions: updated });
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof QuizOption, value: any) => {
    const updated = [...quizForm.questions];
    updated[questionIndex].options[optionIndex] = {
      ...updated[questionIndex].options[optionIndex],
      [field]: value
    };
    setQuizForm({ ...quizForm, questions: updated });
  };

  const handleDeleteQuiz = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...modules];
    updated[moduleIndex].lessons[lessonIndex].quiz = undefined;
    setModules(updated);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tạo khóa học mới</h1>

      {/* Step indicator */}
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => setStep('info')}
          className={`px-4 py-2 rounded-lg ${step === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          1. Thông tin khóa học
        </button>
        <span className="text-gray-400">→</span>
        <button
          onClick={() => {
            if (!formData.title.trim()) {
              alert('Vui lòng nhập tiêu đề khóa học trước');
              return;
            }
            setStep('content');
          }}
          className={`px-4 py-2 rounded-lg ${step === 'content' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          2. Nội dung khóa học
        </button>
      </div>

      {step === 'info' ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (formData.title.trim()) {
            setStep('content');
          }
        }} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề khóa học *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tiêu đề khóa học"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập mô tả khóa học"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá (VNĐ)
              </label>
              <input
                type="number"
                value={formData.price_cents}
                onChange={(e) => setFormData({ ...formData, price_cents: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ
              </label>
              <select
                value={formData.lang}
                onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL hình ảnh đại diện
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tiếp theo: Thêm nội dung
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin khóa học</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Tiêu đề:</strong> {formData.title}</p>
              {formData.description && <p><strong>Mô tả:</strong> {formData.description}</p>}
              <p><strong>Giá:</strong> {formData.price_cents === 0 ? 'Miễn phí' : `${(formData.price_cents / 100).toLocaleString('vi-VN')} ${formData.currency}`}</p>
            </div>
            <button
              onClick={() => setStep('info')}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Sửa thông tin
            </button>
          </div>

          {/* Content management - reuse from detail page */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Nội dung khóa học</h2>
              <button
                onClick={() => openModuleModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Thêm mô-đun
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-4">Chưa có mô-đun nào</p>
                <button
                  onClick={() => openModuleModal()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thêm mô-đun đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{module.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModuleModal(module, moduleIndex)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteModule(moduleIndex)}
                          className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => openLessonModal(moduleIndex)}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm"
                        >
                          + Bài học
                        </button>
                      </div>
                    </div>

                    {module.lessons.length === 0 ? (
                      <p className="text-gray-500 text-sm">Chưa có bài học nào</p>
                    ) : (
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="border border-gray-200 rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium">{lesson.title}</h4>
                                {lesson.duration_s && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Thời lượng: {Math.floor(lesson.duration_s / 60)}:{(lesson.duration_s % 60).toString().padStart(2, '0')}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openLessonModal(moduleIndex, lesson, lessonIndex)}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(moduleIndex, lessonIndex)}
                                  className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs hover:bg-red-100"
                                >
                                  Xóa
                                </button>
                                <button
                                  onClick={() => openVideoModal(moduleIndex, lessonIndex)}
                                  className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100"
                                >
                                  + Video
                                </button>
                                <button
                                  onClick={() => openQuizModal(moduleIndex, lessonIndex)}
                                  className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100"
                                >
                                  {lesson.quiz ? 'Sửa Quiz' : '+ Quiz'}
                                </button>
                              </div>
                            </div>
                            
                            {lesson.assets.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {lesson.assets.map((asset, assetIndex) => (
                                  <div key={assetIndex} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                    <span className="text-gray-700">
                                      🎥 {asset.uploadType === 'file' ? asset.file?.name : asset.url}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteVideo(moduleIndex, lessonIndex, assetIndex)}
                                      className="text-red-600 hover:text-red-700 text-xs"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {lesson.quiz && (
                              <div className="mt-2 text-sm bg-purple-50 p-2 rounded">
                                <span className="font-medium">Quiz: </span>
                                {lesson.quiz.title} (Điểm đạt: {lesson.quiz.pass_score}%)
                                <button
                                  onClick={() => handleDeleteQuiz(moduleIndex, lessonIndex)}
                                  className="ml-2 text-red-600 hover:text-red-700 text-xs"
                                >
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setStep('info')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || modules.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo khóa học'}
            </button>
          </div>
        </div>
      )}

      {/* Modals - reuse from detail page */}
      <Modal
        isOpen={moduleModal.isOpen}
        onClose={() => setModuleModal({ isOpen: false, editing: null, index: -1 })}
        title={moduleModal.editing ? 'Sửa mô-đun' : 'Thêm mô-đun mới'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên mô-đun *
            </label>
            <input
              type="text"
              value={moduleForm.title}
              onChange={(e) => setModuleForm({ title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Nhập tên mô-đun"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setModuleModal({ isOpen: false, editing: null, index: -1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveModule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={lessonModal.isOpen}
        onClose={() => setLessonModal({ isOpen: false, moduleIndex: -1, editing: null, lessonIndex: -1 })}
        title={lessonModal.editing ? 'Sửa bài học' : 'Thêm bài học mới'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên bài học *
            </label>
            <input
              type="text"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Nhập tên bài học"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời lượng (giây)
            </label>
            <input
              type="number"
              value={lessonForm.duration_s}
              onChange={(e) => setLessonForm({ ...lessonForm, duration_s: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ví dụ: 600"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setLessonModal({ isOpen: false, moduleIndex: -1, editing: null, lessonIndex: -1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveLesson}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={videoModal.isOpen}
        onClose={() => {
          setVideoModal({ isOpen: false, moduleIndex: -1, lessonIndex: -1 });
          setVideoForm({ url: '', uploadType: 'url', file: null });
        }}
        title="Thêm video mới"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại video
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={videoForm.uploadType === 'url'}
                  onChange={(e) => setVideoForm({ ...videoForm, uploadType: 'url' as 'url' | 'file' })}
                  className="mr-2"
                />
                URL (YouTube, Vimeo, etc.)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={videoForm.uploadType === 'file'}
                  onChange={(e) => setVideoForm({ ...videoForm, uploadType: 'file' as 'url' | 'file' })}
                  className="mr-2"
                />
                Upload file (.mp4)
              </label>
            </div>
          </div>

          {videoForm.uploadType === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL video *
              </label>
              <input
                type="url"
                value={videoForm.url}
                onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file video (.mp4) *
              </label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={(e) => setVideoForm({ ...videoForm, file: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {videoForm.file && (
                <p className="mt-2 text-sm text-gray-600">
                  Đã chọn: {videoForm.file.name} ({(videoForm.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setVideoModal({ isOpen: false, moduleIndex: -1, lessonIndex: -1 });
                setVideoForm({ url: '', uploadType: 'url', file: null });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveVideo}
              disabled={videoForm.uploadType === 'url' ? !videoForm.url : !videoForm.file}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={quizModal.isOpen}
        onClose={() => setQuizModal({ isOpen: false, moduleIndex: -1, lessonIndex: -1 })}
        title={modules[quizModal.moduleIndex]?.lessons[quizModal.lessonIndex]?.quiz ? 'Sửa quiz' : 'Thêm quiz mới'}
        size="xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên quiz *
            </label>
            <input
              type="text"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Nhập tên quiz"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điểm đạt (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={quizForm.pass_score}
                onChange={(e) => setQuizForm({ ...quizForm, pass_score: parseInt(e.target.value) || 60 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian (giây)
              </label>
              <input
                type="number"
                value={quizForm.time_limit_s}
                onChange={(e) => setQuizForm({ ...quizForm, time_limit_s: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Không giới hạn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần thử
              </label>
              <input
                type="number"
                value={quizForm.attempts_allowed}
                onChange={(e) => setQuizForm({ ...quizForm, attempts_allowed: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Không giới hạn"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Câu hỏi</h3>
              <button
                onClick={addQuestion}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                + Thêm câu hỏi
              </button>
            </div>

            {quizForm.questions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
            ) : (
              <div className="space-y-4">
                {quizForm.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">Câu {qIndex + 1}</span>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Xóa
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nội dung câu hỏi *
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Nhập câu hỏi"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại câu hỏi *
                          </label>
                          <select
                            value={question.qtype}
                            onChange={(e) => {
                              const newType = e.target.value as QuizQuestion['qtype'];
                              handleQuestionTypeChange(qIndex, newType);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="SINGLE_CHOICE">Chọn một đáp án</option>
                            <option value="MULTI_CHOICE">Chọn nhiều đáp án</option>
                            <option value="TRUE_FALSE">Đúng/Sai</option>
                            <option value="SHORT_TEXT">Trả lời ngắn</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Điểm số
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* Options for SINGLE_CHOICE, MULTI_CHOICE, TRUE_FALSE */}
                      {(question.qtype === 'SINGLE_CHOICE' || question.qtype === 'MULTI_CHOICE' || question.qtype === 'TRUE_FALSE') && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Đáp án {question.qtype === 'TRUE_FALSE' ? '(tự động: Đúng/Sai)' : '*'}
                            </label>
                            {question.qtype !== 'TRUE_FALSE' && (
                              <button
                                onClick={() => addOption(qIndex)}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                + Thêm đáp án
                              </button>
                            )}
                          </div>

                          {question.qtype === 'TRUE_FALSE' ? (
                            <div className="space-y-2">
                              {['Đúng', 'Sai'].map((text, optIndex) => (
                                <label key={optIndex} className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
                                  <input
                                    type="radio"
                                    name={`true-false-${qIndex}`}
                                    checked={question.options[optIndex]?.is_correct || false}
                                    onChange={() => {
                                      question.options.forEach((_, i) => {
                                        updateOption(qIndex, i, 'is_correct', i === optIndex);
                                      });
                                    }}
                                    className="mr-2"
                                  />
                                  <span className="flex-1">{text}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type={question.qtype === 'MULTI_CHOICE' ? 'checkbox' : 'radio'}
                                    name={`question-${qIndex}`}
                                    checked={option.is_correct}
                                    onChange={(e) => {
                                      if (question.qtype === 'SINGLE_CHOICE') {
                                        // Only one correct answer for single choice
                                        question.options.forEach((_, i) => {
                                          updateOption(qIndex, i, 'is_correct', i === optIndex);
                                        });
                                      } else {
                                        // Multiple correct answers for multi choice
                                        updateOption(qIndex, optIndex, 'is_correct', e.target.checked);
                                      }
                                    }}
                                    className="mr-2"
                                  />
                                  <input
                                    type="text"
                                    value={option.option_text}
                                    onChange={(e) => updateOption(qIndex, optIndex, 'option_text', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder={`Đáp án ${optIndex + 1}`}
                                  />
                                  {question.options.length > 2 && (
                                    <button
                                      onClick={() => removeOption(qIndex, optIndex)}
                                      className="text-red-600 hover:text-red-700 text-sm px-2"
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {question.qtype === 'SHORT_TEXT' && (
                        <div className="text-sm text-gray-600 italic">
                          Câu hỏi tự luận - học viên sẽ nhập câu trả lời dạng text
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 border-t pt-4">
            <button
              onClick={() => setQuizModal({ isOpen: false, moduleIndex: -1, lessonIndex: -1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
