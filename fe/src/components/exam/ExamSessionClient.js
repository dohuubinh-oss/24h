'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation'; // Import useRouter
import {
  Menu,
  Timer,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  LayoutGrid,
  Lightbulb,
  UploadCloud,
  X,
  ScanLine,
} from 'lucide-react';

const TiptapEditor = dynamic(() => import('../editor/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 w-full bg-transparent text-[#141414] p-4">
      <p className="text-slate-400">Đang tải trình soạn thảo...</p>
    </div>
  ),
});

export default function ExamSessionClient({ exam }) {
  const router = useRouter(); // Khởi tạo router
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState((exam.duration || 15) * 60);

  const [studentAnswer, setStudentAnswer] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State để theo dõi việc nộp bài

  const fileInputRef = useRef(null);
  const [handwrittenImage, setHandwrittenImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [handwrittenImageFile, setHandwrittenImageFile] = useState(null);

  const questions = exam.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const subjectDisplay = `${exam.examType || 'Bài kiểm tra'} - ${exam.grade || 'Không xác định'}`.toUpperCase();

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      } else {
        // Tự động nộp bài khi hết giờ
        handleSubmit(true); // Gọi hàm nộp bài
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!isSaved) {
      const timer = setTimeout(() => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: studentAnswer }));
        setIsSaved(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSaved, studentAnswer, currentQuestionIndex]);

  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'Tự luận') {
      const savedAnswer = answers[currentQuestionIndex];
      setStudentAnswer(typeof savedAnswer === 'string' ? savedAnswer : '');
    }
    setShowHint(false);
    setHandwrittenImage(null);
    setHandwrittenImageFile(null);
    setUploadError('');
  }, [currentQuestionIndex, currentQuestion, answers]);

  useEffect(() => {
    return () => {
      if (handwrittenImage) {
        URL.revokeObjectURL(handwrittenImage);
      }
    };
  }, [handwrittenImage]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      newFlagged.has(currentQuestionIndex) ? newFlagged.delete(currentQuestionIndex) : newFlagged.add(currentQuestionIndex);
      return newFlagged;
    });
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleViewHint = () => {
    setShowHint(prev => !prev);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chỉ chọn tệp hình ảnh.');
      return;
    }

    setUploadError('');
    if (handwrittenImage) URL.revokeObjectURL(handwrittenImage);

    setHandwrittenImageFile(file);
    setHandwrittenImage(URL.createObjectURL(file));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setHandwrittenImage(null);
    setHandwrittenImageFile(null);
  };

  const handleRecognizeHandwriting = async () => {
    if (!handwrittenImageFile) return;
    setIsUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('handwrittenImage', handwrittenImageFile);
    try {
      const response = await fetch('/api/v1/ocr/recognize', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Server đã xảy ra lỗi.');
      }
      setStudentAnswer(prev => (prev ? prev + `\n\n${data.text}` : data.text).trim());
      setIsSaved(false);
      handleRemoveImage();
    } catch (error) {
      console.error("Lỗi khi nhận dạng chữ viết:", error);
      setUploadError(error.message || 'Không thể kết nối đến máy chủ nhận dạng.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (isSubmitting) return; // Ngăn chặn việc nộp bài nhiều lần

    const confirmSubmission = isAutoSubmit ? true : window.confirm('Bạn có chắc chắn muốn nộp bài không? Hành động này không thể hoàn tác.');

    if (confirmSubmission) {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/v1/exams/${exam._id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers }),
        });

        const result = await response.json();

        if (response.ok) {
          alert('Nộp bài thành công!');
          // Chuyển hướng đến trang kết quả hoặc trang dashboard
          router.push(`/submissions/${result.data.submissionId}`);
        } else {
          throw new Error(result.message || 'Có lỗi xảy ra khi nộp bài.');
        }
      } catch (error) {
        alert(`Lỗi: ${error.message}`);
        setIsSubmitting(false);
      }
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (!currentQuestion) {
    return <div className="flex items-center justify-center min-h-screen bg-[#f6f6f8]"><p className="text-slate-500">Đang tải câu hỏi...</p></div>;
  }

  const renderMainContent = () => {
    const questionMapSidebar = (
        <aside className="w-80 bg-white border-l border-slate-200 hidden lg:flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-800 flex items-center gap-2"><LayoutGrid size={20} className="text-[#2463eb]" />Bản đồ câu hỏi</h3></div>
          <div className="p-6 overflow-y-auto flex-grow">
            <div className="grid grid-cols-4 gap-3">
              {questions.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = answers[idx] !== undefined;
                  const isFlagged = flagged.has(idx);
                  let buttonClasses = 'bg-white border-2 border-slate-200 text-slate-400';
                  if (isAnswered) buttonClasses = 'bg-[#2463eb] text-white border-[#2463eb]';
                  if (isFlagged) buttonClasses = 'bg-amber-400 text-white border-amber-400';
                  if (isCurrent) buttonClasses = 'bg-blue-50 border-[3px] border-[#2463eb] text-[#2463eb]';
                  return <button key={q._id} onClick={() => goToQuestion(idx)} className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 relative ${buttonClasses}`}>{idx + 1}{isFlagged && <div className="absolute -top-1 -right-1 bg-white text-amber-500 rounded-full p-0.5 border border-amber-200"><Flag size={8} fill="currentColor"/></div>}</button>;
              })}
            </div>
          </div>
          <div className="p-6"><div className="space-y-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CHÚ THÍCH</p><div className="flex items-center gap-3 text-sm text-slate-600"><div className="w-3 h-3 rounded-full bg-[#2463eb]" /><span>Đã trả lời</span></div><div className="flex items-center gap-3 text-sm text-slate-600"><div className="w-3 h-3 rounded-full bg-amber-400" /><span>Chưa chắc chắn</span></div><div className="flex items-center gap-3 text-sm text-slate-600"><div className="w-3 h-3 rounded-full border border-slate-300" /><span>Chưa trả lời</span></div></div></div>
        </aside>
    );

    let questionBody;
    if (currentQuestion.type === 'Tự luận') {
      questionBody = (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="w-full lg:w-1/2 overflow-y-auto p-8 lg:p-12 bg-white border-r border-[#E5E5E5]">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#F6F6F8] text-[#8E9299] text-[10px] font-bold uppercase tracking-[0.2em]">
                        Câu hỏi {currentQuestionIndex + 1} - TỰ LUẬN
                    </div>
                    <button onClick={toggleFlag} className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl transition-all font-semibold text-sm ${flagged.has(currentQuestionIndex) ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border-amber-100 text-amber-600 hover:bg-amber-50'}`}>
                        <Flag size={16} fill={flagged.has(currentQuestionIndex) ? "currentColor" : "none"} /> Gắn cờ
                    </button>
                </div>
              <h1 className="text-3xl font-bold mb-8 tracking-tight">
                {currentQuestion.topic || 'Bài tập tự luận'}
              </h1>
              <div className="space-y-6 text-lg text-[#4A4A4A] leading-relaxed mb-10 prose prose-blue max-w-none">
                  <p>{currentQuestion.content}</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col bg-[#F6F6F8] p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold text-[#8E9299] uppercase tracking-[0.2em]">Lời giải của bạn</h2>
                {isSaved ? (
                  <div className="flex items-center text-xs text-[#10B981] font-bold uppercase tracking-[0.2em]"><CheckCircle2 size={14} className="mr-1.5" />Đã lưu tự động</div>
                ) : (
                  <div className="text-xs text-[#8E9299] font-bold uppercase tracking-[0.2em]">Đang lưu...</div>
                )}
              </div>

              {handwrittenImage && (
                <div className="mb-4 relative rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
                  <img src={handwrittenImage} alt="Xem trước bài làm tay" className="w-full h-auto object-contain" />
                  <button 
                    onClick={handleRemoveImage} 
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                    aria-label="Xóa ảnh xem trước"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
                <div className="flex-1 w-full bg-transparent text-[#141414] exam-editor-container">
                    <TiptapEditor 
                        key={currentQuestionIndex}
                        content={studentAnswer}
                        onChange={(newContent) => {
                            setStudentAnswer(newContent);
                            setIsSaved(false);
                        }}
                        editable={true}
                    />
                </div>

                <div className="p-4 bg-[#F6F6F8]/50 border-t border-[#E5E5E5]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageFileChange} 
                    style={{ display: 'none' }} 
                    disabled={isUploading}
                  />
                  <button 
                    onClick={handleUploadButtonClick} 
                    disabled={isUploading}
                    className="w-full py-4 border-2 border-dashed border-[#CDD5E1] rounded-xl flex flex-col items-center justify-center hover:border-[#2463EB] hover:bg-[#2463EB]/5 transition-all group disabled:opacity-50 disabled:cursor-wait"
                  >
                     {isUploading ? (
                        <>
                            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mb-2" />
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">ĐANG XỬ LÝ...</span>
                        </>
                    ) : (
                        <>
                            <UploadCloud size={24} className="text-[#8E9299] group-hover:text-[#2463EB] mb-2 transition-colors" />
                            <span className="text-sm font-bold text-[#8E9299] group-hover:text-[#2463EB] transition-colors uppercase tracking-wider">
                                {handwrittenImageFile ? 'Chọn ảnh khác' : 'Tải ảnh bài làm tay'}
                            </span>
                        </>
                    )}
                  </button>
                  {uploadError && <p className="text-xs text-red-600 mt-2 text-center font-medium">{uploadError}</p>}
                </div>
              </div>
              
              {showHint && currentQuestion.notes && (
                <div className="mt-8 p-5 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={16} className="text-red-600"/>
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">Gợi ý</h3>
                  </div>
                  <p className="text-red-700/90 whitespace-pre-wrap text-base">{currentQuestion.notes}</p>
                </div>
              )}
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={handleRecognizeHandwriting} 
                  disabled={!handwrittenImageFile || isUploading}
                  className="w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center shadow-lg disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 bg-teal-500 text-white hover:bg-teal-600 shadow-teal-500/25 active:scale-[0.98]"
                >
                  {isUploading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />Đang nhận dạng...</>
                  ) : (
                    <><ScanLine size={18} className="mr-2.5" />Nhận dạng chữ viết</>
                  )}
                </button>

                <button 
                  onClick={handleViewHint} 
                  disabled={!currentQuestion.notes || isUploading}
                  className="w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center shadow-lg disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/25 active:scale-[0.98]"
                >
                    <><Lightbulb size={18} className="mr-2.5" />{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</>
                </button>
              </div>
            </div>
          </div>
        </main>
      );
    } else {
        questionBody = (
            <main className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto py-10 px-6 lg:px-10">
            <div className="space-y-8">
                <div key={currentQuestion._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 lg:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2463eb]" />
                    <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><span className="px-3 py-1 bg-blue-50 text-[#2463eb] text-xs font-bold rounded-lg uppercase">Câu hỏi {currentQuestionIndex + 1}</span>{currentQuestion.topic && <span className="text-slate-400 text-sm italic">• {currentQuestion.topic}</span>}</div>
                        <button onClick={toggleFlag} className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl transition-all font-semibold text-sm ${flagged.has(currentQuestionIndex) ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border-amber-100 text-amber-600 hover:bg-amber-50'}`}>
                        <Flag size={16} fill={flagged.has(currentQuestionIndex) ? "currentColor" : "none"} /> Gắn cờ
                        </button>
                    </div>
                    <h2 className="text-2xl font-medium text-slate-800 leading-relaxed">{currentQuestion.content}</h2>
                    {currentQuestion.formula && <div className="flex justify-center py-12 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-4xl math-font italic text-slate-900">{currentQuestion.formula}</span></div>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestionIndex] === idx;
                    const label = String.fromCharCode(65 + idx);
                    return (
                    <button key={idx} onClick={() => handleSelectOption(idx)} className={`group relative flex items-center gap-6 p-6 bg-white rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-[#2463eb] shadow-md' : 'border-transparent hover:border-slate-200'}`}>
                        <div className={`w-12 h-12 flex items-center justify-center font-bold rounded-lg text-xl flex-shrink-0 transition-colors ${isSelected ? 'bg-[#2463eb] text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#2463eb] group-hover:text-white'}`}>{label}</div>
                        <div><span className="text-xl font-medium text-slate-900">{option}</span></div>
                        {isSelected && <div className="absolute top-4 right-4 text-[#2463eb]"><CheckCircle2 size={24} /></div>}
                    </button>
                    );
                })}
                </div>
            </div>
            </main>
        );
    }

    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {questionBody}
        </div>
        {questionMapSidebar}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
         <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><Menu size={20} /></Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{exam.name}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{subjectDisplay}</p>
            </div>
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-8 flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500"><span>Tiến độ: {answeredCount}/{questions.length}</span><span>{Math.round(progress)}%</span></div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden"><div style={{ width: `${progress}%` }} className="bg-[#2463eb] h-full transition-all duration-500"/></div>
          </div>
          <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            <Timer size={20} className="text-red-500 animate-pulse" /><span className="text-red-600 font-bold tabular-nums text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </nav>

      {renderMainContent()}

      <footer className="bg-white border-t border-slate-200 p-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button disabled={currentQuestionIndex === 0} onClick={() => goToQuestion(currentQuestionIndex - 1)} className="flex items-center gap-2 px-5 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-30"><ChevronLeft size={20} />Câu trước</button>
            <div className="h-6 w-px bg-slate-200" />
            <button disabled={currentQuestionIndex === questions.length - 1} onClick={() => goToQuestion(currentQuestionIndex + 1)} className="flex items-center gap-2 px-5 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-30">Câu tiếp theo<ChevronRight size={20} /></button>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="bg-[#2463eb] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-wait">
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />Đang nộp...</>
              ) : (
                <><Send size={18} />Nộp bài</>
              )}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
