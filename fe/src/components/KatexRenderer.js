'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Đảm bảo CSS của KaTeX được import

// Đây là phiên bản component gốc, mạnh mẽ và có mục đích rõ ràng.
// Nhiệm vụ duy nhất: nhận một chuỗi văn bản thuần túy và render các công thức toán bên trong.
// Nó không xử lý HTML.

const KatexRenderer = ({ text }) => {
  const parts = useMemo(() => {
    if (!text) return [];

    const parsedParts = [];
    let lastIndex = 0;
    let partIndex = 0;

    // Cơ chế state machine để tìm các khối $...$ và $$...$$
    const MODE_TEXT = 1;
    const MODE_LATEX_INLINE = 2;
    const MODE_LATEX_DISPLAY = 3;

    let mode = MODE_TEXT;
    let currentLatex = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (mode === MODE_TEXT) {
        if (char === '$') {
          if (i > lastIndex) {
            parsedParts.push({ type: 'text', content: text.substring(lastIndex, i), key: `part-${partIndex++}` });
          }
          if (nextChar === '$') {
            mode = MODE_LATEX_DISPLAY;
            i++; 
          } else {
            mode = MODE_LATEX_INLINE;
          }
          lastIndex = i + 1;
          currentLatex = '';
        } 
      } else { 
        let isEnd = false;
        if (mode === MODE_LATEX_INLINE && char === '$') {
            isEnd = true;
        } else if (mode === MODE_LATEX_DISPLAY && char === '$' && nextChar === '$') {
            isEnd = true;
            i++; 
        }

        if (isEnd) {
            try {
                const html = katex.renderToString(currentLatex, {
                    throwOnError: false,
                    displayMode: mode === MODE_LATEX_DISPLAY,
                });
                parsedParts.push({ type: 'math', content: html, key: `part-${partIndex++}` });
            } catch (e) {
                const originalText = (mode === MODE_LATEX_DISPLAY ? '$$' : '$') + currentLatex + (mode === MODE_LATEX_DISPLAY ? '$$' : '$');
                parsedParts.push({ type: 'text', content: originalText, key: `part-${partIndex++}` });
            }
            mode = MODE_TEXT;
            lastIndex = i + 1;
        } else {
            currentLatex += char;
        }
      }
    }

    if (lastIndex < text.length) {
      parsedParts.push({ type: 'text', content: text.substring(lastIndex), key: `part-${partIndex++}` });
    }

    return parsedParts;

  }, [text]);

  return (
    <>
      {parts.map(part =>
        part.type === 'math' ? (
          // Việc sử dụng dangerouslySetInnerHTML ở đây là an toàn vì nội dung 
          // được tạo ra bởi thư viện KaTeX đáng tin cậy, không phải từ người dùng.
          <span key={part.key} dangerouslySetInnerHTML={{ __html: part.content }} />
        ) : (
          // React tự động "escape" nội dung văn bản để chống lại XSS
          <span key={part.key}>{part.content}</span>
        )
      )}
    </>
  );
};

export default KatexRenderer;
