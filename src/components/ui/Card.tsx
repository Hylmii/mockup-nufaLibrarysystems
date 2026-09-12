interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div className={`bg-surface border border-line rounded-lg shadow-card ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-start gap-2.5">
        {icon && <span className="flex-shrink-0 mt-0.5 text-navy">{icon}</span>}
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
