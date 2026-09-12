import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-action text-white hover:bg-action-hover shadow-subtle border border-action',
  secondary:
    'bg-surface text-navy border border-line hover:bg-canvas hover:border-line-strong shadow-subtle',
  ghost:
    'bg-transparent text-ink hover:bg-canvas border border-transparent',
  danger:
    'bg-error text-white hover:bg-error/90 border border-error shadow-subtle',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-3 gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconRight, fullWidth, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    );
  },
);
Button.displayName = 'Button';
