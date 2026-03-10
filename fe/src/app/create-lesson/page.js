'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { createLesson } from '../../lib/api';
import Alert from '../../components/ui/Alert';
import TiptapEditor from '../../components/editor/TiptapEditor';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BookOpen, 
  Settings,
  Loader2,
  FileText,
  PlusCircle
} from 'lucide-react';

const CreateLessonPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [lesson, setLesson] = useState({
    title: '',
    subject: '',
    grade: 'Lớp 12',
    chapter: '',
    theory: { content: '' },
    sampleExercises: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLesson(prev => ({ ...prev, [name]: value }));
  };

  const handleTheoryChange = (content) => {
    setLesson(prev => ({ ...prev, theory: { ...prev.theory, content } }));
  };

  const handleExerciseChange = (index, field, content) => {
    const updatedExercises = [...lesson.sampleExercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: content };
    setLesson(prev => ({ ...prev, sampleExercises: updatedExercises }));
  };

  const addExercise = () => {
    setLesson(prev => ({
      ...prev,
      sampleExercises: [...prev.sampleExercises, { question: '', modelAnswer: '' }],
    }));
  };

  const removeExercise = (index) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này không?')) {
        const updatedExercises = lesson.sampleExercises.filter((_, i) => i !== index);
        setLesson(prev => ({ ...prev, sampleExercises: updatedExercises }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    if (!user) {
      setNotification({ type: 'error', message: 'Bạn cần đăng nhập để tạo bài giảng.'});
      return;
    }

    if (!lesson.title || !lesson.subject || !lesson.grade || !lesson.chapter) {
        setNotification({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin trong phần Thiết lập bài giảng.' });
        return;
    }
     if (!lesson.theory.content) {
        setNotification({ type: 'error', message: 'Nội dung lý thuyết không được để trống.' });
        return;
    }

    setIsSubmitting(true);

    try {
        const lessonData = { ...lesson, authorId: user._id };
        await createLesson(lessonData);
        setNotification({ type: 'success', message: 'Tạo bài giảng thành công! Bạn sẽ được chuyển hướng sau giây lát.'});
        setTimeout(() => {
            router.push('/lessons');
        }, 2000);
    } catch (err) {
        setNotification({ type: 'error', message: err.response?.data?.message || err.message || 'Đã xảy ra lỗi không xác định'});
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    // Cấp 0: Nền chính trắng (bg-white)
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">Tạo bài giảng mới</h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-wait">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Đang lưu...' : 'Lưu bài giảng'}
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-8 w-full">
        {notification.message && 
            <div className="mb-6">
                <Alert type={notification.type} message={notification.message} onClose={() => setNotification({ type: '', message: '' })} />
            </div>
        }

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Cấp 1: Panel trắng (bg-white) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5" />
                        Nội dung lý thuyết
                    </h2>
                    {/* Cấp 2: Vùng nền xám (bg-slate-50) */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        {/* Cấp 3: Vùng editor trắng (bg-white) */}
                        <div className="h-96 bg-white rounded-md border border-slate-200 overflow-hidden">
                            <TiptapEditor content={lesson.theory.content} onChange={handleTheoryChange} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Bài tập mẫu
                    </h2>
                    <button type="button" onClick={addExercise} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition-colors">
                        <PlusCircle size={16} />
                        Thêm bài tập
                    </button>
                </div>
                <div className="px-6 pb-6 space-y-6">
                    {lesson.sampleExercises.length === 0 ? (
                         <div className="text-center py-10 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-500 text-sm">
                            <p>Chưa có bài tập mẫu nào.</p>
                            <p className="mt-1">Nhấn "Thêm bài tập" để bắt đầu.</p>
                        </div>
                    ) : (
                        lesson.sampleExercises.map((ex, index) => (
                            // Cấp 2: Card bài tập xám (bg-slate-50)
                            <div key={index} className="p-4 rounded-lg bg-slate-50 border border-slate-200 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-700">Bài tập {index + 1}</h3>
                                    <button type="button" onClick={() => removeExercise(index)} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Đề bài</label>
                                        {/* Cấp 3: Vùng editor trắng (bg-white) */}
                                        <div className="h-64 border bg-white border-slate-200 rounded-lg overflow-hidden">
                                            <TiptapEditor content={ex.question} onChange={(content) => handleExerciseChange(index, 'question', content)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Lời giải mẫu</label>
                                        <div className="h-64 border bg-white border-slate-200 rounded-lg overflow-hidden">
                                            <TiptapEditor content={ex.modelAnswer} onChange={(content) => handleExerciseChange(index, 'modelAnswer', content)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Cấp 1: Panel trắng (bg-white) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        Thiết lập bài giảng
                    </h3>
                    <div className="space-y-4">
                         <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">Tiêu đề</label>
                            <input name="title" value={lesson.title} onChange={handleInputChange} className="mt-1 w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="VD: Chuyên đề hàm số" required />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">Chủ đề</label>
                            <input name="subject" value={lesson.subject} onChange={handleInputChange} className="mt-1 w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="VD: Đạo Hàm" required />
                        </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">Khối lớp</label>
                            <select name="grade" value={lesson.grade} onChange={handleInputChange} className="mt-1 w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none">
                                {['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-xs font-medium text-slate-500 uppercase">Chương mục</label>
                            <input name="chapter" value={lesson.chapter} onChange={handleInputChange} className="mt-1 w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="VD: Chương 1: Đạo hàm" required />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateLessonPage;
