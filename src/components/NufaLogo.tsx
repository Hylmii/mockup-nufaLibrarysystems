interface NufaLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'full' | 'icon';
}

export function NufaLogo({ size = 36, className = '', showText = true, variant = 'full' }: NufaLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/images/logo-nufa.jpeg"
        alt="Logo SIT Nurul Fajri"
        width={size}
        height={size}
        className="rounded-full bg-white object-cover flex-shrink-0 ring-1 ring-black/5"
        style={{ width: size, height: size }}
      />
      {showText && variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold text-brand-green-dark tracking-tight">
            SIT Nurul Fajri
          </span>
          <span className="text-[11px] font-medium text-ink-muted mt-1">
            Perpustakaan Terpadu
          </span>
        </div>
      )}
    </div>
  );
}
