import { useState } from 'react';
import {
  BarChart3, Download, ArrowLeftRight, BookCheck, Users, AlertTriangle, TrendingUp, Trophy,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { LineChart, BarChartH, DonutChart } from '@/components/Charts';
import { BookCover } from '@/components/BookCover';
import { TREND_PINJAMAN, AKTIVITAS_UNIT, CATEGORY_COMPOSITION, BOOKS } from '@/lib/data';
import { formatNumber } from '@/lib/format';
import type { Role, Unit } from '@/types';

type Notify = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;

interface AdminPageProps {
  role: Role;
  activeUnit: Unit;
  route: string;
  navigate: (path: string) => void;
  onChangeRole: (r: Role) => void;
  onLogout: () => void;
  notify: Notify;
}

const TOP_BOOKS = [
  { book: BOOKS[0], count: 42 },
  { book: BOOKS[5], count: 38 },
  { book: BOOKS[2], count: 31 },
  { book: BOOKS[3], count: 27 },
  { book: BOOKS[1], count: 24 },
];

export function LaporanPage({ role, activeUnit, route, navigate, onChangeRole, onLogout, notify }: AdminPageProps) {
  const [period, setPeriod] = useState('bulan-ini');
  const [unit, setUnit] = useState('SEMUA');

  const handleExport = (fmt: string) =>
    notify('success', 'Laporan diekspor', `Laporan periode terpilih diunduh dalam format ${fmt} (simulasi).`);

  const maxTop = TOP_BOOKS[0].count;

  return (
    <AdminLayout
      role={role} activeUnit={activeUnit} route={route} navigate={navigate}
      onChangeRole={onChangeRole} onLogout={onLogout}
      pageTitle="Laporan"
      breadcrumbs={[{ label: 'Pustakawan' }, { label: 'Laporan' }]}
      pageActions={
        <Button size="sm" variant="secondary" icon={<Download size={16} />} onClick={() => handleExport('PDF')} className="hidden sm:inline-flex">
          Ekspor PDF
        </Button>
      }
    >
      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="w-full sm:w-44">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}
            options={[{ value: 'bulan-ini', label: 'Bulan Ini' }, { value: 'bulan-lalu', label: 'Bulan Lalu' }, { value: 'triwulan', label: 'Triwulan Ini' }, { value: 'tahun', label: 'Tahun Ini' }]} />
        </div>
        <div className="w-full sm:w-36">
          <Select value={unit} onChange={(e) => setUnit(e.target.value)}
            options={[{ value: 'SEMUA', label: 'Semua Unit' }, { value: 'SD', label: 'SD' }, { value: 'SMP', label: 'SMP' }, { value: 'SMA', label: 'SMA' }]} />
        </div>
        <div className="sm:ml-auto flex gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={() => handleExport('Excel')}>Excel</Button>
          <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={() => handleExport('PDF')}>PDF</Button>
        </div>
      </div>

      {/* Metrik ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<ArrowLeftRight size={18} />} label="Peminjaman" value={326} sub="+8% vs bln lalu" tone="default" />
        <StatCard icon={<BookCheck size={18} />} label="Pengembalian" value={298} sub="91% tepat waktu" tone="success" />
        <StatCard icon={<Users size={18} />} label="Anggota Aktif" value={1846} sub="+34 baru" tone="default" />
        <StatCard icon={<AlertTriangle size={18} />} label="Keterlambatan" value={18} sub="5,5% dari pinjaman" tone="warning" />
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Tren Peminjaman" subtitle="9 bulan terakhir" icon={<TrendingUp size={18} />} />
          <LineChart data={TREND_PINJAMAN} />
        </Card>
        <Card>
          <CardHeader title="Komposisi Koleksi" subtitle="Berdasarkan kategori" />
          <DonutChart data={CATEGORY_COMPOSITION} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Aktivitas per Unit" subtitle="Peminjaman, pengembalian, reservasi" icon={<BarChart3 size={18} />} />
          <BarChartH data={AKTIVITAS_UNIT} />
        </Card>

        {/* Buku terpopuler */}
        <Card>
          <CardHeader title="Buku Terpopuler" subtitle="Paling banyak dipinjam" icon={<Trophy size={18} />} />
          <ul className="space-y-3">
            {TOP_BOOKS.map(({ book, count }, i) => (
              <li key={book.id} className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-warning text-white' : 'bg-navy-50 text-navy'}`}>{i + 1}</span>
                <BookCover hue={book.coverHue} title={book.title} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{book.title}</p>
                  <div className="mt-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                    <div className="h-full bg-action rounded-full" style={{ width: `${(count / maxTop) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-ink flex-shrink-0">{count}x</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Daftar laporan siap unduh */}
      <Card>
        <CardHeader title="Laporan Tersedia" subtitle="Unduh laporan terformat" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {['Rekap Sirkulasi Bulanan', 'Daftar Keterlambatan & Denda', 'Statistik Koleksi per Kategori', 'Aktivitas Anggota per Unit'].map((r) => (
            <div key={r} className="flex items-center justify-between p-3 rounded-md border border-line hover:bg-canvas/40 transition-colors">
              <span className="text-sm text-ink">{r}</span>
              <button onClick={() => handleExport('PDF')} className="inline-flex items-center gap-1.5 text-xs text-action hover:underline font-medium">
                <Download size={14} /> Unduh
              </button>
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: number; sub: string; tone: 'default' | 'success' | 'warning' }) {
  const toneCls = tone === 'success' ? 'text-success bg-success-bg' : tone === 'warning' ? 'text-warning bg-warning-bg' : 'text-navy bg-navy-50';
  return (
    <Card padding="sm">
      <div className="flex items-start justify-between mb-2">
        <span className={`flex items-center justify-center w-10 h-10 rounded-md ${toneCls}`}>{icon}</span>
      </div>
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="text-2xl font-bold text-ink">{formatNumber(value)}</p>
      <p className="text-xs text-ink-muted mt-0.5">{sub}</p>
    </Card>
  );
}
