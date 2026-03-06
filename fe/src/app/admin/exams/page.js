'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useFilters } from '@/context/FilterContext';
import ExamCard from '@/components/ui/ExamCard';
import { 
  ChevronRight, 
  Loader2,
  ShieldAlert,
  SearchX
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [deletingExamId, setDeletingExamId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Lấy state bộ lọc từ context
  const { selectedGrade, selectedDifficulty, selectedType } = useFilters();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await api.get('/exams');
        setExams(response.data || []); 
      } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || 'Đã xảy ra lỗi';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Logic lọc dữ liệu
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchGrade = selectedGrade === 'Tất cả' || exam.grade === selectedGrade;
      const matchDifficulty = selectedDifficulty === 'Tất cả' || exam.difficulty === selectedDifficulty;
      const matchType = selectedType === 'Tất cả' || exam.examType === selectedType;
      return matchGrade && matchDifficulty && matchType;
    });
  }, [exams, selectedGrade, selectedDifficulty, selectedType]);

  const handleDeleteRequest = (id) => {
    setDeletingExamId(id);
  };

  const cancelDelete = () => {
    setDeletingExamId(null);
  };

  const confirmDelete = async () => {
    if (!deletingExamId) return;

    setIsDeleting(true);
    try {
      await api.delete(`/exams/${deletingExamId}`);
      setExams(currentExams => currentExams.filter(exam => exam._id !== deletingExamId));
      setDeletingExamId(null); 
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.message || 'Lỗi khi xóa đề thi';
      alert(errorMessage); 
    } finally {
      setIsDeleting(false);
    }
  };
  
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const currentExams = filteredExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset về trang 1 mỗi khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGrade, selectedDifficulty, selectedType]);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#2463eb] mx-auto" /></div>;
    }

    if (error) {
      return <div className="text-center py-20 bg-red-50 text-red-600 rounded-lg">Lỗi: {error}</div>;
    }

    if (filteredExams.length === 0) {
      return (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <SearchX className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">Không tìm thấy đề thi</h3>
              <p className="text-sm text-slate-500 mt-2">Không có đề thi nào phù hợp với bộ lọc hiện tại.</p>
          </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {currentExams.map((exam) => (
          <ExamCard key={exam._id} exam={exam} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  }

  return (
    <>
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Danh sách đề thi ({loading ? '...' : filteredExams.length})</h3>
        
        {renderContent()}
        
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}

      {/* --- Delete Confirmation Dialog --- */}
      {deletingExamId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Xác nhận xóa</h3>
              <p className="text-sm text-slate-500 mt-2">
                Bạn có chắc chắn muốn xóa đề thi này không?
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button 
                onClick={cancelDelete}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition-all"
                disabled={isDeleting}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamsPage;
