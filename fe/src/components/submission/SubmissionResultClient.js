'use client';

import React, { useState } from 'react';
import { Check, X, Send, Loader, User, Clock, FileText } from 'lucide-react';
import { TiptapEditor } from '../editor/TiptapEditor';

/**
 * Component để hiển thị kết quả chi tiết của một bài làm.
 * @param {object} submission - Đối tượng bài làm đầy đủ từ API.
 */
export default function SubmissionResultClient({ submission }) {
  const [isGrading, setIsGrading] = useState(false);
  const [gradingError, setGradingError] = useState(null);
  // Giả sử chúng ta sẽ cập nhật submission state khi có kết quả mới
  const [currentSubmission, setCurrentSubmission] = useState(submission);

  const { exam, user, answers, score, totalCorrect, totalQuestions, gradingStatus } = currentSubmission;
  const questions = exam.questions || [];

  // Hàm xử lý việc yêu cầu AI chấm bài tự luận
  const handleGradeEssays = async () => {
    setIsGrading(true);
    setGradingError(null);
    try {
      // Gọi đến API route chúng ta đã tạo ở backend
      const res = await fetch(`/api/v1/submissions/${currentSubmission._id}/grade-essays`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi chấm bài.');
      }
      
      // Cập nhật lại state với dữ liệu mới từ server
      setCurrentSubmission(data.data);

    } catch (error) {
      console.error("Lỗi chấm bài tự luận:", error);
      setGradingError(error.message);
    } finally {
      setIsGrading(false);
    }
  };

  const getOptionLabel = (index) => String.fromCharCode(65 + index);

  // Hàm render chi tiết cho từng loại câu hỏi
  const renderQuestionResult = (question, index) => {
    const userAnswer = answers[index];
    const questionId = question._id;

    if (question.type === 'Trắc nghiệm') {
      const isCorrect = userAnswer === question.correctOptionIndex;
      return (
        <div key={questionId} className="p-6 bg-white rounded-lg border border-slate-200">
          <p className="font-semibold mb-4 text-slate-800">Câu {index + 1}: {question.content}</p>
          <div className="space-y-2">
            {question.options.map((option, optIndex) => {
              const isUserChoice = userAnswer === optIndex;
              const isCorrectChoice = question.correctOptionIndex === optIndex;
              let stateClass = 'border-slate-200 bg-slate-50';

              if (isCorrectChoice) {
                stateClass = 'border-green-300 bg-green-50 text-green-800 font-semibold';
              }
              if (isUserChoice && !isCorrect) {
                stateClass = 'border-red-300 bg-red-50 text-red-800 font-semibold';
              }

              return (
                <div key={optIndex} className={`flex items-center p-3 rounded-md border ${stateClass}`}>
                  {isUserChoice || isCorrectChoice ? (
                    isCorrectChoice ? <Check size={16} className="mr-2 text-green-600"/> : <X size={16} className="mr-2 text-red-600"/>
                  ) : <div className="w-4 mr-2"/>}
                  <span className="font-bold mr-2">{getOptionLabel(optIndex)}.</span>
                  <span>{option}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (question.type === 'Tự luận') {
      const essayAnswer = userAnswer || '';
      const gradingResult = currentSubmission.essayGradingResults?.find(r => r.question.toString() === questionId);

      return (
        <div key={questionId} className="p-6 bg-white rounded-lg border border-slate-200">
          <p className="font-semibold mb-4 text-slate-800">Câu {index + 1}: {question.content}</p>
          <h4 className="text-sm font-bold text-slate-500 mb-2">Bài làm của bạn</h4>
          <div className="prose prose-sm max-w-none p-4 border rounded-md bg-slate-50 min-h-[150px]">
             <TiptapEditor content={essayAnswer} editable={false} />
          </div>
          {gradingResult && (
             <div className="mt-4 p-4 rounded-md bg-sky-50 border border-sky-200">
                <h5 className="font-bold text-sky-800">Nhận xét từ AI</h5>
                <p className="text-sky-700 mt-1 mb-2 whitespace-pre-wrap">{gradingResult.feedback}</p>
                <p className="font-bold text-sky-800">Điểm: <span className="text-lg">{gradingResult.score} / {gradingResult.maxScore}</span></p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-4">
        
        {/* Header */}
        <header className="mb-8">
          <p className="text-blue-600 font-semibold">KẾT QUẢ BÀI LÀM</p>
          <h1 className="text-4xl font-bold text-slate-800 mt-2">{exam.name}</h1>
          <div className="flex items-center space-x-6 mt-4 text-slate-600 text-sm">
              <div className="flex items-center"><User size={14} className="mr-1.5" /> {user.name}</div>
              <div className="flex items-center"><FileText size={14} className="mr-1.5" /> {totalQuestions} câu hỏi</div>
              <div className="flex items-center"><Clock size={14} className="mr-1.5" /> Nộp lúc: {new Date(currentSubmission.submittedAt).toLocaleString('vi-VN')}</div>
          </div>
        </header>

        {/* Summary & Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between">
            <div>
                <h3 className="font-bold text-slate-800">Tổng điểm</h3>
                <p className="text-5xl font-bold text-blue-600 mt-1">{score}<span className="text-2xl text-slate-400">/{exam.totalPoints || 'N/A'}</span></p>
                <p className="text-sm text-slate-500 mt-1">Đúng {totalCorrect}/{totalQuestions} câu trắc nghiệm</p>
            </div>
            <div className="text-right">
                <p className={`font-bold py-1 px-3 rounded-full text-sm ${gradingStatus === 'auto_graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {gradingStatus === 'pending_review' ? 'Chờ chấm tự luận' : 'Đã chấm xong'}
                </p>
                {gradingStatus === 'pending_review' && (
                    <button 
                        onClick={handleGradeEssays}
                        disabled={isGrading}
                        className="mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-all">
                        {isGrading ? <Loader size={16} className="animate-spin mr-2"/> : <Send size={16} className="mr-2"/>}
                        {isGrading ? 'Đang chấm...' : 'Chấm tự luận bằng AI'}
                    </button>
                )}
                {gradingError && <p className="text-red-500 text-xs mt-2">Lỗi: {gradingError}</p>}
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Xem lại chi tiết</h2>
          {questions.map(renderQuestionResult)}
        </div>

      </div>
    </div>
  );
}
