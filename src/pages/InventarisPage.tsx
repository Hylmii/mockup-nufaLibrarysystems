import { useState } from 'react';
import {
  ClipboardList, ScanLine, Play, AlertTriangle, CheckCircle2, Package,
  XCircle, MapPin, Flag,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Input';
import { PUSTAKAWAN_TASKS, findBookByBarcode } from '@/lib/data';
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

interface ScanItem { barcode: string; title: string; status: 'sesuai' | 'selisih'; }

const DISCREPANCIES = [
  { barcode: 'BK-SMP-000156', title: 'Geografi Asia Tenggara', shelf: 'Rak B-04', reason: 'Tidak ditemukan di rak', severity: 'error' as const },
  { barcode: 'BK-SMP-000188', title: 'Kumpulan Puisi: Jejak Hujan', shelf: 'Rak B-05', reason: 'Salah rak — ditemukan di B-07', severity: 'warning' as const },
  { barcode: 'BK-SMP-000241', title: 'Fisika Dasar untuk SMP', shelf: 'Rak E-02', reason: 'Kondisi rusak, perlu perbaikan', severity: 'warning' as const },
  { barcode: 'BK-SMP-000119', title: 'Sejarah Kebudayaan Islam', shelf: 'Rak D-03', reason: 'Tidak ditemukan di rak', severity: 'error' as const },
  { barcode: 'BK-SMP-000305', title: 'Kamus Bahasa Inggris', shelf: 'Rak A-01', reason: 'Barcode tidak terbaca / rusak', severity: 'warning' as const },
];

export function InventarisPage({ role, activeUnit, route, navigate, onChangeRole, onLogout, notify }: AdminPageProps) {
  const op = PUSTAKAWAN_TASKS.stockOpname;
  const [startOpen, setStartOpen] = useState(() => route.includes('action=mulai'));
  const [sessionUnit, setSessionUnit] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [startUnit, setStartUnit] = useState('SMP');

  const startSession = (unit: string) => {
    setSessionUnit(unit);
    setScans([]);
    setStartOpen(false);
    notify('success', 'Stock opname dimulai', `Sesi opname Unit ${unit} aktif. Mulai pindai eksemplar.`);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = scanInput.trim();
    setScanInput('');
    if (!code) return;
    const book = findBookByBarcode(code);
    const item: ScanItem = book
      ? { barcode: code, title: book.title, status: 'sesuai' }
      : { barcode: code, title: 'Tidak dikenali', status: 'selisih' };
    setScans((prev) => [item, ...prev]);
    if (book) notify('success', 'Tercatat', book.title);
    else notify('warning', 'Selisih', `Barcode ${code} tidak dikenali.`);
  };

  const sesuaiCount = scans.filter((s) => s.status === 'sesuai').length;
  const selisihCount = scans.filter((s) => s.status === 'selisih').length;

  return (
    <AdminLayout
      role={role} activeUnit={activeUnit} route={route} navigate={navigate}
      onChangeRole={onChangeRole} onLogout={onLogout}
      pageTitle="Inventaris"
      breadcrumbs={[{ label: 'Pustakawan' }, { label: 'Inventaris' }]}
      pageActions={
        <Button size="sm" icon={<Play size={16} />} onClick={() => setStartOpen(true)} className="hidden sm:inline-flex">
          Mulai Stock Opname
        </Button>
      }
    >
      {!sessionUnit ? (
        <>
          {/* Status opname berjalan */}
          <Card className="mb-6">
            <CardHeader title="Stock Opname Berjalan" subtitle={`Unit ${op.unit}`} icon={<ClipboardList size={18} />}
              action={<Badge variant="warning" size="sm">{op.discrepancies} selisih</Badge>} />
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-ink-muted">Progres pemindaian</span>
              <span className="text-sm font-semibold text-ink">{op.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-canvas rounded-full overflow-hidden">
              <div className="h-full bg-action rounded-full transition-all" style={{ width: `${op.progress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-ink-muted">
              <span>{formatNumber(op.scanned)} dari {formatNumber(op.total)} eksemplar terpindai</span>
              <span>{formatNumber(op.total - op.scanned)} tersisa</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-line">
              <Button icon={<ScanLine size={16} />} onClick={() => startSession(op.unit)}>Lanjutkan Stock Opname</Button>
              <Button variant="secondary" icon={<Play size={16} />} onClick={() => setStartOpen(true)}>Mulai Sesi Baru</Button>
            </div>
          </Card>

          {/* Ringkasan inventaris per unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <UnitInv unit="SD" total={4380} opname="Selesai 12 Sep" selisih={1} />
            <UnitInv unit="SMP" total={3420} opname={`${op.progress}% berjalan`} selisih={op.discrepancies} active />
            <UnitInv unit="SMA" total={3460} opname="Terjadwal 20 Sep" selisih={0} />
          </div>

          {/* Selisih */}
          <DiscrepancyTable notify={notify} />
        </>
      ) : (
        <>
          {/* Sesi opname aktif */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card className="lg:col-span-2">
              <CardHeader title={`Sesi Opname — Unit ${sessionUnit}`} subtitle="Pindai barcode tiap eksemplar di rak" icon={<ScanLine size={18} />}
                action={<Button variant="secondary" size="sm" onClick={() => { setSessionUnit(null); notify('info', 'Sesi dijeda', 'Progres tersimpan.'); }}>Akhiri Sesi</Button>} />
              <form onSubmit={handleScan}>
                <div className="relative">
                  <ScanLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-action pointer-events-none" />
                  <input
                    autoFocus
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scan / ketik barcode eksemplar, tekan Enter"
                    className="w-full rounded-md border-2 border-action/40 bg-surface pl-11 pr-3 py-3.5 text-base text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
                  />
                </div>
              </form>
              {scans.length > 0 ? (
                <ul className="mt-4 space-y-1.5 max-h-72 overflow-y-auto">
                  {scans.map((s, i) => (
                    <li key={`${s.barcode}-${i}`} className="flex items-center gap-3 p-2.5 rounded-md border border-line/60">
                      {s.status === 'sesuai'
                        ? <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                        : <XCircle size={16} className="text-error flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-ink truncate">{s.title}</p>
                        <p className="text-xs text-ink-muted font-mono">{s.barcode}</p>
                      </div>
                      {s.status === 'sesuai'
                        ? <Badge variant="success" size="sm">Sesuai</Badge>
                        : <Badge variant="error" size="sm">Selisih</Badge>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 flex flex-col items-center py-8 text-center border border-dashed border-line rounded-md">
                  <ScanLine size={28} className="text-ink-muted/40 mb-2" />
                  <p className="text-sm text-ink-muted">Belum ada eksemplar dipindai</p>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader title="Ringkasan Sesi" icon={<Package size={18} />} />
              <div className="space-y-3">
                <SessionStat label="Terpindai sesi ini" value={scans.length} tone="default" />
                <SessionStat label="Sesuai" value={sesuaiCount} tone="success" />
                <SessionStat label="Selisih" value={selisihCount} tone="error" />
              </div>
              <Button fullWidth className="mt-4" icon={<Flag size={16} />}
                onClick={() => { notify('success', 'Opname disimpan', `Sesi Unit ${sessionUnit}: ${scans.length} eksemplar, ${selisihCount} selisih.`); setSessionUnit(null); }}>
                Selesaikan Opname
              </Button>
            </Card>
          </div>
          <DiscrepancyTable notify={notify} />
        </>
      )}

      {/* Dialog Mulai */}
      <Dialog
        open={startOpen}
        onClose={() => setStartOpen(false)}
        title="Mulai Stock Opname"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStartOpen(false)}>Batal</Button>
            <Button icon={<Play size={16} />} onClick={() => startSession(startUnit)}>Mulai Sesi</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">Pilih unit yang akan diperiksa. Sistem akan memandu pemindaian barcode setiap eksemplar di rak.</p>
          <Select label="Unit" value={startUnit} onChange={(e) => setStartUnit(e.target.value)}
            options={[{ value: 'SD', label: 'Unit SD' }, { value: 'SMP', label: 'Unit SMP' }, { value: 'SMA', label: 'Unit SMA' }]} />
          <div className="flex items-start gap-2 p-3 rounded-md bg-action-light border border-action/30 text-sm text-action">
            <ClipboardList size={16} className="flex-shrink-0 mt-0.5" />
            <span>Pastikan seluruh buku yang sedang dipinjam sudah tercatat agar selisih akurat.</span>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
}

function UnitInv({ unit, total, opname, selisih, active }: { unit: string; total: number; opname: string; selisih: number; active?: boolean }) {
  return (
    <Card padding="sm" className={active ? 'border-action/40' : ''}>
      <div className="flex items-center justify-between mb-2">
        <Badge variant="navy" size="sm">Unit {unit}</Badge>
        {selisih > 0 ? <Badge variant="warning" size="sm">{selisih} selisih</Badge> : <Badge variant="success" size="sm">Cocok</Badge>}
      </div>
      <p className="text-lg font-bold text-ink">{formatNumber(total)}</p>
      <p className="text-xs text-ink-muted">eksemplar · {opname}</p>
    </Card>
  );
}

function SessionStat({ label, value, tone }: { label: string; value: number; tone: 'default' | 'success' | 'error' }) {
  const cls = tone === 'success' ? 'text-success' : tone === 'error' ? 'text-error' : 'text-ink';
  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-canvas/50 border border-line/60">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className={`text-lg font-bold ${cls}`}>{value}</span>
    </div>
  );
}

function DiscrepancyTable({ notify }: { notify: Notify }) {
  return (
    <Card padding="none">
      <div className="p-5 pb-0">
        <CardHeader title="Selisih Ditemukan" subtitle="Perlu ditindaklanjuti pustakawan unit" icon={<AlertTriangle size={18} />} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-5">Barcode</th>
              <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Judul</th>
              <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Lokasi</th>
              <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Keterangan</th>
              <th className="text-right text-xs font-semibold text-ink-muted uppercase py-3 px-5">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {DISCREPANCIES.map((d) => (
              <tr key={d.barcode} className="border-b border-line/40 last:border-0 hover:bg-canvas/40">
                <td className="py-3 px-5 text-sm text-ink-muted font-mono">{d.barcode}</td>
                <td className="py-3 px-3 text-sm text-ink">{d.title}</td>
                <td className="py-3 px-3 text-sm text-ink-muted"><span className="inline-flex items-center gap-1"><MapPin size={13} /> {d.shelf}</span></td>
                <td className="py-3 px-3">
                  <Badge variant={d.severity === 'error' ? 'error' : 'warning'} size="sm">{d.reason}</Badge>
                </td>
                <td className="py-3 px-5 text-right">
                  <button onClick={() => notify('info', 'Tindak lanjut', `${d.title}: ${d.reason} (simulasi).`)}
                    className="text-xs text-action hover:underline font-medium">Selesaikan</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
