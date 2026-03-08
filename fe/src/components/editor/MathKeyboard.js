'use client';

import React, { useRef, useEffect, useState } from 'react';

const MathKeyboard = ({ isOpen, onClose, onInsert }) => {
  const mathFieldRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sử dụng dynamic import để chỉ tải MathLive ở phía client
  useEffect(() => {
    if (isOpen && !isLoaded) {
      import('mathlive').then(() => {
        setIsLoaded(true);
      });
    }
  }, [isOpen, isLoaded]);

  // Tự động focus vào trình soạn thảo công thức khi cửa sổ mở và thư viện đã tải xong
  useEffect(() => {
    if (isOpen && isLoaded && mathFieldRef.current) {
      // Đảm bảo rằng mathfield đã được nâng cấp trước khi focus
      // MathLive có thể mất một chút thời gian để khởi tạo sau khi import
      setTimeout(() => {
        mathFieldRef.current.focus();
      }, 0);
    }
  }, [isOpen, isLoaded]);


  if (!isOpen) {
    return null;
  }

  const handleInsert = () => {
    if (mathFieldRef.current) {
      const latex = mathFieldRef.current.value;
      if (latex) {
        onInsert(latex);
      }
      onClose(); 
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Ngăn việc nhấn vào nội dung cửa sổ làm đóng cửa sổ
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Lớp phủ modal
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={handleCancel} 
    >
      {/* Nội dung modal */}
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl animate-in fade-in-0 zoom-in-95"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Soạn thảo công thức</h3>
            <button onClick={handleCancel} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        
        {/* Trình soạn thảo MathLive chỉ render sau khi thư viện đã được tải */}
        {isLoaded ? (
          <math-field
            ref={mathFieldRef}
            style={{ 
                display: 'block', 
                width: '100%', 
                padding: '1rem', 
                fontSize: '1.2rem', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                marginBottom: '1.5rem' 
              }}
            // virtual-keyboard-mode đã được chuyển thành thuộc tính thay vì options
            virtual-keyboard-mode="manual"
          >
          </math-field>
        ) : (
          // Hiển thị một placeholder trong khi chờ tải
          <div style={{ 
            display: 'block', 
            width: '100%', 
            padding: '1rem', 
            fontSize: '1.2rem', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            height: '100px', // Chiều cao giả
            backgroundColor: '#f8f9fa'
          }}>Đang tải trình soạn thảo...</div>
        )}

        {/* Các nút hành động */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-8 py-3 rounded-lg bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors uppercase text-xs tracking-wider"
          >
            Hủy
          </button>
          <button
            onClick={handleInsert}
            disabled={!isLoaded} // Vô hiệu hóa nút khi chưa tải xong
            className="px-8 py-3 rounded-lg bg-[#2463eb] text-white font-semibold hover:bg-[#1D4ED8] transition-colors uppercase text-xs tracking-wider disabled:bg-slate-400"
          >
            Chèn công thức
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathKeyboard;
