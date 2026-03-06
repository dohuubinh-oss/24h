'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import {
  ArrowLeft, 
  Save, 
  Upload, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  ListChecks, 
  Settings, 
  PlusCircle, 
  X, 
  FileJson,
  FileText,
  BookOpen,
  Eye,
  Pencil,
  Loader2,
  ImageIcon
} from 'lucide-react';
import KatexRenderer from '../../components/KatexRenderer';
import Alert from '../../components/ui/Alert';
import api from '../../lib/api';

const defaultQuestion = {
  content: '', 
  contentImage: null,
  options: ['', '', '', ''],
  correctOptionIndex: null,
  solution: '', 
  solutionImage: null,
  grade: 'Lớp 12',
  topic: '',
  difficulty: 'Nhận biết',
  type: 'Trắc nghiệm',
  point: 0.25, 
  tags: [],
  notes: ''
};

function CreateQuestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jsonInput, setJsonInput] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    const questionId = searchParams.get('id');
    if (questionId) {
      setIsLoading(true);
      setEditId(questionId);
      const fetchQuestion = async () => {
        try {
          const response = await api.get(`/questions/${questionId}`);
          const fetchedQuestion = response.data.data;
          fetchedQuestion.options = Array.from({ length: 4 }).map((_, i) => fetchedQuestion.options[i] || '');
          fetchedQuestion.tags = fetchedQuestion.tags || [];
          setQuestions([{ ...defaultQuestion, ...fetchedQuestion }]);
          setCurrentIndex(0);
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Không thể tải dữ liệu câu hỏi.';
          setNotification({ type: 'error', message: errorMessage });
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuestion();
    } else {
      setQuestions([{...defaultQuestion, id: Date.now()}]);
      setCurrentIndex(0);
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const currentQuestion = questions.length > 0 ? questions[currentIndex] : null;

  const updateCurrentQuestion = (updates) => {
    if (!currentQuestion) return;
    const newQuestions = [...questions];
    newQuestions[currentIndex] = { ...newQuestions[currentIndex], ...updates };
    setQuestions(newQuestions);
  };
  
  const handleImageUpload = (file, field) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCurrentQuestion({ [field]: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      setNotification({ type: 'error', message: 'Vui lòng chỉ tải lên tệp hình ảnh.' });
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    setNotification({ type: '', message: '' });

    if (editId) {
      const { _id, id, ...questionToUpdate } = questions[0];
      try {
        await api.put(`/questions/${editId}`, questionToUpdate);
        setNotification({ type: 'success', message: 'Cập nhật câu hỏi thành công!' });
        setTimeout(() => router.push('/admin/questions'), 1500);
      } catch (error) { 
        const errorMessage = error.response?.data?.error || error.message || 'Lỗi khi cập nhật.';
        setNotification({ type: 'error', message: errorMessage });
      } finally { 
        setIsSaving(false); 
      }
    } else {
      const questionsToSave = questions.map(({ id, ...rest }) => rest);
      try {
        const response = await api.post('/questions/add-many', questionsToSave);
        setNotification({ type: 'success', message: response.data.message || 'Lưu các câu hỏi thành công!' });
        setQuestions([{...defaultQuestion, id: Date.now()}]);
        setCurrentIndex(0);
      } catch (error) { 
        const errorMessage = error.response?.data?.error || 'Đã có lỗi xảy ra khi lưu.';
        setNotification({ type: 'error', message: errorMessage });
      } finally { 
        setIsSaving(false); 
      }
    }
  };

  const handleDeleteQuestion = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
      const newQuestions = questions.filter((_, index) => index !== currentIndex);
      if (newQuestions.length > 0) {
        setQuestions(newQuestions);
        setCurrentIndex(prev => Math.min(prev, newQuestions.length - 1));
      } else {
        setQuestions([{...defaultQuestion, id: Date.now()}]);
        setCurrentIndex(0);
      }
    }
  };

  const handleProcessJson = (jsonString) => {
    try {
      const parsedData = JSON.parse(jsonString);
      if (Array.isArray(parsedData)) {
        const newQuestions = parsedData.map((q, index) => ({...defaultQuestion, ...q, id: q.id || Date.now() + index }));
        setQuestions(newQuestions);
        setCurrentIndex(0);
        setJsonInput('');
        setNotification({ type: 'success', message: `Đã xử lý thành công ${newQuestions.length} câu hỏi từ JSON.` });
      } else { setNotification({ type: 'error', message: 'Dữ liệu JSON phải là một mảng.' }); }
    } catch (error) { setNotification({ type: 'error', message: 'Định dạng JSON không hợp lệ.' }); }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (e) => handleProcessJson(e.target.result); reader.readAsText(file); }
  };

  const handleNextQuestion = () => { if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1); };
  const handlePreviousQuestion = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const handleOptionTextChange = (index, newText) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = newText;
    updateCurrentQuestion({ options: newOptions });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#2463eb]" /> <span className='ml-4'>Đang tải dữ liệu...</span></div>;
  if (!currentQuestion) return <div className="flex items-center justify-center min-h-screen">Không có dữ liệu câu hỏi để hiển thị.</div>;

  const renderImageUploader = (field) => (
    <div className="relative group border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center min-h-[320px] hover:border-[#2463eb]/50 transition-colors overflow-hidden">
      {currentQuestion[field] ? (
        <>
          <Image src={currentQuestion[field]} alt="Preview" layout="fill" objectFit="contain" className="p-2" />
          {!isPreviewMode && (
            <button onClick={() => updateCurrentQuestion({ [field]: null })} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-100 transition-all"><Trash2 size={16}/></button>
          )}
        </>
      ) : (
        !isPreviewMode && <div className="text-center"><label className="cursor-pointer p-4"><ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-[#2463eb] transition-colors mx-auto" /><p className="mt-3 text-sm text-slate-500 font-medium">Tải lên hình ảnh</p><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], field)} disabled={isSaving} /></label></div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4"><button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600" /></button><h1 className="text-xl font-semibold text-slate-800">{editId ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}</h1></div>
        <div className="flex items-center gap-3"><button onClick={() => setIsPreviewMode(!isPreviewMode)} className="flex items-center gap-2 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors" disabled={isSaving}>{isPreviewMode ? <Pencil className="w-5 h-5" /> : <Eye className="w-5 h-5" />}{isPreviewMode ? 'Chỉnh sửa' : 'Xem trước'}</button><button onClick={handleSave} disabled={isSaving || questions.length === 0} className="bg-[#2463eb] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm shadow-[#2463eb]/20 disabled:opacity-50 disabled:cursor-wait">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isSaving ? 'Đang lưu...' : (editId ? 'Cập nhật câu hỏi' : `Lưu tất cả (${questions.length} câu)`)}</button></div>
      </header>

      <main className="max-w-[1440px] mx-auto p-6 lg:p-8 w-full">
        {notification.message && <div className="mb-6"><Alert type={notification.type} message={notification.message} onClose={() => setNotification({ type: '', message: '' })} /></div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            
            {!editId && (
              <>
                <section>
                  <div className="bg-white rounded-xl shadow-sm border-2 border-[#2463eb]/20 p-5">
                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><FileJson className="w-5 h-5 text-[#2463eb]" /><h2 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Nhập nhanh bằng JSON</h2></div><label className="cursor-pointer group"><input type="file" className="hidden" accept=".json" onChange={handleFileUpload} /><div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 group-hover:bg-[#2463eb]/10 group-hover:text-[#2463eb] transition-colors"><Upload className="w-4 h-4" />Tải lên tệp .json</div></label></div>
                    <div className="space-y-4"><textarea className="w-full min-h-[120px] bg-slate-50 border-slate-200 rounded-lg p-3 focus:ring-[#2463eb] focus:border-[#2463eb] text-sm font-mono placeholder:text-slate-400" placeholder='[ { "content": "..." } ]' value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} /><div className="flex justify-end"><button className="bg-[#2463eb] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#2463eb]/30" onClick={() => handleProcessJson(jsonInput)}><RefreshCw className="w-4 h-4" />Xử lý JSON</button></div></div>
                  </div>
                </section>
                <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3"><span className={`flex h-2 w-2 rounded-full ${questions.length > 0 ? 'bg-green-500' : 'bg-slate-400'}`}></span><span className="text-sm font-semibold text-slate-600">Tìm thấy {questions.length} câu hỏi</span></div>
                  <div className="flex items-center gap-3"><button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" onClick={handlePreviousQuestion} disabled={currentIndex === 0 || isSaving}><ChevronLeft className="w-5 h-5" />Câu trước</button><div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"><span className="text-sm font-bold text-[#2463eb]">Câu hỏi {currentIndex + 1}</span><span className="text-sm font-medium text-slate-400 mx-1">/</span><span className="text-sm font-medium text-slate-400">{questions.length}</span></div><button className="flex items-center gap-1 px-5 py-2 text-sm font-bold text-white bg-[#2463eb] hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-[#2463eb]/20 disabled:opacity-50" onClick={handleNextQuestion} disabled={currentIndex >= questions.length - 1 || isSaving}>Câu sau<ChevronRight className="w-5 h-5" /></button>
                  {!isPreviewMode && <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shadow-sm" onClick={handleDeleteQuestion} disabled={isSaving}><Trash2 className="w-4 h-4" />Xóa câu này</button>}
                  </div>
                </nav>
              </>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Nội dung câu hỏi</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">{renderImageUploader('contentImage')}<div className="flex flex-col">{isPreviewMode ? <div className="flex-grow min-h-[320px] text-base leading-relaxed text-slate-700 bg-slate-50/30 p-5 rounded-xl border border-slate-200 whitespace-pre-wrap"><KatexRenderer text={currentQuestion.content || '(Chưa có nội dung)'} /></div> : <textarea className="flex-grow min-h-[320px] focus:outline-none text-base leading-relaxed text-slate-700 bg-slate-50/30 p-5 rounded-xl border border-slate-200 focus:border-[#2463eb]/40 focus:ring-2 focus:ring-[#2463eb]/5 resize-none whitespace-pre-wrap" value={currentQuestion.content} onChange={(e) => updateCurrentQuestion({ content: e.target.value })} placeholder="Thêm nội dung câu hỏi..." disabled={isSaving}/>}</div></div>
              </div>
            </div>

            {currentQuestion.type === 'Trắc nghiệm' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold flex items-center gap-2"><ListChecks className="w-5 h-5 text-[#2463eb]" />Đáp án</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((optionText, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="flex-shrink-0">
                        <input type="radio" name={`correct-ans-${currentIndex}`} className="w-5 h-5 text-[#2463eb] border-slate-300 focus:ring-[#2463eb]" checked={currentQuestion.correctOptionIndex === index} onChange={() => updateCurrentQuestion({ correctOptionIndex: index })} disabled={isSaving || isPreviewMode} />
                      </div>
                      <div className={`flex-grow flex items-center bg-slate-50 border rounded-lg px-4 py-3 transition-all ${currentQuestion.correctOptionIndex === index ? 'border-[#2463eb]/50 ring-1 ring-[#2463eb]/20' : 'border-slate-200 focus-within:border-[#2463eb]'}`}>
                        <span className={`font-bold mr-3 ${currentQuestion.correctOptionIndex === index ? 'text-[#2463eb]' : 'text-slate-400'}`}>{String.fromCharCode(65 + index)}.</span>
                        {isPreviewMode ? 
                          <div className="text-sm w-full whitespace-pre-wrap"><KatexRenderer text={optionText || '(Chưa có nội dung)'} /></div> :
                          <input className="bg-transparent border-none p-0 w-full focus:ring-0 text-sm" value={optionText} onChange={(e) => handleOptionTextChange(index, e.target.value)} placeholder={`Đáp án ${String.fromCharCode(65 + index)}`} disabled={isSaving} />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-200"><h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2"><FileText className="w-5 h-5" />Lời giải chi tiết</h2></div>
               <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">{renderImageUploader('solutionImage')}<div className="flex flex-col">{isPreviewMode ? <div className="flex-grow min-h-[320px] text-base leading-relaxed text-slate-700 bg-slate-50/30 p-5 rounded-xl border border-slate-200 whitespace-pre-wrap"><KatexRenderer text={currentQuestion.solution || '(Chưa có nội dung)'} /></div> : <textarea className="flex-grow min-h-[320px] focus:outline-none text-base leading-relaxed text-slate-700 bg-slate-50/30 p-5 rounded-xl border border-slate-200 focus:border-[#2463eb]/40 focus:ring-2 focus:ring-[#2463eb]/5 resize-none whitespace-pre-wrap" value={currentQuestion.solution} onChange={(e) => updateCurrentQuestion({ solution: e.target.value })} placeholder="Lời giải chi tiết ..." disabled={isSaving}/>}</div></div></div>
            </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200"><h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2"><BookOpen className="w-5 h-5" />Thông tin bổ sung</h2></div>
                <div className="p-6"><textarea className="w-full min-h-[150px] bg-slate-50 border-slate-200 rounded-lg p-4 focus:ring-[#2463eb] focus:border-[#2463eb] text-sm leading-relaxed whitespace-pre-wrap" value={currentQuestion.notes} onChange={(e) => updateCurrentQuestion({ notes: e.target.value })} placeholder="Công thức cần nhớ, lỗi sai thường gặp..." disabled={isSaving || isPreviewMode}/></div>
            </div>
          </div>

          <div key={currentIndex} className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-[#2463eb]" />Thiết lập câu hỏi</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-xs font-medium text-slate-500 uppercase">Khối lớp</label><select className="w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 text-sm focus:ring-[#2463eb]" value={currentQuestion.grade} onChange={(e) => updateCurrentQuestion({ grade: e.target.value })} disabled={isPreviewMode || isSaving}><option>Lớp 6</option><option>Lớp 7</option><option>Lớp 8</option><option>Lớp 9</option><option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option></select></div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-slate-500 uppercase">Chuyên đề</label><input className="w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 text-sm focus:ring-[#2463eb]" value={currentQuestion.topic} onChange={(e) => updateCurrentQuestion({ topic: e.target.value })} placeholder="VD: Hàm số, Hình học..." disabled={isPreviewMode || isSaving} /></div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-slate-500 uppercase">Loại câu hỏi</label><select className="w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 text-sm focus:ring-[#2463eb]" value={currentQuestion.type} onChange={(e) => updateCurrentQuestion({ type: e.target.value })} disabled={isPreviewMode || isSaving}><option>Trắc nghiệm</option><option>Tự luận</option></select></div>
                  <div className="space-y-2"><label className="text-xs font-medium text-slate-500 uppercase">Độ khó</label><div className="grid grid-cols-2 gap-2">{['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'].map((level) => (<button key={level} onClick={() => updateCurrentQuestion({ difficulty: level })} className={`py-2.5 text-xs font-semibold rounded-lg border transition-all ${currentQuestion.difficulty === level ? 'border-[#2463eb] bg-[#2463eb] text-white shadow-sm shadow-[#2463eb]/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`} disabled={isPreviewMode || isSaving}>{level}</button>))}</div></div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-slate-500 uppercase">Điểm</label><input type="number" step="0.1" className="w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 text-sm focus:ring-[#2463eb]" value={currentQuestion.point} onChange={(e) => updateCurrentQuestion({ point: parseFloat(e.target.value) || 0 })} placeholder="VD: 0.25" disabled={isPreviewMode || isSaving} /></div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase">Thẻ (Tags)</label>
                    <div className="flex flex-wrap gap-2 min-h-[28px]">
                      {currentQuestion.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-[#2463eb]/10 text-[#2463eb] text-xs font-semibold rounded-full">
                          {tag}
                          {!isPreviewMode && <button className="hover:text-blue-800" onClick={() => updateCurrentQuestion({ tags: currentQuestion.tags.filter(t => t !== tag) })} disabled={isSaving}><X className="w-3 h-3" /></button>}
                        </span>
                      ))}
                    </div>
                    {!isPreviewMode && (
                      <div className="relative mt-2">
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:ring-[#2463eb]" placeholder="Thêm thẻ & nhấn Enter" disabled={isSaving} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const target = e.target; const val = target.value.trim(); if (val && !currentQuestion.tags.includes(val)) { updateCurrentQuestion({ tags: [...currentQuestion.tags, val] }); target.value = ''; } } }} />
                        <PlusCircle className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreateQuestionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#2463eb]" /> <span className='ml-4'>Đang khởi tạo...</span></div>}>
      <CreateQuestionsPageContent />
    </Suspense>
  )
}
