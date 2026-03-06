'use client';

import React, { useState, useEffect } from 'react';
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
  LayoutGrid
} from 'lucide-react';

/**
 * Giao diện chính cho phiên làm bài thi.
 * Component này là một Client Component trong Next.js, quản lý toàn bộ trạng thái và tương tác của người dùng.
 * @param {object} props
 * @param {object} props.exam - Đối tượng bài thi đầy đủ từ API, bao gồm thông tin và danh sách câu hỏi.
 */
export default function ExamSessionClient({ exam }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState((exam.duration || 15) * 60);

  // Dữ liệu từ API đã được populate và nằm trong exam.questions
  const questions = exam.questions || [];

  // Tạo tiêu đề môn học từ dữ liệu BE
  const subjectDisplay = `${exam.examType || 'Bài kiểm tra'} - ${exam.grade || 'Không xác định'}`.toUpperCase();

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(currentQuestionIndex)) {
        newFlagged.delete(currentQuestionIndex);
      } else {
        newFlagged.add(currentQuestionIndex);
      }
      return newFlagged;
    });
  };
  
  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f6f8]">
        <p className="text-slate-500">Không có câu hỏi nào trong bài thi này hoặc đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
         <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                <Menu size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{exam.name}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{subjectDisplay}</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8 flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Tiến độ hoàn thành: {answeredCount}/{questions.length} câu</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                style={{ width: `${progress}%` }}
                className="bg-[#2463eb] h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            <Timer size={20} className="text-red-500 animate-pulse" />
            <span className="text-red-600 font-bold tabular-nums text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-grow justify-center overflow-hidden gap-8 px-6 lg:px-10">
        {/* Main Content Area */}
        <main className="w-full max-w-3xl overflow-y-auto py-10">
          <div className="space-y-8">
            {/* Question Card */}
            <div 
              key={currentQuestion._id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 lg:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2463eb]" />
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-50 text-[#2463eb] text-xs font-bold rounded-lg uppercase">
                      Câu hỏi {currentQuestionIndex + 1}
                    </span>
                    {currentQuestion.topic && <span className="text-slate-400 text-sm italic">• {currentQuestion.topic}</span>}
                  </div>
                  <button 
                    onClick={toggleFlag}
                    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl transition-all font-semibold text-sm ${
                      flagged.has(currentQuestionIndex)
                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                        : 'border-amber-100 text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <Flag size={16} fill={flagged.has(currentQuestionIndex) ? "currentColor" : "none"} />
                    Gắn cờ xem lại
                  </button>
                </div>

                <h2 className="text-2xl font-medium text-slate-800 leading-relaxed">
                  {currentQuestion.content}
                </h2>

                {currentQuestion.formula && (
                  <div className="flex justify-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-4xl math-font italic text-slate-900">
                        {currentQuestion.formula}
                      </span>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestionIndex] === idx;
                const label = String.fromCharCode(65 + idx);
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`group relative flex items-center gap-6 p-6 bg-white rounded-2xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-[#2463eb] shadow-md shadow-blue-600/5' 
                        : 'border-transparent hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center font-bold rounded-lg text-xl flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-[#2463eb] text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-[#2463eb] group-hover:text-white'
                    }`}>
                      {label}
                    </div>
                    <div>
                      <span className="text-xl math-font font-medium text-slate-900">{option}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-[#2463eb]">
                        <CheckCircle2 size={24} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* Full-height Sidebar */}
        <aside className="w-80 bg-white border-l border-slate-200 hidden lg:flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid size={20} className="text-[#2463eb]" />
              Bản đồ câu hỏi
            </h3>
          </div>
          
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

                return (
                  <button
                    key={q._id}
                    onClick={() => goToQuestion(idx)}
                    className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 relative ${buttonClasses}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <div className="absolute -top-1 -right-1 bg-white text-amber-500 rounded-full p-0.5 border border-amber-200">
                        <Flag size={8} fill="currentColor" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CHÚ THÍCH</p>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full bg-[#2463eb]" />
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Chưa chắc chắn</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full border border-slate-300" />
                <span>Chưa trả lời</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Mã bài thi:</p>
              <p className="font-mono text-sm font-bold text-slate-700">{exam.examCode || 'N/A'}</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-slate-200 p-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              disabled={currentQuestionIndex === 0}
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              className="flex items-center gap-2 px-5 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-30"
            >
              <ChevronLeft size={20} />
              Câu trước
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <button 
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() => goToQuestion(currentQuestionIndex + 1)}
              className="flex items-center gap-2 px-5 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-30"
            >
              Câu tiếp theo
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-8">
            <p className="hidden sm:block text-slate-500 text-sm font-medium">
              Bạn đã trả lời {answeredCount}/{questions.length} câu hỏi
            </p>
            <button className="bg-[#2463eb] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 active:scale-95">
              Nộp bài
              <Send size={18} />
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="fixed bottom-28 left-6 flex flex-col gap-3 z-40">
        <button className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#2463eb] transition-colors">
          <Calculator size={20} />
        </button>
        <button className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#2463eb] transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );
}
