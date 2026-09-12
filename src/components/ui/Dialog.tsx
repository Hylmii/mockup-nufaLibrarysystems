import { useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Dialog({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/30 animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative bg-surface rounded-lg shadow-drawer border border-line w-full ${maxWidth} animate-scale-in`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 id="dialog-title" className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 rounded-md hover:bg-canvas transition-colors"
            aria-label="Tutup dialog"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-line bg-canvas/50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
