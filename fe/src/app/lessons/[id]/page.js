
import { getLessonById } from '@/lib/api';
import ContentRenderer from '@/components/ContentRenderer'; // Component mới để render HTML và KaTeX
import { notFound } from 'next/navigation';

// Giải thích (generateMetadata):
// - Đây là một hàm đặc biệt của Next.js App Router, được chạy trên server.
// - Nó cho phép chúng ta tạo metadata (ví dụ: thẻ <title>, <meta name="description">)
//   một cách động cho từng trang, rất quan trọng cho SEO.
// - Dữ liệu được lấy một lần và có thể được chia sẻ với component chính,
//   Next.js sẽ tự động thực hiện việc này để tối ưu hóa hiệu suất.
export async function generateMetadata({ params }) {
  try {
    const lesson = await getLessonById(params.id);
    if (!lesson) {
      return {
        title: 'Không tìm thấy bài giảng',
        description: 'Bài giảng bạn đang tìm kiếm không tồn tại.',
      };
    }
    return {
      title: lesson.title, // Tiêu đề trang sẽ là tiêu đề bài giảng
      description: lesson.description || 'Xem chi tiết bài giảng.', // Mô tả trang
    };
  } catch (error) {
    return {
      title: 'Lỗi máy chủ',
      description: 'Không thể tải metadata cho bài giảng này.',
    };
  }
}

// Component chính của trang chi tiết bài giảng
export default async function LessonDetailPage({ params }) {
  // Giải thích:
  // - Đây là một Server Component. Toàn bộ code bên trong nó sẽ chạy trên server.
  // - `params.id` được Next.js tự động truyền vào từ URL (ví dụ: /lessons/abc-123).
  let lesson;
  try {
    // Giải thích:
    // - Gọi API để lấy chi tiết bài giảng dựa trên ID từ URL.
    // - Lời gọi này sử dụng baseURL tuyệt đối ('http://127.0.0.1:5000/api/v1')
    //   vì nó đang chạy trên server.
    lesson = await getLessonById(params.id);
  } catch (error) {
    // Xử lý lỗi nếu API gặp sự cố
    console.error("Failed to fetch lesson:", error);
    // notFound() là một hàm của Next.js, sẽ render trang 404 mặc định.
    // Chúng ta sẽ tùy chỉnh trang 404 sau này nếu cần.
    notFound();
  }

  // Nếu không tìm thấy bài giảng, cũng hiển thị trang 404.
  if (!lesson) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <article className="prose lg:prose-xl dark:prose-invert mx-auto">
        {/* Tiêu đề bài giảng */}
        <h1 className="mb-4 text-4xl font-extrabold leading-tight lg:text-5xl">
          {lesson.title}
        </h1>
        
        <div className="mt-8">
            {/* 
              Giải thích:
              - Sử dụng component `ContentRenderer` chúng ta vừa tạo.
              - Truyền vào `htmlContent` là nội dung HTML của bài giảng lấy từ API.
              - `ContentRenderer` sẽ đảm nhiệm việc phân tích HTML và render KaTeX một cách an toàn.
              - Lớp CSS `prose` từ plugin `@tailwindcss/typography` giúp định dạng 
                nội dung HTML một cách đẹp mắt mà không cần style thủ công từng thẻ.
            */}
            <ContentRenderer htmlContent={lesson.content} />
        </div>

      </article>
    </main>
  );
}
