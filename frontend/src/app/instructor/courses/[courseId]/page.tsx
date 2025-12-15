'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Modal from '@/components/common/Modal';
import { API_URL } from '@/config/api';
import { getToken } from '@/lib/auth';
import { normalizeImageUrl } from '@/utils/imageUrl';

interface Module {
  id: number;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  position: number;
  duration_s: number | null;
  requires_quiz_pass: boolean;
  assets: Asset[];
  quiz: Quiz | null;
}

interface Asset {
  id: number;
  asset_kind: 'VIDEO' | 'PDF' | 'LINK';
  url: string;
  position: number;
}

interface Quiz {
  id: number;
  title: string;
  time_limit_s: number | null;
  attempts_allowed: number | null;
  pass_score: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  is_published: boolean;
  thumbnail_url: string;
  modules: Module[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'content'>('info');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_cents: 0,
    currency: 'VND',
    thumbnail_url: '',
    thumbnail_uploadType: 'url' as 'url' | 'file',
    thumbnail_file: null as File | null,
    is_published: false,
  });

  // Modal states
  const [moduleModal, setModuleModal] = useState({ isOpen: false, editing: null as Module | null });
  const [lessonModal, setLessonModal] = useState({ isOpen: false, moduleId: 0, editing: null as Lesson | null });
  const [videoModal, setVideoModal] = useState({ isOpen: false, lessonId: 0, editing: null as Asset | null });
  const [quizModal, setQuizModal] = useState({ isOpen: false, lessonId: 0, editing: null as Quiz | null });
  const [documentModal, setDocumentModal] = useState({ isOpen: false, lessonId: 0, editing: null as Asset | null });
  
  // Form states
  const [moduleForm, setModuleForm] = useState({ title: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', duration_s: '' });
  const [videoForm, setVideoForm] = useState({ url: '', uploadType: 'url' as 'url' | 'file', file: null as File | null });
  const [quizForm, setQuizForm] = useState({ title: '', pass_score: 60, time_limit_s: '', attempts_allowed: '' });
  const [documentForm, setDocumentForm] = useState({ 
    asset_kind: 'PDF' as 'PDF' | 'LINK', 
    url: '', 
    uploadType: 'url' as 'url' | 'file', 
    file: null as File | null 
  });

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Course>(`/courses/instructor/my-courses/${courseId}`);
      setCourse(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description || '',
        price_cents: response.data.price_cents,
        currency: response.data.currency,
        thumbnail_url: response.data.thumbnail_url || '',
        thumbnail_uploadType: 'url',
        thumbnail_file: null,
        is_published: response.data.is_published,
      });
    } catch (err: any) {
      console.error('Error fetching course:', err);
      alert('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      // Upload thumbnail if file is selected
      let thumbnailUrl = formData.thumbnail_url;
      if (formData.thumbnail_uploadType === 'file' && formData.thumbnail_file) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('thumbnail', formData.thumbnail_file);
        
        const token = getToken();
        if (!token) {
          alert('Vui lòng đăng nhập lại');
          router.push('/auth/login');
          return;
        }
        
        const thumbnailResponse = await fetch(`${API_URL}/api/courses/instructor/my-courses/upload-thumbnail`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: thumbnailFormData,
        });
        
        if (!thumbnailResponse.ok) {
          let errorMessage = 'Upload thumbnail failed';
          try {
            const contentType = thumbnailResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const error = await thumbnailResponse.json();
              errorMessage = error.error || error.message || 'Upload thumbnail failed';
            } else {
              errorMessage = `Server error: ${thumbnailResponse.status} ${thumbnailResponse.statusText}`;
            }
          } catch (e) {
            errorMessage = `Server error: ${thumbnailResponse.status} ${thumbnailResponse.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        const thumbnailResult = await thumbnailResponse.json();
        thumbnailUrl = thumbnailResult.url;
      }
      
      // Update course with thumbnail URL
      const courseData = {
        ...formData,
        thumbnail_url: thumbnailUrl,
      };
      
      await apiClient.put(`/courses/instructor/my-courses/${courseId}`, courseData);
      alert('Cập nhật thành công!');
      fetchCourse();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : (err.response?.data?.error || 'Không thể cập nhật'));
    }
  };

  // Module handlers
  const openModuleModal = (module?: Module) => {
    setModuleForm({ title: module?.title || '' });
    setModuleModal({ isOpen: true, editing: module || null });
  };

  const handleSaveModule = async () => {
    try {
      if (moduleModal.editing) {
        await apiClient.put(`/courses/instructor/modules/${moduleModal.editing.id}`, { title: moduleForm.title });
      } else {
        const modules = course?.modules || [];
        const position = modules.length + 1;
        await apiClient.post(`/courses/instructor/my-courses/${courseId}/modules`, {
          title: moduleForm.title,
          position,
        });
      }
      setModuleModal({ isOpen: false, editing: null });
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể lưu mô-đun');
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mô-đun này?')) return;
    try {
      await apiClient.delete(`/courses/instructor/modules/${moduleId}`);
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa mô-đun');
    }
  };

  // Lesson handlers
  const openLessonModal = (moduleId: number, lesson?: Lesson) => {
    setLessonForm({ title: lesson?.title || '', duration_s: lesson?.duration_s?.toString() || '' });
    setLessonModal({ isOpen: true, moduleId, editing: lesson || null });
  };

  const handleSaveLesson = async () => {
    try {
      if (lessonModal.editing) {
        await apiClient.put(`/courses/instructor/lessons/${lessonModal.editing.id}`, {
          title: lessonForm.title,
          duration_s: lessonForm.duration_s ? parseInt(lessonForm.duration_s) : null,
        });
      } else {
        const module = course?.modules.find(m => m.id === lessonModal.moduleId);
        const position = (module?.lessons.length || 0) + 1;
        await apiClient.post(`/courses/instructor/modules/${lessonModal.moduleId}/lessons`, {
          title: lessonForm.title,
          position,
          duration_s: lessonForm.duration_s ? parseInt(lessonForm.duration_s) : null,
        });
      }
      setLessonModal({ isOpen: false, moduleId: 0, editing: null });
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể lưu bài học');
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      await apiClient.delete(`/courses/instructor/lessons/${lessonId}`);
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa bài học');
    }
  };

  // Video handlers
  const openVideoModal = (lessonId: number, asset?: Asset) => {
    setVideoForm({ url: asset?.url || '', uploadType: 'url', file: null });
    setVideoModal({ isOpen: true, lessonId, editing: asset || null });
  };

  const handleSaveVideo = async () => {
    try {
      if (videoModal.editing) {
        await apiClient.put(`/courses/instructor/assets/${videoModal.editing.id}`, {
          url: videoForm.url,
        });
      } else {
        if (videoForm.uploadType === 'file' && videoForm.file) {
          // Upload file
          const formData = new FormData();
          formData.append('video', videoForm.file);
          formData.append('position', '1');
          
          const token = getToken();
          if (!token) {
            alert('Vui lòng đăng nhập lại');
            router.push('/auth/login');
            return;
          }
          
          const response = await fetch(`${API_URL}/api/courses/instructor/lessons/${videoModal.lessonId}/assets/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
          }
        } else {
          // Add URL
          await apiClient.post(`/courses/instructor/lessons/${videoModal.lessonId}/assets`, {
            asset_kind: 'VIDEO',
            url: videoForm.url,
            position: 1,
          });
        }
      }
      setVideoModal({ isOpen: false, lessonId: 0, editing: null });
      setVideoForm({ url: '', uploadType: 'url', file: null });
      fetchCourse();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : (err.response?.data?.error || 'Không thể lưu video'));
    }
  };

  const handleDeleteVideo = async (assetId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa video này?')) return;
    try {
      await apiClient.delete(`/courses/instructor/assets/${assetId}`);
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa video');
    }
  };

  // Quiz handlers
  const openQuizModal = (lessonId: number, quiz?: Quiz) => {
    setQuizForm({
      title: quiz?.title || '',
      pass_score: quiz?.pass_score || 60,
      time_limit_s: quiz?.time_limit_s?.toString() || '',
      attempts_allowed: quiz?.attempts_allowed?.toString() || '',
    });
    setQuizModal({ isOpen: true, lessonId, editing: quiz || null });
  };

  const handleSaveQuiz = async () => {
    try {
      if (quizModal.editing) {
        await apiClient.put(`/courses/instructor/quizzes/${quizModal.editing.id}`, {
          title: quizForm.title,
          pass_score: quizForm.pass_score,
          time_limit_s: quizForm.time_limit_s ? parseInt(quizForm.time_limit_s) : null,
          attempts_allowed: quizForm.attempts_allowed ? parseInt(quizForm.attempts_allowed) : null,
        });
      } else {
        await apiClient.post(`/courses/instructor/lessons/${quizModal.lessonId}/quizzes`, {
          title: quizForm.title,
          pass_score: quizForm.pass_score,
          time_limit_s: quizForm.time_limit_s ? parseInt(quizForm.time_limit_s) : null,
          attempts_allowed: quizForm.attempts_allowed ? parseInt(quizForm.attempts_allowed) : null,
        });
      }
      setQuizModal({ isOpen: false, lessonId: 0, editing: null });
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể lưu quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quiz này?')) return;
    try {
      await apiClient.delete(`/courses/instructor/quizzes/${quizId}`);
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa quiz');
    }
  };

  // Document handlers
  const openDocumentModal = (lessonId: number, asset?: Asset) => {
    setDocumentForm({ 
      asset_kind: asset?.asset_kind === 'LINK' ? 'LINK' : 'PDF', 
      url: asset?.url || '',
      uploadType: 'url',
      file: null
    });
    setDocumentModal({ isOpen: true, lessonId, editing: asset || null });
  };

  const handleSaveDocument = async () => {
    try {
      // Validate
      if (documentForm.uploadType === 'file') {
        if (!documentForm.file) {
          alert('Vui lòng chọn file PDF');
          return;
        }
      } else {
        if (!documentForm.url.trim()) {
          alert('Vui lòng nhập URL tài liệu');
          return;
        }
      }

      if (documentModal.editing) {
        // Update existing asset
        await apiClient.put(`/courses/instructor/assets/${documentModal.editing.id}`, {
          url: documentForm.url,
        });
      } else {
        // Create new asset - always PDF
        if (documentForm.uploadType === 'file' && documentForm.file) {
          // Upload PDF file
          const formData = new FormData();
          formData.append('document', documentForm.file);
          formData.append('position', '1');
          
          const token = getToken();
          if (!token) {
            alert('Vui lòng đăng nhập lại');
            router.push('/auth/login');
            return;
          }
          
          const response = await fetch(`${API_URL}/api/courses/instructor/lessons/${documentModal.lessonId}/assets/upload-pdf`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          
          if (!response.ok) {
            let errorMessage = 'Upload failed';
            try {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                errorMessage = error.error || error.message || 'Upload failed';
              } else {
                const text = await response.text();
                errorMessage = `Server error: ${response.status} ${response.statusText}`;
                console.error('Non-JSON error response:', text);
              }
            } catch (e) {
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }
          
          // Parse response if successful
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            console.log('Upload PDF successful:', result);
          }
        } else {
          // Add URL - default to PDF
          const module = course?.modules.find(m => 
            m.lessons.some(l => l.id === documentModal.lessonId)
          );
          const lesson = module?.lessons.find(l => l.id === documentModal.lessonId);
          const position = (lesson?.assets.length || 0) + 1;
          
          await apiClient.post(`/courses/instructor/lessons/${documentModal.lessonId}/assets`, {
            asset_kind: 'PDF',
            url: documentForm.url,
            position,
          });
        }
      }
      setDocumentModal({ isOpen: false, lessonId: 0, editing: null });
      setDocumentForm({ asset_kind: 'PDF', url: '', uploadType: 'url', file: null });
      await fetchCourse();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : (err.response?.data?.error || 'Không thể lưu tài liệu'));
    }
  };

  const handleDeleteDocument = async (assetId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await apiClient.delete(`/courses/instructor/assets/${assetId}`);
      fetchCourse();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa tài liệu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div>Không tìm thấy khóa học</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push('/instructor/courses')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Quay lại danh sách
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab(activeTab === 'info' ? 'content' : 'info')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {activeTab === 'info' ? 'Quản lý nội dung' : 'Thông tin khóa học'}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'info' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá (VNĐ)
              </label>
              <input
                type="number"
                value={formData.price_cents || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, price_cents: value === '' ? 0 : parseInt(value) || 0 });
                }}
                min="0"
                placeholder="Nhập giá khóa học"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh đại diện
              </label>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cách thêm hình ảnh
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={formData.thumbnail_uploadType === 'file'}
                      onChange={(e) => setFormData({ ...formData, thumbnail_uploadType: 'file' as 'url' | 'file', thumbnail_url: '' })}
                      className="mr-2"
                    />
                    Upload từ máy tính
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="url"
                      checked={formData.thumbnail_uploadType === 'url'}
                      onChange={(e) => setFormData({ ...formData, thumbnail_uploadType: 'url' as 'url' | 'file', thumbnail_file: null })}
                      className="mr-2"
                    />
                    URL từ Drive/Dropbox
                  </label>
                </div>
              </div>
              
              {formData.thumbnail_uploadType === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn file ảnh * (.jpg, .png, .gif, .webp)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => setFormData({ ...formData, thumbnail_file: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {formData.thumbnail_file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Đã chọn: {formData.thumbnail_file.name} ({(formData.thumbnail_file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  {formData.thumbnail_file && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(formData.thumbnail_file)} 
                        alt="Preview" 
                        className="max-w-xs max-h-48 object-cover rounded"
                      />
                    </div>
                  )}
                  {formData.thumbnail_url && !formData.thumbnail_file && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Hình ảnh hiện tại:</p>
                      <img 
                        src={normalizeImageUrl(formData.thumbnail_url)} 
                        alt="Current thumbnail" 
                        className="max-w-xs max-h-48 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL hình ảnh
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://drive.google.com/... hoặc https://dropbox.com/..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Nhập URL từ Google Drive, Dropbox, hoặc link trực tiếp
                  </p>
                  {formData.thumbnail_url && (
                    <div className="mt-2">
                      <img 
                        src={normalizeImageUrl(formData.thumbnail_url)} 
                        alt="Current thumbnail" 
                        className="max-w-xs max-h-48 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Xuất bản khóa học</label>
          </div>

          <button
            onClick={handleUpdateCourse}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      ) : (
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

          {course.modules.length === 0 ? (
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
              {course.modules.map((module) => (
                <div key={module.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModuleModal(module)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => openLessonModal(module.id)}
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
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="border border-gray-200 rounded p-3">
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
                                onClick={() => openLessonModal(module.id, lesson)}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs hover:bg-red-100"
                              >
                                Xóa
                              </button>
                              <button
                                onClick={() => openVideoModal(lesson.id)}
                                className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100"
                              >
                                + Video
                              </button>
                              <button
                                onClick={() => openQuizModal(lesson.id, lesson.quiz || undefined)}
                                className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100"
                              >
                                {lesson.quiz ? 'Sửa Quiz' : '+ Quiz'}
                              </button>
                              <button
                                onClick={() => openDocumentModal(lesson.id)}
                                className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs hover:bg-orange-100"
                              >
                                + Tài liệu
                              </button>
                            </div>
                          </div>
                          
                          {lesson.assets.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {lesson.assets.map((asset) => {
                                const getIcon = () => {
                                  if (asset.asset_kind === 'VIDEO') return '🎥';
                                  if (asset.asset_kind === 'PDF') return '📄';
                                  if (asset.asset_kind === 'LINK') return '🔗';
                                  return '';
                                };
                                const handleDelete = () => {
                                  if (asset.asset_kind === 'VIDEO') {
                                    handleDeleteVideo(asset.id);
                                  } else {
                                    handleDeleteDocument(asset.id);
                                  }
                                };
                                return (
                                  <div key={asset.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                    <span className="text-gray-700">
                                      {getIcon()} {asset.url}
                                    </span>
                                    <button
                                      onClick={handleDelete}
                                      className="text-red-600 hover:text-red-700 text-xs"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {lesson.quiz && (
                            <div className="mt-2 text-sm bg-purple-50 p-2 rounded">
                              <span className="font-medium">Quiz: </span>
                              {lesson.quiz.title} (Điểm đạt: {lesson.quiz.pass_score}%)
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
      )}

      {/* Module Modal */}
      <Modal
        isOpen={moduleModal.isOpen}
        onClose={() => setModuleModal({ isOpen: false, editing: null })}
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
              onClick={() => setModuleModal({ isOpen: false, editing: null })}
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

      {/* Lesson Modal */}
      <Modal
        isOpen={lessonModal.isOpen}
        onClose={() => setLessonModal({ isOpen: false, moduleId: 0, editing: null })}
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
              onClick={() => setLessonModal({ isOpen: false, moduleId: 0, editing: null })}
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

      {/* Video Modal */}
      <Modal
        isOpen={videoModal.isOpen}
        onClose={() => {
          setVideoModal({ isOpen: false, lessonId: 0, editing: null });
          setVideoForm({ url: '', uploadType: 'url', file: null });
        }}
        title={videoModal.editing ? 'Sửa video' : 'Thêm video mới'}
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
                setVideoModal({ isOpen: false, lessonId: 0, editing: null });
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

      {/* Quiz Modal */}
      <Modal
        isOpen={quizModal.isOpen}
        onClose={() => setQuizModal({ isOpen: false, lessonId: 0, editing: null })}
        title={quizModal.editing ? 'Sửa quiz' : 'Thêm quiz mới'}
        size="lg"
      >
        <div className="space-y-4">
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
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setQuizModal({ isOpen: false, lessonId: 0, editing: null })}
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

      {/* Document Modal */}
      <Modal
        isOpen={documentModal.isOpen}
        onClose={() => {
          setDocumentModal({ isOpen: false, lessonId: 0, editing: null });
          setDocumentForm({ asset_kind: 'PDF', url: '', uploadType: 'url', file: null });
        }}
        title={documentModal.editing ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}
        size="lg"
      >
        <div className="space-y-4">
          {!documentModal.editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cách thêm tài liệu
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={documentForm.uploadType === 'file'}
                    onChange={(e) => setDocumentForm({ ...documentForm, uploadType: 'file' as 'url' | 'file', url: '' })}
                    className="mr-2"
                  />
                  Upload từ máy tính
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="url"
                    checked={documentForm.uploadType === 'url'}
                    onChange={(e) => setDocumentForm({ ...documentForm, uploadType: 'url' as 'url' | 'file', file: null })}
                    className="mr-2"
                  />
                  URL từ Drive/Dropbox
                </label>
              </div>
            </div>
          )}

          {documentForm.uploadType === 'file' && !documentModal.editing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file PDF * (.pdf)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {documentForm.file && (
                <p className="mt-2 text-sm text-gray-600">
                  Đã chọn: {documentForm.file.name} ({(documentForm.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL tài liệu *
              </label>
              <input
                type="url"
                value={documentForm.url}
                onChange={(e) => setDocumentForm({ ...documentForm, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://drive.google.com/... hoặc https://dropbox.com/..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Nhập URL từ Google Drive, Dropbox, hoặc link trực tiếp
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setDocumentModal({ isOpen: false, lessonId: 0, editing: null });
                setDocumentForm({ asset_kind: 'PDF', url: '', uploadType: 'url', file: null });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveDocument}
              disabled={
                documentForm.asset_kind === 'PDF' && documentForm.uploadType === 'file'
                  ? !documentForm.file
                  : !documentForm.url.trim()
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
