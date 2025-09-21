import { useEffect } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  primaryLabel?: string;
  onClose: () => void;
};

export default function Modal({ open, title, message, primaryLabel, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full mx-auto overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title ?? 'Notice'}</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{message}</div>
        </div>
        <div className="p-3 border-t dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-red-600 dark:bg-red-600 text-white hover:bg-red-700">{primaryLabel ?? 'OK'}</button>
        </div>
      </div>
    </div>
  );
}
