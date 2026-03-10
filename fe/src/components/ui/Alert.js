'use client';

import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

// ======================================================================================
// GIẢI THÍCH REFACTOR:
// Đã loại bỏ prop `message` và thay thế bằng `children`.
// Đây là cách làm chuẩn của React để truyền nội dung vào một component.
//
// LỢI ÍCH:
// 1. An toàn tuyệt đối: React sẽ tự động "sanitize" (làm sạch) nội dung của children.
// 2. Linh hoạt: Bạn có thể dễ dàng truyền vào văn bản, các component khác hoặc HTML đơn giản.
//    Ví dụ: <Alert><p>Dòng 1</p><p>Dòng 2</p></Alert>
// 3. Dễ đọc hơn: Cách sử dụng <Alert>...</Alert> tường minh hơn <Alert message="..." />.
// ======================================================================================

const icons = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const bgColors = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-[#e9effd] border-[#2463eb]/30',
};

const textColors = {
  success: 'text-green-700',
  error: 'text-red-700',
  info: 'text-[#2463eb]',
};

/**
 * A reusable Alert component for displaying messages.
 * @param {object} props - The component props.
 * @param {'success' | 'error' | 'info'} [props.type='info'] - The type of the alert, controls color and icon.
 * @param {React.ReactNode} props.children - The content to display inside the alert. If null, the component will not render.
 * @param {Function} [props.onClose] - Optional. If provided, a close button will be displayed.
 * @param {string} [props.className] - Optional. Additional classes to apply to the component.
 */
export default function Alert({ type = 'info', children, onClose, className }) {
  if (!children) return null;

  return (
    <div 
      className={clsx(
        'flex items-start gap-3 rounded-lg border p-4 text-sm',
        bgColors[type],
        textColors[type],
        className,
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      {/* Sử dụng `children` thay vì `message` */}
      <div className="flex-1 font-medium">
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="-m-1 p-1 opacity-70 hover:opacity-100 transition">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
