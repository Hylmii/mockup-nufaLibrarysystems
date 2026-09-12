import { useEffect } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, title, children, footer, width = 'max-w-md' }: DrawerProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-navy-900/30 animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative bg-surface shadow-drawer h-full w-full ${width} flex flex-col animate-slide-in-right`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
          <h2 id="drawer-title" className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 rounded-md hover:bg-canvas transition-colors"
            aria-label="Tutup panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-line bg-canvas/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
