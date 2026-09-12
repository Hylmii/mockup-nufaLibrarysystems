interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  breakdown?: { SD: number; SMP: number; SMA: number };
  format?: (n: number) => string;
  variant?: 'default' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

const variantStyles = {
  default: 'text-navy',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-action',
};

const iconBgStyles = {
  default: 'bg-navy-50 text-navy',
  warning: 'bg-warning-bg text-warning',
  error: 'bg-error-bg text-error',
  info: 'bg-action-light text-action',
};

export function MetricCard({ label, value, icon, breakdown, format, variant = 'default', onClick }: MetricCardProps) {
  const displayValue = typeof value === 'number' ? (format ? format(value) : value.toLocaleString('id-ID')) : value;
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`text-left bg-surface border border-line rounded-lg shadow-card p-5 transition-all duration-150
        ${onClick ? 'hover:shadow-elevated hover:border-line-strong cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-md ${iconBgStyles[variant]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-ink-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${variantStyles[variant]}`}>{displayValue}</p>
      {breakdown && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line">
          <span className="text-xs text-ink-muted flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-navy-200" /> SD {format ? format(breakdown.SD) : breakdown.SD}
          </span>
          <span className="text-xs text-ink-muted flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-navy-300" /> SMP {format ? format(breakdown.SMP) : breakdown.SMP}
          </span>
          <span className="text-xs text-ink-muted flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-navy-400" /> SMA {format ? format(breakdown.SMA) : breakdown.SMA}
          </span>
        </div>
      )}
    </button>
  );
}
