'use server';

import api from '@/lib/api';
import Link from 'next/link';
import SubmissionResultClient from '@/components/submission/SubmissionResultClient'; // 1. Import component mới

/**
 * Server Component để lấy dữ liệu chi tiết của một bài làm đã nộp.
 * @param {string} id - ID của bài làm từ URL.
 */
async function getSubmissionData(id) {
  if (!id) {
    return { error: true, message: 'ID bài làm không hợp lệ.', status: 400 };
  }

  try {
    const response = await api.get(`/submissions/${id}`);

    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể lấy dữ liệu bài làm.');

  } catch (error) {
    console.error('[SERVER LOG] Lỗi khi lấy dữ liệu bài làm:', error);
    return {
      error: true,
      message: error.response?.data?.message || error.message || 'Đã có lỗi xảy ra khi tải dữ liệu.',
      status: error.response?.status || 500,
    };
  }
}

// Trang này là một Server Component theo mặc định trong App Router
export default async function SubmissionPage({ params }) {
  // `params` có thể là một Promise, chúng ta await để đảm bảo có giá trị
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Gọi hàm để lấy dữ liệu từ phía server
  const submissionData = await getSubmissionData(id);

  // 2. Xử lý trường hợp có lỗi (không tìm thấy, không có quyền, ...)
  if (submissionData.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600">Lỗi {submissionData.status}</h1>
          <p className="text-gray-700 mt-2 mb-6">{submissionData.message}</p>
          <Link href="/" className="mt-4 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Trường hợp không có dữ liệu nhưng không báo lỗi (hiếm gặp)
  if (!submissionData) {
    return <p>Không tìm thấy dữ liệu bài làm.</p>;
  }

  // 3. Thay vì hiển thị JSON thô, chúng ta render Client Component và truyền dữ liệu vào
  return <SubmissionResultClient submission={submissionData} />;
}
