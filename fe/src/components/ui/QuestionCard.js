'use client';

import React, { useState } from 'react';
import {
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  RotateCw // This can be removed if RotateCw is no longer used
} from 'lucide-react';
import KatexRenderer from '../KatexRenderer';

const QuestionCard = ({ 
  question, 
  variant = 'bank', 
  index,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
  // onChangeQuestion is no longer needed
}) => {
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);

  if (!question) return null;

  const difficultyMap = {
    'Nhận biết': 'bg-green-500/10 text-green-600',
    'Thông hiểu': 'bg-blue-500/10 text-blue-600',
    'Vận dụng': 'bg-amber-500/10 text-amber-600',
    'Vận dụng cao': 'bg-red-500/10 text-red-600',
  };
  
  const primaryColor = '#2463eb';

  return (
    <div className={`bg-slate-50 rounded-xl border transition-all group overflow-hidden ${ 
      isSelected && variant === 'bank' ? `border-[${primaryColor}] shadow-md` : 'border-slate-200/60 shadow-sm hover:shadow-md hover:border-[#2463eb]/30'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            {variant === 'exam' ? (
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2463eb] text-white font-bold text-sm shrink-0">
                {index + 1}
              </span>
            ) : (
              <input 
                checked={isSelected}
                onChange={(e) => onToggleSelection && onToggleSelection(question._id)}
                className={`rounded border-slate-300 text-[${primaryColor}] focus:ring-[${primaryColor}] h-4 w-4 cursor-pointer`}
                type="checkbox" 
              />
            )}
            <span className={`px-2 py-0.5 bg-[${primaryColor}]/10 text-[${primaryColor}] text-[10px] font-bold rounded uppercase`}>
              {question.topic}
            </span>
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 text-[10px] font-bold rounded uppercase">
              {question.grade}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${difficultyMap[question.difficulty] || 'bg-gray-500/10 text-gray-600'}`}>
              {question.difficulty}
            </span>
            {variant === 'bank' && <span className="text-[10px] text-slate-400 font-medium">ID: {question._id}</span>}
          </div>
          {/* === REFACTOR: Removed the 'Đổi' button and updated 'Sửa' button text === */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit && onEdit(question)} className={`flex items-center gap-2 p-1.5 text-slate-400 hover:text-[${primaryColor}] hover:bg-[${primaryColor}]/10 rounded transition-all text-sm`} title="Chỉnh sửa">
              <Edit3 size={16} />
              Sửa câu hỏi
            </button>
            <button onClick={() => onDelete && onDelete(question._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all" title="Xóa">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="text-lg leading-relaxed text-slate-800 mb-6 pl-7">
          <KatexRenderer text={question.content} />
        </div>

        {question.type === 'Trắc nghiệm' && question.options && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
            {question.options.map((opt, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${ 
                  question.correctOptionIndex === index
                    ? `bg-[${primaryColor}]/5 border-[${primaryColor}]/20` 
                    : 'bg-white border-slate-100 hover:border-[#2463eb]/20'
                }`}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${ 
                  question.correctOptionIndex === index ? `bg-[${primaryColor}] text-white` : 'bg-slate-100 text-slate-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={`text-sm ${question.correctOptionIndex === index ? `font-semibold text-[${primaryColor}]` : 'text-slate-700'}`}>
                  <KatexRenderer text={opt} />
                </span>
                {question.correctOptionIndex === index && <CheckCircle2 className={`text-[${primaryColor}] ml-auto`} size={16} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {isSolutionVisible && (
        <div className="px-5 py-4 border-t border-b border-slate-200 bg-white">
            <h4 className="text-xs font-semibold uppercase text-slate-500 mb-3">Lời giải chi tiết</h4>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                 {question.solution ? (
                    <KatexRenderer text={question.solution} />
                 ) : (
                    <p className="italic text-slate-400">Chưa có lời giải cho câu hỏi này.</p>
                 )}
            </div>
        </div>
      )}
      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-4"></div>
        <button 
            onClick={() => setIsSolutionVisible(!isSolutionVisible)} 
            className={`text-xs font-bold text-[${primaryColor}] hover:underline flex items-center gap-1`}
        >
          {isSolutionVisible ? 'Ẩn lời giải' : (question.type === 'Trắc nghiệm' ? 'Xem chi tiết giải bài' : 'Xem đáp án mẫu')}
          {isSolutionVisible ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
