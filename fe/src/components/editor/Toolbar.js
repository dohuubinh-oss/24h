'use client';

import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Sigma,
  // 1. Import các icon căn lề
  AlignCenter,
  AlignLeft,
  AlignRight,
} from 'lucide-react';

// Component Divider để tạo đường kẻ phân cách
const Divider = () => (
  <div className="w-px h-5 bg-slate-200 mx-2" />
);

const Toolbar = ({ editor, onOpenMathKeyboard }) => {
  if (!editor) {
    return null;
  }

  // Helper function để tạo nút
  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-slate-100 ${isActive ? 'bg-slate-200' : 'bg-white'}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="toolbar">
      {/* Nhóm nút In đậm, In nghiêng */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="In đậm"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="In nghiêng"
      >
        <Italic size={18} />
      </ToolbarButton>

      <Divider />

      {/* Nhóm nút Tiêu đề H1, H2, H3 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Tiêu đề 1"
      >
        <Heading1 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Tiêu đề 2"
      >
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Tiêu đề 3"
      >
        <Heading3 size={18} />
      </ToolbarButton>

      <Divider />

      {/* 2. Thêm nhóm nút căn lề */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Căn trái"
      >
        <AlignLeft size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Căn giữa"
      >
        <AlignCenter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Căn phải"
      >
        <AlignRight size={18} />
      </ToolbarButton>

      <Divider />

      {/* Nhóm nút Danh sách */}
       <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Danh sách (gạch đầu dòng)"
      >
        <List size={18} />
      </ToolbarButton>
       <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Danh sách (số thứ tự)"
      >
        <ListOrdered size={18} />
      </ToolbarButton>

      <Divider />

       {/* Nhóm nút Trích dẫn */}
       <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Trích dẫn"
      >
        <Quote size={18} />
      </ToolbarButton>
      
      {/* Nút Công thức Toán học */}
       <ToolbarButton
        onClick={onOpenMathKeyboard}
        isActive={false}
        title="Chèn công thức toán"
      >
        <Sigma size={18} />
      </ToolbarButton>

    </div>
  );
};

export default Toolbar;
