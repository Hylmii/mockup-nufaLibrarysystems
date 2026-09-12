interface BookCoverProps {
  hue: number;
  title: string;
  author?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: { w: 48, h: 64, text: 'text-[8px]', title: 'text-[9px]', pad: 'p-1.5' },
  sm: { w: 72, h: 100, text: 'text-[10px]', title: 'text-xs', pad: 'p-2' },
  md: { w: 120, h: 170, text: 'text-xs', title: 'text-sm', pad: 'p-3' },
  lg: { w: 180, h: 250, text: 'text-sm', title: 'text-base', pad: 'p-4' },
};

export function BookCover({ hue, title, author, size = 'md', className = '' }: BookCoverProps) {
  const s = sizes[size];
  return (
    <div
      className={`flex flex-col justify-between rounded-md shadow-card overflow-hidden ${s.pad} flex-shrink-0 ${className}`}
      style={{
        width: s.w,
        height: s.h,
        background: `linear-gradient(145deg, hsl(${hue}, 35%, 32%), hsl(${hue}, 40%, 22%))`,
      }}
    >
      <div>
        <div className="w-full h-px bg-white/20 mb-1.5" />
        <p className={`font-semibold text-white leading-tight line-clamp-3 ${s.title}`}>{title}</p>
      </div>
      <div>
        {author && <p className={`text-white/60 leading-tight line-clamp-1 ${s.text}`}>{author}</p>}
        <div className="w-full h-px bg-white/20 mt-1" />
      </div>
    </div>
  );
}
