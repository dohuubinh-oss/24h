'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { 
  ChevronRight, 
  Plus, 
  FolderOpen, 
  ClipboardList, 
  Trash2, 
  X,
} from 'lucide-react';
import { useFilters } from '../../../context/FilterContext';

import api from '../../../lib/api';
import Alert from '../../../components/ui/Alert';
import QuestionCard from '../../../components/ui/QuestionCard';
import Pagination from '../../../components/ui/Pagination'; 

const ManageQuestionsPage = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const limit = 10;
  
  const { selectedGrade, selectedSubject, selectedDifficulty, selectedType } = useFilters();
  const { user, loading: authLoading } = useAuth();

  const fetchFilteredQuestions = useCallback(async () => {
    setPageLoading(true);
    setError(null);

    try {
      const res = await api.get('/questions', {
        params: {
          grade: selectedGrade && selectedGrade !== 'Tất cả' ? selectedGrade : undefined,
          topic: selectedSubject && selectedSubject !== 'Tất cả' ? selectedSubject : undefined,
          difficulty: selectedDifficulty && selectedDifficulty !== 'Tất cả' ? selectedDifficulty : undefined,
          type: selectedType && selectedType !== 'Tất cả' ? selectedType : undefined,
          page: currentPage,
          limit: limit,
        },
      });

      const data = res.data; 
      const questionData = data.data || [];
      setQuestions(questionData);
      setTotalQuestions(data.total || questionData.length);

    } catch (err) {
        console.error('Error fetching questions:', err);
        const message = err.response?.data?.message || err.message || 'Failed to fetch questions';
        if (err.response?.status === 401 || err.response?.status === 403) {
            setError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
            setError(message);
        }
        setQuestions([]);
    } finally {
      setPageLoading(false);
    }
  }, [currentPage, selectedGrade, selectedSubject, selectedDifficulty, selectedType]);

  useEffect(() => {
    if (authLoading) {
      setPageLoading(true);
      return;
    }
    if (!user) {
      setError('Bạn cần đăng nhập để xem nội dung này.');
      setPageLoading(false);
      return;
    }
    fetchFilteredQuestions();
  }, [user, authLoading, fetchFilteredQuestions, refreshKey]);

  const totalPages = Math.ceil(totalQuestions / limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;
    try {
      await api.delete(`/questions/${id}`);
      
      alert("Xóa thành công!");

      if (questions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setRefreshKey(oldKey => oldKey + 1);
      }

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete');
    }
  };
  
  const handleBulkDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa ${selectedQuestions.length} câu hỏi đã chọn?`)) return;
    alert(`Đã xóa (mô phỏng) ${selectedQuestions.length} câu hỏi.`);
    setSelectedQuestions([]);
  }

  const handleEditClick = (question) => {
    router.push(`/create-questions?id=${question._id}`);
  };

  const toggleSelection = (id) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  if (pageLoading) {
      return <div className="text-center py-20">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/admin" className="hover:text-[#2463eb] transition-colors">Admin</Link>
                <ChevronRight size={10} />
                <span className="text-[#2463eb] font-medium">Ngân hàng câu hỏi</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Danh sách câu hỏi ({totalQuestions})</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
             <Link
                href={`/create-exam?questionIds=${selectedQuestions.join(',')}`}
                onClick={(e) => {
                  if (selectedQuestions.length === 0) {
                    e.preventDefault();
                    alert('Vui lòng chọn ít nhất một câu hỏi để tạo đề thi.');
                  }
                }}
                className={`flex items-center gap-2 border border-[#2463eb] text-[#2463eb] px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedQuestions.length > 0 ? 'hover:bg-[#2463eb]/10' : 'opacity-50 cursor-not-allowed'
                }`}
                aria-disabled={selectedQuestions.length === 0}
              >
                <ClipboardList size={18} />
                Tạo đề thi
              </Link>

            <Link 
              href="/create-questions"
              className="flex items-center gap-2 bg-[#2463eb] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-[#2463eb]/20 hover:bg-[#2463eb]/90 transition-all">
                <Plus size={18} />
                Thêm câu hỏi
            </Link>
          </div>
        </div>

        {error && <Alert message={error} type="error" onClose={() => setError(null)} />} 

        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((q) => (
              <QuestionCard 
                key={q._id} 
                question={q} 
                isSelected={selectedQuestions.includes(q._id)}
                onToggleSelection={toggleSelection}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500">Không tìm thấy câu hỏi nào phù hợp.</p>
            </div>
          )}
        </div>

        {questions.length > 0 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Hiển thị <span className="font-bold text-slate-800">{questions.length}</span> trong số <span className="font-bold text-slate-800">{totalQuestions}</span> câu hỏi
                </p>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
        )}

        {selectedQuestions.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-6 z-50">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#2463eb] text-white text-[10px] flex items-center justify-center font-bold">{selectedQuestions.length}</span>
              <span className="text-sm font-semibold text-slate-700">Đã chọn {selectedQuestions.length} câu hỏi</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <Link href={`/create-exam?questionIds=${selectedQuestions.join(',')}`} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#2463eb] transition-colors"><ClipboardList size={18} />Tạo đề thi</Link>
              <button className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#2463eb] transition-colors"><FolderOpen size={18} />Lưu vào thư mục</button>
              <button onClick={handleBulkDelete} className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"><Trash2 size={18} />Xóa hàng loạt</button>
            </div>
            <button onClick={() => setSelectedQuestions([])} className="text-slate-400 hover:text-slate-600 ml-2"><X size={18} /></button>
          </div>
        )}
    </div>
  );
};

export default ManageQuestionsPage;