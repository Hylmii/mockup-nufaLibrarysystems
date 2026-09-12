import type { BookStatus } from '@/types';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'navy';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-canvas text-ink-muted border-line',
  success: 'bg-success-bg text-success border-success-border',
  warning: 'bg-warning-bg text-warning border-warning-border',
  error: 'bg-error-bg text-error border-error-border',
  info: 'bg-action-light text-action border-action/30',
  navy: 'bg-navy-50 text-navy border-navy-100',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
};

export function Badge({ variant = 'neutral', size = 'sm', children, icon, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

const statusConfig: Record<BookStatus, { label: string; variant: BadgeVariant; icon: string }> = {
  tersedia: { label: 'Tersedia', variant: 'success', icon: 'check' },
  dipinjam: { label: 'Dipinjam', variant: 'warning', icon: 'clock' },
  direservasi: { label: 'Direservasi', variant: 'info', icon: 'bookmark' },
  'tidak-dapat-dipinjam': { label: 'Tidak Dapat Dipinjam', variant: 'neutral', icon: 'lock' },
};

export function StatusBadge({ status, size = 'sm' }: { status: BookStatus; size?: BadgeSize }) {
  const cfg = statusConfig[status];
  return (
    <Badge variant={cfg.variant} size={size}>
      {cfg.label}
    </Badge>
  );
}
