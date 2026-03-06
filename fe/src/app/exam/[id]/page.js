'use server';

import ExamSessionClient from '@/components/exam/ExamSessionClient';
import api from '@/lib/api';
import Link from 'next/link';

/**
 * Server Component để lấy dữ liệu bài thi và hiển thị trang làm bài.
 * @param {string} id - ID của bài thi từ URL.
 */
async function getExamData(id) {
  if (!id) {
    return {
      error: true,
      message: 'ID bài thi không hợp lệ.',
      status: 400,
    };
  }
  try {
    console.log(`[FRONTEND LOG] Bắt đầu gọi API để lấy dữ liệu cho bài thi ID: ${id}`);
    const response = await api.get(`/exams/${id}`);
    
    if (response.data && response.data.success) {
      console.log(`[FRONTEND LOG] Nhận dữ liệu bài thi thành công.`);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể lấy dữ liệu bài thi.');

  } catch (error) {
    console.error('[FRONTEND LOG] Lỗi khi gọi API lấy dữ liệu bài thi:', error.message);
    return {
      error: true,
      message: error.response?.data?.message || error.message || 'Đã có lỗi xảy ra khi tải dữ liệu bài thi.',
      status: error.response?.status || 500,
    };
  }
}

export default async function ExamPage({ params }) {
    // SỬA LỖI: Sử dụng `await` để giải nén Promise `params` một cách an toàn.
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const examData = await getExamData(id);

    // Nếu có lỗi, hiển thị thông báo lỗi thay vì trang làm bài
    if (examData.error) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600">Lỗi {examData.status}</h1>
            <p className="text-gray-700 mt-2">{examData.message}</p>
            <Link href="/" className="mt-4 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
              Về trang chủ
            </Link>
          </div>
        </div>
      );
    }

    if (!examData) {
      return <p>Không tìm thấy dữ liệu bài thi.</p>
    }

    return (
        <ExamSessionClient exam={examData} />
    );
}
