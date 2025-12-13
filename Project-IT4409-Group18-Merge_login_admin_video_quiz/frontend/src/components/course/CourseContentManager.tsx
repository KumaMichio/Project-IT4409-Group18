import { useState, useEffect } from 'react';
import { courseApi, Module, Lesson } from '@/lib/courseApi';
import Button from '@/components/common/Button';
import { PlusOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined } from '@ant-design/icons';
import QuizCreator from './QuizCreator';

interface CourseContentManagerProps {
  courseId: number;
}

export default function CourseContentManager({ courseId }: CourseContentManagerProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Module Form State
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');

  // Lesson Form State
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [addingQuizToLessonId, setAddingQuizToLessonId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', duration_s: 0, requires_quiz_pass: false, video_url: '' });

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  const fetchContent = async () => {
    try {
      const data = await courseApi.getInstructorCourseContent(courseId);
      setModules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Module Handlers ---
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await courseApi.createModule(courseId, moduleTitle);
      setModuleTitle('');
      setIsAddingModule(false);
      fetchContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateModule = async (moduleId: number) => {
    try {
      await courseApi.updateModule(moduleId, moduleTitle);
      setEditingModuleId(null);
      setModuleTitle('');
      fetchContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure? All lessons in this module will be deleted.')) return;
    try {
      await courseApi.deleteModule(moduleId);
      fetchContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Lesson Handlers ---
  const handleAddLesson = async (moduleId: number, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await courseApi.createLesson(moduleId, lessonForm);
      setLessonForm({ title: '', duration_s: 0, requires_quiz_pass: false, video_url: '' });
      setAddingLessonToModuleId(null);
      fetchContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateLesson = async (lessonId: number) => {
    try {
      await courseApi.updateLesson(lessonId, lessonForm);
      setEditingLessonId(null);
      setLessonForm({ title: '', duration_s: 0, requires_quiz_pass: false, video_url: '' });
      fetchContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await courseApi.deleteLesson(lessonId);
      fetchContent();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <div>Loading content...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Course Content</h2>
        <Button onClick={() => setIsAddingModule(true)} disabled={isAddingModule}>
          <PlusOutlined /> Add Module
        </Button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {isAddingModule && (
        <form onSubmit={handleAddModule} className="bg-gray-50 p-4 rounded border">
          <input
            type="text"
            placeholder="Module Title"
            className="w-full p-2 border rounded mb-2"
            value={moduleTitle}
            onChange={e => setModuleTitle(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="outline" onClick={() => setIsAddingModule(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {modules.map(module => (
          <div key={module.id} className="border rounded-lg overflow-hidden">
            {/* Module Header */}
            <div className="bg-gray-100 p-4 flex justify-between items-center">
              {editingModuleId === module.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    className="flex-1 p-1 border rounded"
                    value={moduleTitle}
                    onChange={e => setModuleTitle(e.target.value)}
                  />
                  <Button size="sm" onClick={() => handleUpdateModule(module.id)}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingModuleId(null)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <h3 className="font-medium">{module.title}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingModuleId(module.id); setModuleTitle(module.title); }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <EditOutlined />
                    </button>
                    <button 
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Lessons List */}
            <div className="p-4 space-y-2">
              {module.lessons?.map(lesson => (
                <div key={lesson.id} className="mb-1">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200">
                    {editingLessonId === lesson.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          className="w-full p-1 border rounded"
                          value={lessonForm.title}
                          onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                          placeholder="Lesson Title"
                        />
                        <input
                          className="w-full p-1 border rounded"
                          value={lessonForm.video_url}
                          onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})}
                          placeholder="Video URL (e.g. YouTube link)"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-24 p-1 border rounded"
                            value={lessonForm.duration_s}
                            onChange={e => setLessonForm({...lessonForm, duration_s: parseInt(e.target.value)})}
                            placeholder="Duration (s)"
                          />
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={lessonForm.requires_quiz_pass}
                              onChange={e => setLessonForm({...lessonForm, requires_quiz_pass: e.target.checked})}
                            />
                            Quiz Required
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateLesson(lesson.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingLessonId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <VideoCameraOutlined className="text-gray-400" />
                          <span>{lesson.title}</span>
                          <span className="text-xs text-gray-500">({Math.floor(lesson.duration_s / 60)}m {lesson.duration_s % 60}s)</span>
                          {lesson.requires_quiz_pass && <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Quiz Required</span>}
                          {lesson.video_url && <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Video</span>}
                          {lesson.has_quiz && <span className="text-xs bg-green-100 text-green-800 px-1 rounded">Quiz Added</span>}
                        </div>
                        <div className="flex gap-2 items-center">
                          <button 
                            onClick={() => setAddingQuizToLessonId(lesson.id)}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-green-50"
                            title="Add Quiz"
                          >
                            <PlusOutlined /> Quiz
                          </button>
                          <button 
                            onClick={() => { 
                              setEditingLessonId(lesson.id); 
                              setLessonForm({ 
                                title: lesson.title, 
                                duration_s: lesson.duration_s, 
                                requires_quiz_pass: lesson.requires_quiz_pass,
                                video_url: lesson.video_url || ''
                              }); 
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <EditOutlined />
                          </button>
                          <button 
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  {addingQuizToLessonId === lesson.id && (
                    <QuizCreator
                      courseId={courseId}
                      lessonId={lesson.id}
                      onCancel={() => setAddingQuizToLessonId(null)}
                      onSuccess={() => {
                        setAddingQuizToLessonId(null);
                        fetchContent();
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Add Lesson Form */}
              {addingLessonToModuleId === module.id ? (
                <form onSubmit={(e) => handleAddLesson(module.id, e)} className="mt-2 p-3 border border-dashed rounded bg-gray-50">
                  <div className="space-y-2">
                    <input
                      className="w-full p-1 border rounded"
                      value={lessonForm.title}
                      onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                      placeholder="New Lesson Title"
                      required
                    />
                    <input
                      className="w-full p-1 border rounded"
                      value={lessonForm.video_url}
                      onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})}
                      placeholder="Video URL (e.g. YouTube link)"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="w-24 p-1 border rounded"
                        value={lessonForm.duration_s}
                        onChange={e => setLessonForm({...lessonForm, duration_s: parseInt(e.target.value)})}
                        placeholder="Duration (s)"
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={lessonForm.requires_quiz_pass}
                          onChange={e => setLessonForm({...lessonForm, requires_quiz_pass: e.target.checked})}
                        />
                        Quiz Required
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Add Lesson</Button>
                      <Button size="sm" variant="outline" onClick={() => setAddingLessonToModuleId(null)}>Cancel</Button>
                    </div>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setAddingLessonToModuleId(module.id);
                    setLessonForm({ title: '', duration_s: 0, requires_quiz_pass: false, video_url: '' });
                  }}
                  className="w-full py-2 border border-dashed rounded text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusOutlined /> Add Lesson
                </button>
              )}
            </div>
          </div>
        ))}
        
        {modules.length === 0 && !isAddingModule && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            No content yet. Click "Add Module" to start.
          </div>
        )}
      </div>
    </div>
  );
}
