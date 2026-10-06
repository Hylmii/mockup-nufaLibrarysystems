import { forwardRef } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || `input-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 transition-all duration-150
              ${icon ? 'pl-10' : ''} ${iconRight ? 'pr-10' : ''}
              ${error ? 'border-error focus:shadow-error focus:border-error' : 'border-line focus:border-action focus:shadow-focus'}
              outline-none ${className}`}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-error flex items-center gap-1">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-ink-muted">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || `select-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-ink mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-ink transition-all duration-150 appearance-none bg-no-repeat
            border-line focus:border-action focus:shadow-focus outline-none
            ${error ? 'border-error' : ''} ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            paddingRight: '36px',
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
