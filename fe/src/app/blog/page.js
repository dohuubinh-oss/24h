
import KatexRenderer from '../../components/KatexRenderer';

// ======================================================================================
// GIẢI THÍCH GIẢI PHÁP CUỐI CÙNG:
//
// VẤN ĐỀ GỐC RỄ: Có sự xung đột giữa Tailwind `prose` (cần thẻ HTML thật như <h1>, <p>)
// và component `KatexRenderer` (khi xử lý phần văn bản, nó chỉ render ra text thuần túy
// trong thẻ <span>, làm cho `prose` không có tác dụng).
//
// GIẢI PHÁP:
// 1. Viết nội dung `blogContent` bằng HTML trực tiếp thay vì Markdown.
// 2. Tách chuỗi nội dung thành một mảng xen kẽ [phần HTML, phần Toán, phần HTML, ...].
// 3. Khi render:
//    - Với phần HTML: Dùng `dangerouslySetInnerHTML` để render ra các thẻ HTML thật.
//      Điều này cho phép `prose` có thể định dạng chúng.
//    - Với phần Toán: Gửi nó cho component `<KatexRenderer>`, component này sẽ tự xử lý
//      và hiển thị công thức một cách chính xác.
// ======================================================================================

const FinalCorrectRenderer = ({ content }) => {
  const regex = /(\$\$.*?\$\$|\$.*?\$)/g;
  const parts = content.split(regex);

  return parts.map((part, index) => {
    if (!part) return null; // Bỏ qua các chuỗi rỗng

    // Phần toán học (chỉ số lẻ)
    if (index % 2 === 1) {
      return <KatexRenderer key={index} text={part} />;
    }

    // Phần HTML (chỉ số chẵn)
    return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
  });
};

export default function BlogPage() {
  // Nội dung bài viết được viết bằng HTML.
  const blogContent = `
    <h1>Đây là tiêu đề của bài viết</h1>
    <p>Đây là một đoạn văn bản giới thiệu. Lớp 'prose' của Tailwind sẽ tự động định dạng cho nó một cách đẹp mắt, với khoảng cách dòng, kích thước font chữ hợp lý.</p>
    <p>Chúng ta có thể có các danh sách:</p>
    <ul>
        <li>Mục 1: Rất dễ đọc.</li>
        <li>Mục 2: Được tự động tạo kiểu.</li>
    </ul>
    <p>Và đây là phần thú vị, chúng ta sẽ chèn một công thức toán học ngay trong dòng: $E = mc^2$.</p>
    <p>Sau đó là một công thức toán khác ở dạng khối, chiếm trọn một dòng riêng:</p>
    $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$$
    <p>Văn bản lại tiếp tục như bình thường. Phương pháp này kết hợp sức mạnh của cả hai công nghệ một cách chính xác.</p>
  `;

  return (
    <div className="flex justify-center p-8">
      <article className="prose lg:prose-xl">
        <FinalCorrectRenderer content={blogContent} />
      </article>
    </div>
  );
}
