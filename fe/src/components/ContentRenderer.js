/* eslint-disable react/display-name */
'use client';

import React from 'react';
import parse, { domToReact } from 'html-react-parser';
import KatexRenderer from '../KatexRenderer'; // Tái sử dụng KatexRenderer đã có

// Giải thích:
// Component này đóng vai trò là một trình render cấp cao, có khả năng xử lý 
// nội dung HTML phức tạp có chứa các công thức toán học KaTeX.
// Nó giải quyết vấn đề mà KatexRenderer gốc không thể: xử lý một chuỗi HTML hoàn chỉnh thay vì chỉ văn bản thuần túy.

const ContentRenderer = ({ htmlContent }) => {
  if (!htmlContent) return null;

  const options = {
    // Giải thích:
    // Tùy chọn `replace` của thư viện html-react-parser cho phép chúng ta "can thiệp" 
    // vào quá trình chuyển đổi từ DOM node sang React component.
    replace: (domNode) => {
      // Chỉ xử lý các nút văn bản (type: 'text') không có thẻ cha là <code> hoặc <pre>
      // để tránh render KaTeX bên trong các khối code.
      if (domNode.type === 'text' && domNode.parent?.name !== 'code' && domNode.parent?.name !== 'pre') {
        // Giải thích:
        // Thay vì hiển thị văn bản trực tiếp, chúng ta chuyển nó qua KatexRenderer.
        // KatexRenderer sẽ tìm và render bất kỳ công thức toán nào có trong đoạn văn bản này,
        // trong khi vẫn giữ nguyên phần văn bản thông thường.
        // Đây là một ví dụ điển hình của việc "tái sử dụng và kết hợp component".
        return <KatexRenderer text={domNode.data} />;
      }

      // Nếu không phải là text node cần xử lý, giữ nguyên hành vi mặc định của thư viện.
      // domToReact sẽ chuyển đổi node DOM thành component React tương ứng.
      // Chúng ta cần truyền options vào để đảm bảo quy tắc replace được áp dụng đệ quy cho các con của node hiện tại.
      if (domNode.type === 'tag') {
        return React.createElement(
            domNode.name,
            domNode.attribs,
            domToReact(domNode.children, options)
        );
      }
    },
  };

  // Giải thích:
  // Gọi hàm parse với nội dung HTML và các tùy chọn tùy chỉnh của chúng ta.
  // Kết quả là một cây component React có thể render được, với các công thức toán đã được xử lý đúng cách.
  return <>{parse(htmlContent, options)}</>;
};

export default ContentRenderer;
