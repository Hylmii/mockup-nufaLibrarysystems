import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import type { Toast as ToastT } from '@/types';

const icons = {
  success: <CheckCircle2 size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

const styles = {
  success: 'bg-success-bg border-success-border text-success',
  warning: 'bg-warning-bg border-warning-border text-warning',
  error: 'bg-error-bg border-error-border text-error',
  info: 'bg-action-light border-action/30 text-action',
};

interface ToastStackProps {
  toasts: ToastT[];
  onDismiss: (id: string) => void;
  /** Halaman admin: geser ke kanan sidebar (248px) agar menu tidak tertutup. */
  besideSidebar?: boolean;
}

/** Batas notifikasi yang tampil bersamaan (yang terbaru) agar tumpukan tidak menutupi layar. */
const MAX_VISIBLE = 3;

export function ToastStack({ toasts, onDismiss, besideSidebar = false }: ToastStackProps) {
  if (toasts.length === 0) return null;
  // Di kiri bawah: tombol aksi di aplikasi ini rata kanan (Konfirmasi, Kembalikan, footer
  // dialog, pagination) sehingga tidak tertutup notifikasi. Kontainer meneruskan klik;
  // hanya kartu notifikasinya yang menangkap klik.
  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:right-auto z-[60] flex flex-col gap-2 sm:w-96 pointer-events-none ${
        besideSidebar ? 'lg:left-[264px]' : ''
      }`}
    >
      {toasts.slice(-MAX_VISIBLE).map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-elevated animate-toast-in ${styles[toast.type]}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span className="flex-shrink-0 mt-0.5">{icons[toast.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message && <p className="text-sm mt-0.5 opacity-90">{toast.message}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Tutup notifikasi"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
