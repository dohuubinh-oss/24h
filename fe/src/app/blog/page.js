'use client';

import React from 'react';
import parse, { domToReact } from 'html-react-parser';
import KatexRenderer from '../../components/KatexRenderer';

// ======================================================================================
// GIẢI THÍCH KIẾN TRÚC TỐI ƯU:
//
// 1. `html-react-parser` được dùng để phân tích chuỗi HTML.
// 2. Quy tắc `replace` được giữ ở mức tối giản:
//    - Khi gặp một thẻ HTML (p, h1, ul...): KHÔNG làm gì cả. Thư viện sẽ tự động
//      chuyển nó thành thẻ React tương ứng. Điều này giữ lại cấu trúc cho `prose`.
//    - Khi gặp một nút văn bản (text node): Giao toàn bộ nội dung văn bản đó
//      cho component <KatexRenderer> chuyên dụng.
// 3. <KatexRenderer> (đã được phục hồi) sẽ nhận đoạn văn bản, tìm và render các
//    công thức toán bên trong nó.
//
// KẾT QUẢ: Mỗi phần làm đúng một việc, code sạch sẽ, không trùng lặp, dễ bảo trì
// và quan trọng nhất là HIỂN THỊ ĐÚNG.
// ======================================================================================

const fakeBlogContent = `
  <h1>Khám phá Định lý Euler</h1>
  <p>Công thức Euler, được đặt theo tên nhà toán học vĩ đại Leonhard Euler, là một trong những phương trình đẹp nhất trong toán học. Nó có dạng:</p>
  <p>$$ e^{i\pi} + 1 = 0 $$</p>
  <p>Công thức này kết nối năm hằng số toán học cơ bản: $e$ (cơ số của logarit tự nhiên), $i$ (đơn vị ảo), $\pi$ (pi), 1, và 0.</p>
  <h2>Ứng dụng trong Hình học</h2>
  <p>Trong hình học phẳng, diện tích của một hình tròn có bán kính $r$ được tính bằng công thức $A = \pi r^2$.</p>
  <ul>
    <li>Với $r=1$, diện tích là $\pi$.</li>
    <li>Với $r=2$, diện tích là $4\pi$.</li>
  </ul>
  <p>Đây là một ví dụ về một phương trình nội tuyến: $a^2 + b^2 = c^2$, được biết đến là Định lý Pythagoras.</p>
`;

const options = {
  replace: (domNode) => {
    // Nếu là một nút văn bản và không phải là khoảng trắng rỗng, giao nó cho KatexRenderer.
    if (domNode.type === 'text' && domNode.data.trim().length > 0) {
      return <KatexRenderer text={domNode.data} />;
    }
    
    // Đối với tất cả các thẻ HTML khác, không cần quy tắc `replace`.
    // Thư viện sẽ tự động xử lý chúng một cách chính xác.
  },
};

export default function BlogPage() {
  // `parse` sẽ áp dụng các quy tắc trong `options` cho chuỗi HTML.
  const parsedContent = parse(fakeBlogContent, options);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            {/* 
              Lớp `prose` sẽ áp dụng style cho các thẻ p, h1, ul... 
              được tạo ra một cách chính xác bởi `html-react-parser`.
            */}
            <article className="prose lg:prose-xl max-w-none">
              {parsedContent}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
