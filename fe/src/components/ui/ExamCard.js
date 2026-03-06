import React from 'react';
import Link from 'next/link';
import { Edit, Trash2, ListOrdered, Timer } from 'lucide-react';

const ActionButton = ({ icon, title, text, danger = false, onClick, href }) => {
  const className = `transition-all flex items-center gap-1.5 rounded-lg ${ 
    text ? "px-3 py-2 text-sm font-medium" : "p-2"
  } ${ 
    danger
      ? "text-slate-500 hover:text-red-500 hover:bg-red-50"
      : "text-slate-500 hover:text-[#2463eb] hover:bg-[#2463eb]/10"
  }`;

  if (href) {
    return (
      <Link href={href} className={className} title={title || text}>
        {icon}
        {text && <span>{text}</span>}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} title={title || text}>
      {icon}
      {text && <span>{text}</span>}
    </button>
  );
};

const ExamCard = ({ exam, onDelete }) => {
  const difficultyColors = {
    'Nhận biết': 'bg-green-500/10 text-green-600',
    'Thông hiểu': 'bg-blue-500/10 text-blue-600',
    'Vận dụng': 'bg-amber-500/10 text-amber-600',
    'Vận dụng cao': 'bg-red-500/10 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-[#2463eb]/30 transition-all group p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-0.5 bg-[#2463eb]/10 text-[#2463eb] text-[10px] font-bold rounded uppercase tracking-wide">
              {exam.grade}
            </span>
            <span className={`px-2 py-0.5 ${difficultyColors[exam.difficulty || 'Thông hiểu']} text-[10px] font-bold rounded uppercase tracking-wide`}>
              {exam.difficulty || 'Thông hiểu'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              ID: {exam._id}
            </span>
          </div>
          {/* --- MODIFIED SECTION START --- */}
          <Link href={`/exam/${exam._id}`} title={`Bắt đầu làm bài: ${exam.name}`}>
            <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#2463eb] transition-colors duration-200">
              {exam.name}
            </h4>
          </Link>
          {/* --- MODIFIED SECTION END --- */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <ListOrdered size={18} />
              {exam.questions?.length || 0} câu hỏi
            </div>
            <div className="flex items-center gap-1.5">
              <Timer size={18} />
              {exam.duration} phút
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ActionButton 
            href={`/create-exam/${exam._id}`}
            icon={<Edit size={16} />} 
            text="Sửa đề thi" 
          />
          <ActionButton 
            icon={<Trash2 size={18} />} 
            title="Xóa" 
            danger 
            onClick={() => onDelete(exam._id)} 
          />
        </div>
      </div>
    </div>
  );
}

export default ExamCard;
