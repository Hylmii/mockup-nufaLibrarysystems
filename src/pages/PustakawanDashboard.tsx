import {
  BookCheck, BookPlus, UserPlus, ClipboardList, Upload,
  ArrowLeftRight, Clock, AlertTriangle, Bookmark, Package, FileWarning,
  ChevronRight, Activity,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ACTIVITY_ITEMS, PUSTAKAWAN_TASKS } from '@/lib/data';
import { relativeTime, formatDateShort, formatNumber } from '@/lib/format';
import type { Role, Unit } from '@/types';

interface PustakawanDashboardProps {
  role: Role;
  activeUnit: Unit;
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  notify: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

const activityIcons: Record<string, React.ReactNode> = {
  peminjaman: <ArrowLeftRight size={16} />,
  pengembalian: <BookCheck size={16} />,
  reservasi: <Bookmark size={16} />,
  pengadaan: <Package size={16} />,
  anggota: <UserPlus size={16} />,
  'stock-opname': <ClipboardList size={16} />,
};

const activityColors: Record<string, string> = {
  peminjaman: 'text-action bg-action-light',
  pengembalian: 'text-success bg-success-bg',
  reservasi: 'text-warning bg-warning-bg',
  pengadaan: 'text-navy bg-navy-50',
  anggota: 'text-action bg-action-light',
  'stock-opname': 'text-error bg-error-bg',
};

export function PustakawanDashboard({
  role, activeUnit, route, navigate, onLogout,
}: PustakawanDashboardProps) {
  const today = new Date();
  const tasks = PUSTAKAWAN_TASKS;

  const quickActions = [
    { label: 'Mulai Peminjaman', icon: <ArrowLeftRight size={20} />, path: '/sirkulasi', variant: 'primary' as const },
    { label: 'Proses Pengembalian', icon: <BookCheck size={20} />, path: '/sirkulasi', variant: 'secondary' as const },
    { label: 'Tambah Buku', icon: <BookPlus size={20} />, path: '/pustakawan/koleksi?action=tambah', variant: 'secondary' as const },
    { label: 'Daftarkan Anggota', icon: <UserPlus size={20} />, path: '/pustakawan/anggota?action=daftar', variant: 'secondary' as const },
    { label: 'Mulai Stock Opname', icon: <ClipboardList size={20} />, path: '/pustakawan/inventaris?action=mulai', variant: 'secondary' as const },
    { label: 'Import Data', icon: <Upload size={20} />, path: '/pustakawan/administrasi?action=import', variant: 'secondary' as const },
  ];

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <AdminLayout
      role={role}
      activeUnit={activeUnit}
      route={route}
      navigate={navigate}
      onLogout={onLogout}
      pageTitle="Beranda Pustakawan"
      breadcrumbs={[{ label: 'Pustakawan' }, { label: 'Beranda' }]}
    >
      {/* Greeting + context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-ink">Selamat datang, Sri Mulyani</h2>
            <Badge variant="navy" size="md">Unit {activeUnit}</Badge>
          </div>
          <p className="text-sm text-ink-muted">
            {today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {formatNumber(tasks.dueToday.length)} peminjaman jatuh tempo hari ini
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.path)}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-lg border transition-all duration-150 ${
              action.variant === 'primary'
                ? 'bg-action text-white border-action hover:bg-action-hover shadow-subtle'
                : 'bg-surface text-ink border-line hover:border-line-strong hover:shadow-card'
            }`}
          >
            <span className={action.variant === 'primary' ? 'text-white' : 'text-navy'}>{action.icon}</span>
            <span className="text-sm font-medium text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Today's summary + queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Today's transactions */}
        <Card>
          <CardHeader title="Transaksi Hari Ini" subtitle={`Unit ${activeUnit}`} icon={<Activity size={18} />} />
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
              <div className="flex items-center gap-2 mb-1">
                <ArrowLeftRight size={16} className="text-action" />
                <span className="text-xs text-ink-muted">Peminjaman</span>
              </div>
              <p className="text-xl font-bold text-ink">14</p>
            </div>
            <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
              <div className="flex items-center gap-2 mb-1">
                <BookCheck size={16} className="text-success" />
                <span className="text-xs text-ink-muted">Pengembalian</span>
              </div>
              <p className="text-xl font-bold text-ink">9</p>
            </div>
            <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
              <div className="flex items-center gap-2 mb-1">
                <Bookmark size={16} className="text-warning" />
                <span className="text-xs text-ink-muted">Reservasi</span>
              </div>
              <p className="text-xl font-bold text-ink">3</p>
            </div>
            <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={16} className="text-navy" />
                <span className="text-xs text-ink-muted">Anggota Baru</span>
              </div>
              <p className="text-xl font-bold text-ink">2</p>
            </div>
          </div>
        </Card>

        {/* Due today */}
        <Card>
          <CardHeader
            title="Jatuh Tempo Hari Ini"
            subtitle={`${tasks.dueToday.length} peminjaman`}
            icon={<Clock size={18} />}
            action={<Badge variant="warning" size="sm">{tasks.dueToday.length}</Badge>}
          />
          <ul className="space-y-2">
            {tasks.dueToday.map((item, i) => (
              <li key={i} className="flex items-center justify-between p-2.5 rounded-md border border-line/60 hover:bg-canvas/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                  <p className="text-xs text-ink-muted">{item.member} · {item.memberId}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-xs text-ink-muted">{formatDateShort(item.dueDate)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Overdue */}
        <Card>
          <CardHeader
            title="Terlambat Aktif"
            subtitle={`${tasks.overdue.length} peminjaman`}
            icon={<AlertTriangle size={18} />}
            action={<Badge variant="error" size="sm">{tasks.overdue.length}</Badge>}
          />
          <ul className="space-y-2">
            {tasks.overdue.map((item, i) => (
              <li key={i} className="flex items-center justify-between p-2.5 rounded-md border border-error-border/40 bg-error-bg/30">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                  <p className="text-xs text-ink-muted">{item.member} · {item.memberId}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <Badge variant="error" size="sm">{item.daysLate} hari</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Reservations + Stock Opname + Import */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Reservations */}
        <Card>
          <CardHeader
            title="Reservasi Siap Diproses"
            icon={<Bookmark size={18} />}
            action={<Badge variant="info" size="sm">{tasks.reservations.length}</Badge>}
          />
          <ul className="space-y-2">
            {tasks.reservations.map((r, i) => (
              <li key={i} className="flex items-center justify-between p-2.5 rounded-md border border-line/60">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{r.title}</p>
                  <p className="text-xs text-ink-muted">{r.member} · {r.memberId}</p>
                </div>
                <Badge variant={r.status === 'Siap Diambil' ? 'success' : 'neutral'} size="sm" className="ml-2 flex-shrink-0">
                  {r.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        {/* Stock opname progress */}
        <Card>
          <CardHeader
            title="Stock Opname Aktif"
            subtitle={`Unit ${tasks.stockOpname.unit}`}
            icon={<ClipboardList size={18} />}
          />
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-ink-muted">Progres</span>
                <span className="text-sm font-semibold text-ink">{tasks.stockOpname.progress}%</span>
              </div>
              <div className="w-full h-2 bg-canvas rounded-full overflow-hidden">
                <div className="h-full bg-action rounded-full transition-all duration-300" style={{ width: `${tasks.stockOpname.progress}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-ink-muted">
                  {formatNumber(tasks.stockOpname.scanned)} / {formatNumber(tasks.stockOpname.total)} eksemplar
                </span>
                {tasks.stockOpname.discrepancies > 0 && (
                  <Badge variant="warning" size="sm">{tasks.stockOpname.discrepancies} selisih</Badge>
                )}
              </div>
            </div>
            <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/pustakawan/inventaris')}>
              Lanjutkan Stock Opname
            </Button>
          </div>
        </Card>

        {/* Import issues */}
        <Card>
          <CardHeader
            title="Import Perlu Koreksi"
            icon={<FileWarning size={18} />}
            action={<Badge variant="warning" size="sm">{tasks.importIssues.length}</Badge>}
          />
          <ul className="space-y-2">
            {tasks.importIssues.map((imp, i) => (
              <li key={i} className="p-3 rounded-md border border-warning-border/40 bg-warning-bg/30">
                <p className="text-sm font-medium text-ink truncate">{imp.fileName}</p>
                <p className="text-xs text-ink-muted mt-1">{imp.issue}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="warning" size="sm">{imp.rows} baris</Badge>
                  <button
                    onClick={() => navigate('/pustakawan/administrasi?action=import')}
                    className="text-xs text-action hover:underline font-medium"
                  >
                    Perbaiki
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader
          title="Aktivitas Terbaru"
          subtitle="Catatan operasional hari ini"
          icon={<Activity size={18} />}
          action={
            <Button variant="ghost" size="sm" iconRight={<ChevronRight size={16} />} onClick={() => navigate('/pustakawan/laporan')}>
              Lihat Semua
            </Button>
          }
        />
        <ul className="space-y-1">
          {ACTIVITY_ITEMS.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5 border-b border-line/40 last:border-0">
              <span className={`flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0 ${activityColors[item.type]}`}>
                {activityIcons[item.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">{item.description}</p>
                <p className="text-xs text-ink-muted">{item.actor} · {relativeTime(item.time)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </AdminLayout>
  );
}
