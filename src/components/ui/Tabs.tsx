
export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-1 border-b border-line ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150 rounded-t-md
            ${active === tab.id
              ? 'text-action'
              : 'text-ink-muted hover:text-ink hover:bg-canvas/50'}`}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className={`inline-flex items-center justify-center text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px]
              ${active === tab.id ? 'bg-action text-white' : 'bg-line text-ink-muted'}`}>
              {tab.badge}
            </span>
          )}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-action rounded-t-sm" />
          )}
        </button>
      ))}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-150
        ${active
          ? 'bg-navy text-white border-navy'
          : 'bg-surface text-ink border-line hover:border-navy-200 hover:bg-canvas'}`}
    >
      {label}
    </button>
  );
}
