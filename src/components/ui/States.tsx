import { Inbox, AlertCircle, Lock, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="text-ink-muted mb-3">
        {icon || <Inbox size={40} strokeWidth={1.5} />}
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="text-error mb-3">
        <AlertCircle size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PermissionDenied({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-warning mb-3">
        <Lock size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">Akses Ditolak</h3>
      <p className="text-sm text-ink-muted max-w-sm">
        {message || 'Anda tidak memiliki izin untuk mengakses halaman ini.'}
      </p>
    </div>
  );
}

export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <Loader2 size={32} className="text-action animate-spin mb-3" />
      <p className="text-sm text-ink-muted">{message || 'Memuat data...'}</p>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
