interface LineChartProps {
  data: { month: string; value: number }[];
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 180, color = '#15803D' }: LineChartProps) {
  const width = 560;
  const padding = { top: 20, right: 16, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value)) * 1.1;
  const minVal = 0;
  const range = maxVal - minVal;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxVal / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Grafik tren peminjaman">
      <defs>
        <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {tickValues.map((tv, i) => {
        const y = padding.top + chartH - (tv / maxVal) * chartH;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#D9E2EC" strokeWidth="1" strokeDasharray="3 3" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748B">
              {tv}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#lineArea)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
          <text x={p.x} y={height - 10} textAnchor="middle" fontSize="11" fill="#64748B">
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface BarChartHProps {
  data: { unit: string; peminjaman: number; pengembalian: number; reservasi: number }[];
}

export function BarChartH({ data }: BarChartHProps) {
  const maxVal = Math.max(...data.flatMap((d) => [d.peminjaman, d.pengembalian, d.reservasi])) * 1.15;
  const colors = { peminjaman: '#15803D', pengembalian: '#0E7490', reservasi: '#A15C00' };

  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.unit} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Unit {d.unit}</span>
            <span className="text-xs text-ink-muted">
              {d.peminjaman + d.pengembalian + d.reservasi} transaksi
            </span>
          </div>
          {(['peminjaman', 'pengembalian', 'reservasi'] as const).map((key) => {
            const labels = { peminjaman: 'Peminjaman', pengembalian: 'Pengembalian', reservasi: 'Reservasi' };
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-ink-muted w-24 flex-shrink-0">{labels[key]}</span>
                <div className="flex-1 bg-canvas rounded h-5 overflow-hidden">
                  <div
                    className="h-full rounded flex items-center justify-end px-1.5 transition-all duration-300"
                    style={{ width: `${(d[key] / maxVal) * 100}%`, backgroundColor: colors[key], minWidth: '28px' }}
                  >
                    <span className="text-[10px] font-semibold text-white">{d[key]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-4 pt-2 border-t border-line">
        {(['peminjaman', 'pengembalian', 'reservasi'] as const).map((key) => {
          const labels = { peminjaman: 'Peminjaman', pengembalian: 'Pengembalian', reservasi: 'Reservasi' };
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: colors[key] }} />
              <span className="text-xs text-ink-muted">{labels[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: { category: string; count: number; pct: number }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const colors = ['#136535', '#23A958', '#0E7490', '#A15C00', '#B42318', '#64748B'];
  const radius = 60;
  const strokeW = 22;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
        <g transform="translate(80, 80) rotate(-90)">
          {data.map((d, i) => {
            const dash = (d.pct / 100) * circumference;
            const segment = (
              <circle
                key={i}
                r={radius}
                cx={0}
                cy={0}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth={strokeW}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return segment;
          })}
        </g>
        <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1F2937">
          8.420
        </text>
        <text x="80" y="94" textAnchor="middle" fontSize="11" fill="#64748B">
          Total Judul
        </text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="inline-block w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-ink flex-1 truncate">{d.category}</span>
            <span className="text-ink-muted text-xs font-medium">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
