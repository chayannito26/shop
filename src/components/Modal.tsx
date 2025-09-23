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
      <div className="relative bg-theme-bg-secondary rounded-lg shadow-theme-lg max-w-lg w-full mx-auto overflow-hidden">
        <div className="p-4 border-b border-theme-border flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-theme-text-primary">{title ?? 'Notice'}</h3>
          </div>
          <button onClick={onClose} className="text-theme-text-secondary hover:text-theme-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="text-theme-text-secondary leading-relaxed">{message}</div>
        </div>
        <div className="p-3 border-t border-theme-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-theme-accent text-white hover:bg-theme-accent-hover">{primaryLabel ?? 'OK'}</button>
        </div>
      </div>
    </div>
  );
}
