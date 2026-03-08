'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './Toolbar';
import './editor-styles.css';

import TiptapKatex from 'tiptap-katex';
import 'katex/dist/katex.min.css';
import MathKeyboard from './MathKeyboard';
import { useState, useEffect } from 'react';

// 1. Import extension mới
import TextAlign from '@tiptap/extension-text-align';

const TiptapEditor = ({ content, onChange, editable = true }) => {
  const [isMathKeyboardOpen, setMathKeyboardOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, 
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        code: false,
        codeBlock: false,
      }),
      TiptapKatex, 
      // 2. Kích hoạt extension với các tùy chọn căn lề
      TextAlign.configure({
        types: ['heading', 'paragraph'], // Cho phép căn lề cho heading và paragraph
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: editable, 
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none tiptap-editor h-full',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);


  if (!editor) {
    return null;
  }

  const openMathKeyboard = () => {
    setMathKeyboardOpen(true);
  };

  const handleInsertMath = (latex) => {
    if (editor) {
      editor.chain().focus().insertContent(`<span data-katex="true">${latex}</span>`).run();
    }
  };

  return (
    <div className="editor-container flex flex-col h-full">
      {/* 3. Truyền các nút mới vào Toolbar (logic sẽ được xử lý trong Toolbar.js) */}
      {editable && <Toolbar editor={editor} onOpenMathKeyboard={openMathKeyboard} />} 
      
      <EditorContent editor={editor} className="flex-1 overflow-y-auto min-h-0" />

      <MathKeyboard 
        isOpen={isMathKeyboardOpen}
        onClose={() => setMathKeyboardOpen(false)}
        onInsert={handleInsertMath}
      />
    </div>
  );
};

export default TiptapEditor;
