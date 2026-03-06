'use client';

import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const icons = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const bgColors = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  // Updated to use the primary color theme
  info: 'bg-[#e9effd] border-[#2463eb]/30',
};

const textColors = {
  success: 'text-green-700',
  error: 'text-red-700',
  // Updated to use the primary color
  info: 'text-[#2463eb]',
};

/**
 * A reusable Alert component for displaying messages.
 * @param {object} props - The component props.
 * @param {'success' | 'error' | 'info'} [props.type='info'] - The type of the alert, controls color and icon.
 * @param {string} props.message - The message to display. If null or empty, the component will not render.
 * @param {Function} [props.onClose] - Optional. If provided, a close button will be displayed.
 * @param {string} [props.className] - Optional. Additional classes to apply to the component.
 */
export default function Alert({ type = 'info', message, onClose, className }) {
  if (!message) return null;

  return (
    <div 
      className={clsx(
        'flex items-start gap-3 rounded-lg border p-4 text-sm',
        bgColors[type],
        textColors[type],
        className, // Apply external classes
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="-m-1 p-1 opacity-70 hover:opacity-100 transition">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
