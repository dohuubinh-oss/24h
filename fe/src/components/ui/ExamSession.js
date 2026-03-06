'use client';

import React, { useState } from 'react';
import axios from 'axios';
import QuestionCard1 from './QuestionCard1';

const ExamSession = ({ exam }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasQuestions = Array.isArray(exam.questions) && exam.questions.length > 0;
  const totalQuestions = hasQuestions ? exam.questions.length : 0;

  // Cập nhật hàm xử lý câu trả lời để nhận cả text từ textarea
  const handleAnswerChange = (answer) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!hasQuestions) return;

    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn nộp bài không?\n\nBạn đã trả lời ${Object.keys(answers).length} trên ${totalQuestions} câu.`);
    
    if (isConfirmed) {
      setIsSubmitting(true);
      try {
        const examId = exam._id;
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        
        const response = await axios.post(
          `${API_BASE_URL}/exams/${examId}/submit`,
          { answers },
          { withCredentials: true }
        );

        const { data } = response.data;
        
        // Xây dựng thông báo dựa trên trạng thái chấm bài
        let resultMessage = `Nộp bài thành công!\n\n`;
        if (data.gradingStatus === 'pending_review') {
          resultMessage += `Điểm phần trắc nghiệm: ${data.score.toFixed(2)}\n`;
          resultMessage += `Số câu trắc nghiệm đúng: ${data.totalCorrect}\n\n`;
          resultMessage += `Phần tự luận của bạn sẽ được chấm và cập nhật điểm sau.`;
        } else { // auto_graded
          resultMessage += `Kết quả của bạn:\n`;
          resultMessage += `- Số câu đúng: ${data.totalCorrect} / ${data.totalQuestions}\n`;
          resultMessage += `- Điểm số: ${data.score.toFixed(2)}`;
        }

        alert(resultMessage);

        // Tương lai: Chuyển hướng đến trang kết quả chi tiết
        // Ví dụ: router.push(`/results/${data.submissionId}`);

      } catch (error) {
        console.error('Lỗi khi nộp bài:', error);
        const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi không xác định.';
        alert(`Lỗi: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentQuestion = hasQuestions ? exam.questions[currentQuestionIndex] : null;

  // Lấy giá trị cho textarea từ state
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">{exam.name}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600">
          <p><span className="font-semibold">Thời gian:</span> {exam.duration} phút</p>
          <p><span className="font-semibold">Số câu hỏi:</span> {totalQuestions}</p>
          <p><span className="font-semibold">Đang ở câu:</span> {currentQuestionIndex + 1} / {totalQuestions}</p>
        </div>
      </div>

      <div className="space-y-6">
        {currentQuestion ? (
          <QuestionCard1 
            key={currentQuestion._id || currentQuestionIndex} 
            questionNumber={currentQuestionIndex + 1}
            question={currentQuestion}
            // Truyền giá trị và hàm cập nhật cho cả trắc nghiệm và tự luận
            selectedOption={currentAnswer} 
            onOptionChange={handleAnswerChange}
            textAreaValue={currentAnswer || ''} // Giá trị cho textarea
            onTextAreaChange={(e) => handleAnswerChange(e.target.value)} // Hàm cập nhật cho textarea
          />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <h2 className="text-xl font-semibold text-gray-700">Bài thi chưa có câu hỏi</h2>
            <p className="mt-2 text-gray-500">Nội dung của đề thi này đang được cập nhật.</p>
          </div>
        )}
      </div>

      {hasQuestions && (
        <div className="mt-10 flex justify-between items-center">
           <button 
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Câu trước
          </button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button 
              onClick={handleNextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
            >
              Câu kế tiếp
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamSession;
