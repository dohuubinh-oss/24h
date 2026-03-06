'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Menu,
  Timer,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Calculator,
  HelpCircle,
  CheckCircle2,
  LayoutGrid,
  Camera,
  Sparkles,
  Info,
  AlertCircle,
  Bold,
  Italic,
  Sigma,
} from 'lucide-react';

// Temporary placeholder for Gemini API logic
const genAI = {
  models: {
    generateContent: async ({ prompt }) => {
      console.log("--- AI Prompt ---", prompt);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { text: "Đây là lời giải mẫu từ AI. Logic thật sẽ được kết nối sau." };
    }
  }
};

/**
 * Giao diện chính cho phiên làm bài thi.
 * Hỗ trợ cả câu hỏi trắc nghiệm và tự luận, luôn hiển thị bản đồ câu hỏi.
 */
export default function ExamSessionClient({ exam }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState((exam.duration || 15) * 60);

  // State for Essay Questions
  const [solution, setSolution] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef(null);

  const questions = exam.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const subjectDisplay = `${exam.examType || 'Bài kiểm tra'} - ${exam.grade || 'Không xác định'}`.toUpperCase();

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-save Effect for Essay
  useEffect(() => {
    if (!isSaved) {
      const timer = setTimeout(() => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: solution }));
        setIsSaved(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSaved, solution, currentQuestionIndex]);

  // Load essay answer when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'Tự luận') {
      const savedSolution = answers[currentQuestionIndex];
      setSolution(typeof savedSolution === 'string' ? savedSolution : '');
    }
    setShowSolution(false);
    setAiResponse('');
  }, [currentQuestionIndex, currentQuestion, answers]);


  // --- Helper Functions ---
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

  const mathSymbols = [
    { label: '√', value: '√' }, { label: 'π', value: 'π' }, { label: 'Δ', value: 'Δ' }, 
    { label: '⊥', value: '⊥' }, { label: '∠', value: '∠' }, { label: 'x²', value: '²' }, { label: '÷', value: '÷' },
  ];

  const insertSymbol = (symbol) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = solution.substring(0, start) + symbol + solution.substring(end);
    setSolution(newText);
    setIsSaved(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + symbol.length, start + symbol.length);
      }
    }, 0);
  };

  const handleSolutionChange = (e) => {
    setSolution(e.target.value);
    setIsSaved(false);
  };

  const handleViewSolution = async () => {
    if (!solution.trim()) return;
    setIsGenerating(true);
    setShowSolution(true);
    try {
      const prompt = `Bạn là một giáo viên toán học Việt Nam giỏi. Hãy giải bài toán sau đây một cách chi tiết và dễ hiểu. Đề bài: "${currentQuestion.content}". Học sinh đã làm: "${solution}". Hãy đưa ra lời giải chuẩn xác, nhận xét bài làm của học sinh (nếu có) và trình bày bằng Markdown đẹp mắt.`
      const response = await genAI.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
      setAiResponse(response.text || "Không thể tạo lời giải vào lúc này.");
    } catch (error) {
      console.error("Error generating solution:", error);
      setAiResponse("Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.");
    } finally {
      setIsGenerating(false);
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
          {/* Left Pane: Problem */}
          <div className="w-full lg:w-1/2 overflow-y-auto p-8 lg:p-12 bg-white border-r border-[#E5E5E5]">
            <div className="max-w-2xl mx-auto">
              <div className="inline-block px-3 py-1 rounded-full bg-[#F6F6F8] text-[#8E9299] text-[10px] font-bold mb-6 uppercase tracking-[0.2em]">
                Câu hỏi {currentQuestionIndex + 1} - TỰ LUẬN
              </div>
              <h1 className="text-3xl font-bold mb-8 tracking-tight">
                {currentQuestion.topic || 'Bài tập tự luận'}
              </h1>
              <div className="space-y-6 text-lg text-[#4A4A4A] leading-relaxed mb-10 prose prose-blue max-w-none">
                  <p>{currentQuestion.content}</p>
              </div>
            </div>
          </div>

          {/* Right Pane: Editor */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[#F6F6F8] p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold text-[#8E9299] uppercase tracking-[0.2em]">Lời giải của bạn</h2>
                {isSaved ? (
                  <div className="flex items-center text-[10px] text-[#10B981] font-bold uppercase tracking-wider"><CheckCircle2 size={14} className="mr-1.5" /> Đã lưu tự động</div>
                ) : (
                  <div className="text-[10px] text-[#8E9299] font-bold uppercase tracking-wider">Đang lưu...</div>
                )}
              </div>
              <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
                <div className="border-b border-[#E5E5E5] p-3 flex flex-wrap gap-1.5 bg-white/50 backdrop-blur-sm">
                  {mathSymbols.map((sym) => (
                    <button key={sym.label} onClick={() => insertSymbol(sym.value)} className="w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold text-[#2463EB] hover:bg-[#2463EB]/5 active:bg-[#2463EB]/10 transition-colors border border-transparent hover:border-[#2463EB]/10">{sym.label}</button>
                  ))}
                </div>
                <textarea ref={textareaRef} value={solution} onChange={handleSolutionChange}
                  className="flex-1 p-8 w-full resize-none border-none focus:ring-0 bg-transparent text-[#141414] placeholder-[#8E9299] font-sans leading-relaxed text-lg"
                  placeholder="Nhập lời giải chi tiết tại đây..."/>
                <div className="p-6 bg-[#F6F6F8]/50 border-t border-[#E5E5E5]">
                  <button className="w-full py-6 border-2 border-dashed border-[#E5E5E5] rounded-xl flex flex-col items-center justify-center hover:border-[#2463EB] hover:bg-[#2463EB]/5 transition-all group">
                    <Camera size={24} className="text-[#8E9299] group-hover:text-[#2463EB] mb-2 transition-colors" />
                    <span className="text-sm font-bold text-[#8E9299] group-hover:text-[#2463EB] transition-colors uppercase tracking-wider">Tải ảnh bài làm tay</span>
                  </button>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <button onClick={handleViewSolution} disabled={!solution.trim() || isGenerating} className={`w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center shadow-lg ${!solution.trim() || isGenerating ? 'bg-[#E5E5E5] text-[#8E9299] cursor-not-allowed' : 'bg-[#2463EB] text-white hover:bg-[#1D4ED8] shadow-blue-500/25 active:scale-[0.98]'}`}>
                  {isGenerating ? <div className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />Đang phân tích...</div> : <>XEM LỜI GIẢI CHI TIẾT<Sparkles size={18} className="ml-2.5" /></>}
                </button>
              </div>
            </div>
            {showSolution && (
              <div className="fixed inset-0 z-[100] bg-[#141414]/60 backdrop-blur-md flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-[#E5E5E5] flex items-center justify-between bg-white sticky top-0">
                    <div><h3 className="text-xl font-bold tracking-tight">Lời giải chi tiết từ AI</h3><p className="text-xs text-[#8E9299] font-medium uppercase tracking-wider mt-0.5">Dựa trên bài làm của bạn</p></div>
                    <button onClick={() => setShowSolution(false)} className="w-10 h-10 rounded-full hover:bg-[#F6F6F8] flex items-center justify-center transition-colors"><ChevronRight size={24} className="rotate-90" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 lg:p-10 prose prose-blue max-w-none">
                    {isGenerating ? <div className="space-y-4"><div className="h-4 bg-[#F6F6F8] rounded-full w-3/4 animate-pulse" /><div className="h-4 bg-[#F6F6F8] rounded-full w-full animate-pulse" /><div className="h-4 bg-[#F6F6F8] rounded-full w-5/6 animate-pulse" /></div> : <div className="whitespace-pre-wrap">{aiResponse}</div>}
                  </div>
                  <div className="p-8 bg-[#F6F6F8] border-t border-[#E5E5E5] flex justify-end">
                    <button onClick={() => setShowSolution(false)} className="px-8 py-3 bg-[#141414] text-white font-bold rounded-xl hover:bg-black transition-colors uppercase text-xs tracking-widest">Đóng</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      );
    } else {
      questionBody = (
        <main className="w-full max-w-3xl mx-auto overflow-y-auto py-10 px-6 lg:px-10">
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
      <div className="flex flex-grow overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {questionBody}
        </div>
        {questionMapSidebar}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      {/* Navigation Header (Consistent) */}
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

      {/* Conditionally Rendered Main Content with Sidebar */}
      {renderMainContent()}

      {/* Footer Navigation (Consistent) */}
      <footer className="bg-white border-t border-slate-200 p-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button disabled={currentQuestionIndex === 0} onClick={() => goToQuestion(currentQuestionIndex - 1)} className="flex items-center gap-2 px-5 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-30"><ChevronLeft size={20} />Câu trước</button>
            <div className="h-6 w-px bg-slate-200" />
            <button disabled={currentQuestionIndex === questions.length - 1} onClick={() => goToQuestion(currentQuestionIndex + 1)} className="flex items-center gap-2 px-5 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-30">Câu tiếp theo<ChevronRight size={20} /></button>
          </div>
          <div className="flex items-center gap-8">
            <button className="bg-[#2463eb] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 active:scale-95"><Send size={18} />Nộp bài</button>
          </div>
        </div>
      </footer>

      {/* Floating Buttons (Consistent) */}
      <div className="fixed bottom-28 left-6 flex flex-col gap-3 z-40">
        <button className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#2463eb] transition-colors"><Calculator size={20} /></button>
        <button className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#2463eb] transition-colors"><HelpCircle size={20} /></button>
      </div>
    </div>
  );
}
