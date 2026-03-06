'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/ui/Alert';
import QuestionCard from '../../components/ui/QuestionCard';
import api from '../../lib/api'; // <--- IMPORT API (AXIOS WRAPPER)
import {
  Sparkles,
  Save,
  ListChecks, 
  PencilLine, 
  Sliders,
  LayoutGrid,
  Lightbulb,
  ChevronDown,
  FileText,
  Loader2,
} from 'lucide-react';

const CreateExamPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loading: authLoading, user } = useAuth(); // Get user to check for login status

  const [examName, setExamName] = useState('Kiểm Tra giữa kì 2 -toán 8- đề số 1');
  const [examDuration, setExamDuration] = useState(90);
  const [grade, setGrade] = useState('Lớp 12');
  const [examType, setExamType] = useState('Thi học kì 1');
  const [examCode, setExamCode] = useState('');
  const [gradingScale, setGradingScale] = useState(10);

  const [questions, setQuestions] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const questionIds = useMemo(() => {
    const param = searchParams.get('questionIds');
    return param ? param.split(',') : [];
  }, [searchParams]);

  useEffect(() => {
    if (authLoading) return;
    
    // Use the user object from AuthContext to check for login
    if (!user || questionIds.length === 0) {
        setPageLoading(false);
        if(!user) setError("Bạn cần đăng nhập để thực hiện hành động này.");
        return;
    }

    const fetchAllQuestions = async () => {
        setPageLoading(true);
        setError(null);
        try {
            // Use Promise.all with our new api wrapper
            const results = await Promise.all(
                questionIds.map(id => api.get(`/questions/${id}`))
            );
            // Axios nests the response data under the `data` property
            const fetchedQuestions = results.map(result => result.data.data).filter(Boolean);
            setQuestions(fetchedQuestions);

            if (fetchedQuestions.length > 0 && fetchedQuestions[0].grade) {
                setGrade(fetchedQuestions[0].grade);
            }

        } catch (err) {
            console.error("Error fetching questions:", err);
            setError("Lỗi khi tải dữ liệu câu hỏi. Vui lòng thử lại.");
        } finally {
            setPageLoading(false);
        }
    };
    
    fetchAllQuestions();
  }, [questionIds, authLoading, user]); // Add user to dependency array

  const { multipleChoiceQuestions, essayQuestions } = useMemo(() => {
    const mcq = questions.filter(q => q.type === 'Trắc nghiệm');
    const essay = questions.filter(q => q.type === 'Tự luận');
    return { multipleChoiceQuestions: mcq, essayQuestions: essay };
  }, [questions]);

  const handleEdit = (question) => {
    window.open(`/create-questions?id=${question._id}`, '_blank');
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi đề thi không?')) {
      setQuestions(prev => prev.filter(q => q._id !== id));
    }
  };

  const handleChangeQuestion = (id) => {
    console.log(`Changing question: ${id}`);
    alert(`Tính năng "Đổi câu hỏi" (ID: ${id}) sẽ được triển khai trong tương lai.`);
  };
  
  const examAnalysis = useMemo(() => {
      if (!questions || questions.length === 0) {
          return { difficultyText: 'Chưa xác định', qualityScore: '0.0' };
      }
      const difficultyScores = { 'Nhận biết': 1, 'Thông hiểu': 2, 'Vận dụng': 3, 'Vận dụng cao': 4 };
      const totalScore = questions.reduce((acc, q) => acc + (difficultyScores[q.difficulty] || 0), 0);
      const averageScore = totalScore / questions.length;
      
      let difficultyText = 'Nhận biết';
      if (averageScore > 3.5) difficultyText = 'Vận dụng cao';
      else if (averageScore > 2.5) difficultyText = 'Vận dụng';
      else if (averageScore > 1.5) difficultyText = 'Thông hiểu';

      const qualityScore = Math.min(10, (averageScore / 4) * 9 + 1).toFixed(1);
      return { difficultyText, qualityScore };
  }, [questions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!examName.trim() || !grade || !examType || examDuration <= 0 || questions.length === 0) {
        setSubmitError('Vui lòng điền đầy đủ thông tin và đảm bảo có ít nhất một câu hỏi.');
        return;
    }

    // No need to check for token manually anymore!
    
    setIsSubmitting(true);

    try {
        // Use the api wrapper for the POST request
        const res = await api.post('/exams', { 
          name: examName,
          grade: grade,
          examType: examType,
          examCode: examCode, 
          duration: examDuration, 
          difficulty: examAnalysis.difficultyText, 
          gradingScale: gradingScale,
          questions: questions.map(q => q._id)
        });

        const result = res.data; // Axios wraps response in `data`
        if (!result.success) throw new Error(result.message || 'Không thể tạo đề thi');
        
        setSubmitSuccess('Tạo đề thi thành công! Bạn sẽ được chuyển hướng sau giây lát.');
        
        setTimeout(() => {
          router.push('/admin/exams');
        }, 2000);

    } catch (err) {
        setSubmitError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi không xác định');
        setIsSubmitting(false);
    }
  };

  const examMatrix = useMemo(() => {
      if (!questions || questions.length === 0) {
          return { matrix: {}, totals: { nb: 0, th: 0, vd: 0, vdc: 0 } };
      }
      const matrix = {};
      const totals = { nb: 0, th: 0, vd: 0, vdc: 0 };
      const difficultyMap = { 'Nhận biết': 'nb', 'Thông hiểu': 'th', 'Vận dụng': 'vd', 'Vận dụng cao': 'vdc' };
      for (const q of questions) {
          if (!q || !q.topic || !q.difficulty) continue;
          const topic = q.topic;
          const difficultyKey = difficultyMap[q.difficulty];
          if (!difficultyKey) continue;
          if (!matrix[topic]) {
              matrix[topic] = { name: topic, nb: 0, th: 0, vd: 0, vdc: 0 };
          }
          matrix[topic][difficultyKey]++;
          totals[difficultyKey]++;
      }
      return { matrix, totals };
  }, [questions]);

  const isLoading = authLoading || pageLoading;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-4 md:px-8 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#e9effd] p-2 rounded-lg text-[#2463eb]">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">{examName}</h1>
              <p className="text-xs text-slate-500">{grade} • {questions.length} câu hỏi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSubmit} disabled={isSubmitting || isLoading} className="flex items-center gap-2 px-5 py-2 bg-[#2463eb] hover:bg-[#2463eb]/90 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50">
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isSubmitting ? 'Đang lưu...' : 'Lưu & Xuất bản'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1">
        <div className="lg:col-span-8 space-y-6">
          {submitSuccess && <Alert type="success" message={submitSuccess} onClose={() => setSubmitSuccess(null)} />}
          {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError(null)} />}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-[#2463eb]" size={32} /><p className="ml-3 text-slate-500">Đang tải câu hỏi...</p></div>
          ) : error ? (
            <div className="text-center py-20 border border-dashed border-red-200 bg-red-50 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>
          ) : questions.length > 0 ? (
            <div className="space-y-8">
              {multipleChoiceQuestions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <ListChecks className="text-[#2463eb]" size={24} />
                    Phần 1: Câu hỏi trắc nghiệm ({multipleChoiceQuestions.length} câu)
                  </h2>
                  {multipleChoiceQuestions.map((q, index) => (
                    <QuestionCard 
                      key={q?._id || index} 
                      question={q} 
                      index={index}
                      variant="exam"
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onChangeQuestion={handleChangeQuestion}
                    />
                  ))}
                </div>
              )}

              {essayQuestions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <PencilLine className="text-[#2463eb]" size={24} />
                    Phần 2: Câu hỏi tự luận ({essayQuestions.length} câu)
                  </h2>
                  {essayQuestions.map((q, index) => (
                    <QuestionCard 
                      key={q?._id || index} 
                      question={q} 
                      index={multipleChoiceQuestions.length + index} 
                      variant="exam"
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onChangeQuestion={handleChangeQuestion}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-lg">
              <FileText size={40} className="mx-auto text-slate-300"/>
              <p className="mt-2 text-sm text-slate-500">Không có câu hỏi nào được chọn.</p>
              <p className="mt-1 text-xs text-slate-400">Hãy quay lại ngân hàng câu hỏi và chọn câu hỏi để tạo đề.</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50/70 border-b border-slate-200">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                  <Sliders className="text-[#2463eb]" size={20} />
                  Cấu hình đề thi
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 ml-1">Tên đề thi</label>
                  <input 
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2463eb]/20 focus:border-[#2463eb] outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ví dụ: Đề cuối kỳ I Toán 12"
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 ml-1">Loại đề thi</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2463eb]/20 focus:border-[#2463eb] outline-none transition-all cursor-pointer"
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                    >
                      {[
                        'Bài tập về nhà',
                        'Kiểm tra 15 phút',
                        'Kiểm tra 1 tiết',
                        'Kiểm tra giữa kì 1',
                        'Kiểm tra giữa kỳ 2',
                        'Thi học kì 1',
                        'Thi học kì 2',
                        'Thi chuyển cấp'
                      ].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Khối lớp</label>
                    <div className="relative">
                      <select 
                        className="w-full appearance-none px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2463eb]/20 focus:border-[#2463eb] outline-none transition-all cursor-pointer"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                      >
                        {['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Thời gian (phút)</label>
                      <input 
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2463eb]/20 focus:border-[#2463eb] outline-none transition-all"
                        type="number"
                        value={examDuration}
                        onChange={(e) => setExamDuration(Number(e.target.value))}
                      />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50/70 border-b border-slate-200">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800">
                    <LayoutGrid className="text-[#2463eb]" size={20} />
                    Ma trận đề thi
                    </h3>
                </div>
                {questions.length > 0 ? (
                    <>
                        <div className="p-4 overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                <tr className="text-slate-500 border-b border-slate-100">
                                    <th className="py-2 px-1 font-medium">Chủ đề</th>
                                    <th className="py-2 px-1 font-medium text-center">NB</th>
                                    <th className="py-2 px-1 font-medium text-center">TH</th>
                                    <th className="py-2 px-1 font-medium text-center">VD</th>
                                    <th className="py-2 px-1 font-medium text-center">VDC</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {Object.values(examMatrix.matrix).map((row) => (
                                    <tr key={row.name}>
                                    <td className="py-2.5 px-1 font-medium text-slate-700 text-xs">{row.name}</td>
                                    <td className="py-2.5 px-1 text-center tabular-nums">{row.nb || 0}</td>
                                    <td className="py-2.5 px-1 text-center tabular-nums">{row.th || 0}</td>
                                    <td className="py-2.5 px-1 text-center tabular-nums">{row.vd || 0}</td>
                                    <td className="py-2.5 px-1 text-center tabular-nums">{row.vdc || 0}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50/70 font-bold">
                                    <td className="py-2.5 px-1 text-slate-800 text-sm">Tổng cộng</td>
                                    <td className="py-2.5 px-1 text-center text-slate-800 tabular-nums">{examMatrix.totals.nb}</td>
                                    <td className="py-2.5 px-1 text-center text-slate-800 tabular-nums">{examMatrix.totals.th}</td>
                                    <td className="py-2.5 px-1 text-center text-slate-800 tabular-nums">{examMatrix.totals.vd}</td>
                                    <td className="py-2.5 px-1 text-center text-slate-800 tabular-nums">{examMatrix.totals.vdc}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-2 text-sm">
                                <span className="text-slate-600">Độ khó: <span className="font-bold text-slate-800">{examAnalysis.difficultyText}</span></span>
                                <span className="font-bold text-slate-800">{examAnalysis.qualityScore}<span className="font-normal text-slate-500">/10</span></span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-[#2463eb] h-1.5 rounded-full" style={{ width: `${examAnalysis.qualityScore * 10}%` }}></div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-4 text-center text-sm text-slate-400">
                    Chưa có câu hỏi nào để tạo ma trận.
                    </div>
                )}
            </div>

            <div className="p-5 bg-gradient-to-br from-[#2463eb] to-blue-700 rounded-2xl text-white shadow-lg shadow-[#2463eb]/20">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={20} />
                    <h4 className="font-bold text-sm">Gợi ý từ AI</h4>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed mb-4">
                    Gợi ý tự động về đề thi sẽ được hiển thị ở đây trong các phiên bản sau.
                </p>
                <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-bold transition-all">
                    Tạo câu hỏi tự động
                </button>
            </div>

          </div>
        </aside>
      </main>

      <div className="lg:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex gap-2 z-20 shadow-inner">
        <button onClick={handleSubmit} disabled={isSubmitting || isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2463eb] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#2463eb]/30 disabled:opacity-50">
          {isSubmitting ? <Loader2 size={20} className="animate-spin"/> : <Save size={20} />}
          {isSubmitting ? 'Đang lưu...' : 'Lưu đề thi'}
        </button>
      </div>
    </div>
  );
};

export default CreateExamPage;
