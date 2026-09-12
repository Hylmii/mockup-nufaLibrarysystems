import { useState } from 'react';
import {
  BookOpen, Library, Users, ArrowLeftRight, AlertTriangle, ClipboardList,
  Download, ChevronRight, Clock, TrendingDown, Info, FileText,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { LineChart, BarChartH, DonutChart } from '@/components/Charts';
import { Drawer } from '@/components/ui/Drawer';
import {
  YAYASAN_METRICS, ANGGOTA_BREAKDOWN, DIPINJAM_BREAKDOWN, TERLAMBU_BREAKDOWN,
  SELISIH_BREAKDOWN, ATTENTION_ITEMS, TREND_PINJAMAN, AKTIVITAS_UNIT,
  CATEGORY_COMPOSITION,
} from '@/lib/data';
import { formatNumber, formatDateTime } from '@/lib/format';
import type { Role, Unit, AttentionItem } from '@/types';

interface YayasanDashboardProps {
  role: Role;
  activeUnit: Unit;
  route: string;
  navigate: (path: string) => void;
  onChangeRole: (r: Role) => void;
  onLogout: () => void;
  notify: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export function YayasanDashboard({
  role, activeUnit, route, navigate, onChangeRole, onLogout, notify,
}: YayasanDashboardProps) {
  const [unitFilter, setUnitFilter] = useState<string>('SEMUA');
  const [period, setPeriod] = useState('bulan-ini');
  const [drawerItem, setDrawerItem] = useState<AttentionItem | null>(null);
  const now = new Date();

  const handleExport = () => {
    notify('success', 'Laporan diekspor', 'Ringkasan Yayasan telah diunduh dalam format PDF.');
  };

  const handleMetricClick = (label: string) => {
    notify('info', `${label}`, 'Membuka tampilan detail untuk metrik ini.');
  };

  const handleAttentionClick = (item: AttentionItem) => {
    setDrawerItem(item);
  };

  return (
    <AdminLayout
      role={role}
      activeUnit={activeUnit}
      route={route}
      navigate={navigate}
      onChangeRole={onChangeRole}
      onLogout={onLogout}
      pageTitle="Ringkasan Yayasan"
      breadcrumbs={[{ label: 'Manajemen Yayasan' }, { label: 'Ringkasan' }]}
      pageActions={
        <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={handleExport} className="hidden sm:inline-flex">
          Ekspor Laporan
        </Button>
      }
    >
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-40">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: 'bulan-ini', label: 'Bulan Ini' },
                { value: 'bulan-lalu', label: 'Bulan Lalu' },
                { value: 'triwulan', label: 'Triwulan Ini' },
                { value: 'tahun', label: 'Tahun Ini' },
              ]}
            />
          </div>
          <div className="w-40">
            <Select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              options={[
                { value: 'SEMUA', label: 'Semua Unit' },
                { value: 'SD', label: 'SD' },
                { value: 'SMP', label: 'SMP' },
                { value: 'SMA', label: 'SMA' },
              ]}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Clock size={14} />
          <span>Diperbarui: {formatDateTime(now)}</span>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <MetricCard
          label="Total Judul"
          value={YAYASAN_METRICS.totalJudul}
          icon={<BookOpen size={20} />}
          onClick={() => handleMetricClick('Total Judul')}
        />
        <MetricCard
          label="Total Eksemplar"
          value={YAYASAN_METRICS.totalEksemplar}
          icon={<Library size={20} />}
          onClick={() => handleMetricClick('Total Eksemplar')}
        />
        <MetricCard
          label="Anggota Aktif"
          value={YAYASAN_METRICS.anggotaAktif}
          icon={<Users size={20} />}
          breakdown={ANGGOTA_BREAKDOWN}
          onClick={() => handleMetricClick('Anggota Aktif')}
        />
        <MetricCard
          label="Sedang Dipinjam"
          value={YAYASAN_METRICS.sedangDipinjam}
          icon={<ArrowLeftRight size={20} />}
          breakdown={DIPINJAM_BREAKDOWN}
          variant="info"
          onClick={() => handleMetricClick('Sedang Dipinjam')}
        />
        <MetricCard
          label="Terlambat"
          value={YAYASAN_METRICS.terlambat}
          icon={<AlertTriangle size={20} />}
          breakdown={TERLAMBU_BREAKDOWN}
          variant="warning"
          onClick={() => handleMetricClick('Terlambat')}
        />
        <MetricCard
          label="Selisih Stock Opname"
          value={YAYASAN_METRICS.selisihStockOpname}
          icon={<ClipboardList size={20} />}
          breakdown={SELISIH_BREAKDOWN}
          variant="error"
          onClick={() => handleMetricClick('Selisih Stock Opname')}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Tren Peminjaman"
            subtitle="9 bulan terakhir — semua unit"
            icon={<TrendingDown size={18} />}
            action={<Badge variant="info">Sep: {formatNumber(YAYASAN_METRICS.sedangDipinjam)} aktif</Badge>}
          />
          <LineChart data={TREND_PINJAMAN} />
          <p className="text-sm text-ink-muted mt-3 pt-3 border-t border-line">
            Peminjaman mencapai puncak di bulan Juli (420 transaksi) dan menurun pada September dengan 326 transaksi aktif.
            Tren menunjukkan penurunan musiman setelah periode ujian.
          </p>
        </Card>

        <Card>
          <CardHeader title="Komposisi Koleksi" subtitle="Berdasarkan kategori" />
          <DonutChart data={CATEGORY_COMPOSITION} />
        </Card>
      </div>

      {/* Activity + attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Aktivitas per Unit"
            subtitle="Peminjaman, pengembalian, dan reservasi bulan ini"
          />
          <BarChartH data={AKTIVITAS_UNIT} />
        </Card>

        <Card>
          <CardHeader title="Perlu Perhatian" subtitle="Item yang memerlukan tindakan" />
          <ul className="space-y-2">
            {ATTENTION_ITEMS.map((item) => {
              const icon = item.severity === 'warning'
                ? <AlertTriangle size={16} />
                : item.severity === 'error'
                ? <AlertTriangle size={16} />
                : <Info size={16} />;
              const color = item.severity === 'warning' ? 'text-warning' : item.severity === 'error' ? 'text-error' : 'text-action';
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleAttentionClick(item)}
                    className="w-full flex items-start gap-3 p-3 rounded-md border border-line hover:border-line-strong hover:bg-canvas/50 transition-all text-left"
                  >
                    <span className={`${color} flex-shrink-0 mt-0.5`}>{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink">{item.text}</p>
                      {item.unit && (
                        <Badge variant="navy" size="sm" className="mt-1">Unit {item.unit}</Badge>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-ink-muted flex-shrink-0 mt-0.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Recent summary */}
      <Card className="mb-6">
        <CardHeader
          title="Ringkasan Laporan Terbaru"
          subtitle="Aktivitas signifikan dalam 24 jam terakhir"
          icon={<FileText size={18} />}
          action={
            <Button variant="ghost" size="sm" iconRight={<ChevronRight size={16} />} onClick={() => navigate('/yayasan/laporan')}>
              Lihat Semua
            </Button>
          }
        />
        <div className="space-y-2">
          {[
            { label: 'Stock opname Unit SMP', value: '78% selesai, 5 selisih ditemukan', status: 'warning' as const },
            { label: 'Pengadaan koleksi Biologi SMA', value: '15 eksemplar baru ditambahkan', status: 'success' as const },
            { label: 'Import anggota SD', value: '3 baris memerlukan koreksi data', status: 'warning' as const },
            { label: 'Peminjaman terlambat', value: '18 peminjaman melewati jatuh tempo', status: 'error' as const },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-line/50 last:border-0">
              <div className="flex items-center gap-3">
                <Badge variant={row.status === 'success' ? 'success' : row.status === 'warning' ? 'warning' : 'error'} size="sm">{row.status === 'success' ? 'Selesai' : row.status === 'warning' ? 'Perhatian' : 'Urgent'}</Badge>
                <span className="text-sm font-medium text-ink">{row.label}</span>
              </div>
              <span className="text-sm text-ink-muted">{row.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-md bg-canvas border border-line">
        <Info size={16} className="text-ink-muted flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-muted">
          Data simulasi untuk keperluan mockup — bukan data aktual SIT Nurul Fajri.
        </p>
      </div>

      {/* Attention detail drawer */}
      <Drawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Detail Perhatian"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerItem(null)}>Tutup</Button>
            <Button onClick={() => { setDrawerItem(null); notify('info', 'Tindakan dijalankan', 'Mengarahkan ke modul terkait untuk penyelesaian.'); }}>
              Tindak Lanjuti
            </Button>
          </>
        }
      >
        {drawerItem && (
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-4 rounded-md ${
              drawerItem.severity === 'warning' ? 'bg-warning-bg border border-warning-border' :
              drawerItem.severity === 'error' ? 'bg-error-bg border border-error-border' :
              'bg-action-light border border-action/30'
            }`}>
              {drawerItem.severity === 'info' ? <Info size={20} className="text-action mt-0.5" /> : <AlertTriangle size={20} className={drawerItem.severity === 'error' ? 'text-error mt-0.5' : 'text-warning mt-0.5'} />}
              <div>
                <p className="text-sm font-medium text-ink">{drawerItem.text}</p>
                {drawerItem.unit && <p className="text-sm text-ink-muted mt-1">Unit: {drawerItem.unit}</p>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Rincian</h4>
              <p className="text-sm text-ink-muted">
                Item ini teridentifikasi dalam pemantauan operasional dan memerlukan tindakan dari pustakawan unit terkait.
                Klik "Tindak Lanjuti" untuk mengarahkan ke modul yang sesuai.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Rekomendasi</h4>
              <ul className="space-y-1.5 text-sm text-ink-muted">
                <li>• Verifikasi data terkait di modul sirkulasi atau stock opname</li>
                <li>• Koordinasikan dengan pustakawan unit untuk penyelesaian</li>
                <li>• Catat tindakan yang diambil untuk audit trail</li>
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}
