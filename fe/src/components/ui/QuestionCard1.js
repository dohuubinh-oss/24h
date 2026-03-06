'use client';

import React from 'react';
import KatexRenderer from '../KatexRenderer';

/**
 * Component để hiển thị một câu hỏi duy nhất trong bài thi.
 * @param {object} props
 * @param {object} props.question - Đối tượng câu hỏi từ API.
 * @param {number} props.questionNumber - Số thứ tự của câu hỏi.
 * @param {number | undefined} props.selectedOption - Index của lựa chọn đã được người dùng chọn.
 * @param {(optionIndex: number) => void} props.onOptionChange - Hàm callback được gọi khi người dùng chọn một đáp án.
 */
const QuestionCard1 = ({ question, questionNumber, selectedOption, onOptionChange }) => {
  return (
    <div className="mb-8 p-6 border rounded-lg shadow-md bg-white transition-shadow hover:shadow-lg">
      {/* Phần tiêu đề câu hỏi */}
      <div className="mb-4">
        <p className="font-bold text-lg text-gray-800">Câu {questionNumber}:</p>
        {/* Render nội dung câu hỏi, dùng KatexRenderer để xử lý công thức toán */}
        <div className="prose max-w-none mt-2 text-gray-700">
             {/* SỬA LỖI: Đổi prop từ `content` thành `text` để khớp với KatexRenderer */}
             <KatexRenderer text={question.content} />
        </div>
      </div>

      {/* Phần các lựa chọn đáp án (chỉ cho câu trắc nghiệm) */}
      {question.type === 'Trắc nghiệm' && (
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const optionClasses = `flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${ 
              isSelected
                ? 'bg-blue-100 border-blue-400 shadow-inner' 
                : 'bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
            }`;

            return (
              <div
                key={index}
                className={optionClasses}
                onClick={() => onOptionChange(index)}
              >
                <span className="font-semibold mr-3 text-blue-600">{String.fromCharCode(65 + index)}.</span>
                {/* Dùng KatexRenderer để hiển thị nội dung đáp án */}
                <div className="prose-sm max-w-none">
                    {/* SỬA LỖI: Đổi prop từ `content` thành `text` để khớp với KatexRenderer */}
                    <KatexRenderer text={option} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phần cho câu hỏi tự luận (nếu có) */}
      {question.type === 'Tự luận' && (
         <textarea
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            rows="5"
            placeholder="Nhập câu trả lời của bạn ở đây..."
         ></textarea>
      )}
    </div>
  );
};

export default QuestionCard1;
