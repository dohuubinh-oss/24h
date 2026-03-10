
import Link from 'next/link';
import { getAllLessons } from '@/lib/api';
import { Suspense } from 'react';

// Component hiển thị danh sách bài giảng
async function LessonsList() {
  // Giải thích:
  // - Gọi API để lấy danh sách tất cả bài giảng.
  // - Vì đây là Server Component, lời gọi API này được thực hiện trên server,
  //   an toàn và hiệu quả. Nó sẽ dùng baseURL 'http://127.0.0.1:5000/api/v1'
  //   như đã cấu hình trong api.js.
  const lessons = await getAllLessons();

  // Kiểm tra nếu không có bài giảng nào
  if (!lessons || lessons.length === 0) {
    return <p className="text-center text-gray-500">Hiện tại chưa có bài giảng nào.</p>;
  }

  // Giải thích:
  // - Dùng grid để hiển thị danh sách bài giảng một cách trực quan.
  // - Sử dụng component <Link> của Next.js để tạo các liên kết SEO-friendly
  //   đến trang chi tiết của từng bài giảng.
  // - Các class CSS được lấy từ TailwindCSS để tạo giao diện card đơn giản,
  //   tương tự như các phần khác của ứng dụng.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <Link 
          href={`/lessons/${lesson._id}`} 
          key={lesson._id} 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {lesson.title}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {/* Giả sử có trường description, nếu không sẽ hiển thị chuỗi rỗng */}
            {lesson.description || ''}
          </p>
        </Link>
      ))}
    </div>
  );
}

// Component chính của trang
export default function LessonsPage() {
  // Giải thích:
  // - Đây là component chính của trang `/lessons`.
  // - Cấu trúc layout với tiêu đề và một container cho danh sách.
  // - Sử dụng <Suspense> của React để hiển thị một fallback UI (ví dụ: "Đang tải...")
  //   trong khi dữ liệu của <LessonsList> đang được tải về từ server.
  //   Điều này cải thiện trải nghiệm người dùng, đặc biệt với kết nối mạng chậm.
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900 dark:text-white">
        Danh sách bài giảng
      </h1>
      <Suspense fallback={<p className="text-center">Đang tải danh sách bài giảng...</p>}>
        <LessonsList />
      </Suspense>
    </main>
  );
}
