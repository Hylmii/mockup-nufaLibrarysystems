import { useState, useMemo } from 'react';
import {
  ShoppingCart, Plus, Wallet, CheckCircle2, Package, FileText, Clock,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select } from '@/components/ui/Input';
import { formatRupiah, formatNumber, formatDateShort } from '@/lib/format';
import type { Role, Unit } from '@/types';

type Notify = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;

interface AdminPageProps {
  role: Role;
  activeUnit: Unit;
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  notify: Notify;
}

type Status = 'diajukan' | 'disetujui' | 'dipesan' | 'diterima';

interface Procurement {
  id: string; title: string; unit: string; qty: number; estimasi: number; status: Status; date: string;
}

const PROCUREMENTS: Procurement[] = [
  { id: 'PGD-2024-018', title: 'Ensiklopedia Sains Anak', unit: 'SD', qty: 15, estimasi: 2250000, status: 'diterima', date: '2024-08-20' },
  { id: 'PGD-2024-021', title: 'Novel Sastra Indonesia Pilihan', unit: 'SMA', qty: 20, estimasi: 3000000, status: 'dipesan', date: '2024-09-01' },
  { id: 'PGD-2024-023', title: 'Buku Matematika Olimpiade', unit: 'SMP', qty: 10, estimasi: 1800000, status: 'disetujui', date: '2024-09-05' },
  { id: 'PGD-2024-025', title: 'Atlas Dunia Edisi Terbaru', unit: 'SEMUA', qty: 8, estimasi: 1200000, status: 'diajukan', date: '2024-09-10' },
  { id: 'PGD-2024-026', title: 'Kamus Bahasa Arab Bergambar', unit: 'SMA', qty: 12, estimasi: 1560000, status: 'diajukan', date: '2024-09-11' },
];

const STATUS_META: Record<Status, { label: string; variant: 'neutral' | 'info' | 'warning' | 'success' }> = {
  diajukan: { label: 'Diajukan', variant: 'neutral' },
  disetujui: { label: 'Disetujui', variant: 'info' },
  dipesan: { label: 'Dipesan', variant: 'warning' },
  diterima: { label: 'Diterima', variant: 'success' },
};

const TOTAL_ANGGARAN = 25000000;

export function PengadaanPage({ role, activeUnit, route, navigate, onLogout, notify }: AdminPageProps) {
  const [addOpen, setAddOpen] = useState(() => route.includes('action=ajukan'));
  const [filter, setFilter] = useState<'SEMUA' | Status>('SEMUA');

  const terpakai = useMemo(() => PROCUREMENTS.filter((p) => p.status === 'diterima' || p.status === 'dipesan').reduce((s, p) => s + p.estimasi, 0), []);
  const sisa = TOTAL_ANGGARAN - terpakai;
  const pakaiPct = Math.round((terpakai / TOTAL_ANGGARAN) * 100);

  const counts = useMemo(() => ({
    diajukan: PROCUREMENTS.filter((p) => p.status === 'diajukan').length,
    disetujui: PROCUREMENTS.filter((p) => p.status === 'disetujui').length,
    dipesan: PROCUREMENTS.filter((p) => p.status === 'dipesan').length,
    diterima: PROCUREMENTS.filter((p) => p.status === 'diterima').length,
  }), []);

  const rows = filter === 'SEMUA' ? PROCUREMENTS : PROCUREMENTS.filter((p) => p.status === filter);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddOpen(false);
    notify('success', 'Usulan diajukan', 'Usulan pengadaan dikirim untuk persetujuan (simulasi).');
  };

  return (
    <AdminLayout
      role={role} activeUnit={activeUnit} route={route} navigate={navigate}
      onLogout={onLogout}
      pageTitle="Pengadaan"
      breadcrumbs={[{ label: 'Pustakawan' }, { label: 'Pengadaan' }]}
      pageActions={
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setAddOpen(true)} className="hidden sm:inline-flex">
          Ajukan Pengadaan
        </Button>
      }
    >
      {/* Anggaran */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Anggaran Pengadaan Tahun Ini" icon={<Wallet size={18} />}
            action={<Badge variant="info" size="sm">{pakaiPct}% terpakai</Badge>} />
          <div className="w-full h-2.5 bg-canvas rounded-full overflow-hidden">
            <div className="h-full bg-action rounded-full transition-all" style={{ width: `${pakaiPct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <BudgetStat label="Total Anggaran" value={TOTAL_ANGGARAN} />
            <BudgetStat label="Terpakai / Komit" value={terpakai} tone="warning" />
            <BudgetStat label="Sisa" value={sisa} tone="success" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Status Usulan" icon={<FileText size={18} />} />
          <div className="grid grid-cols-2 gap-2">
            <MiniStat icon={<Clock size={15} />} label="Diajukan" value={counts.diajukan} />
            <MiniStat icon={<CheckCircle2 size={15} />} label="Disetujui" value={counts.disetujui} />
            <MiniStat icon={<ShoppingCart size={15} />} label="Dipesan" value={counts.dipesan} />
            <MiniStat icon={<Package size={15} />} label="Diterima" value={counts.diterima} />
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(['SEMUA', 'diajukan', 'disetujui', 'dipesan', 'diterima'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
              filter === s ? 'bg-navy text-white border-navy' : 'bg-surface text-ink border-line hover:bg-canvas'
            }`}>
            {s === 'SEMUA' ? 'Semua' : STATUS_META[s].label}
          </button>
        ))}
      </div>

      {/* Tabel usulan */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-5">No. Usulan</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Item</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Unit</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Jumlah</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Estimasi</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Status</th>
                <th className="text-right text-xs font-semibold text-ink-muted uppercase py-3 px-5">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-line/40 last:border-0 hover:bg-canvas/40">
                  <td className="py-3 px-5 text-sm text-ink-muted font-mono">{p.id}</td>
                  <td className="py-3 px-3 text-sm text-ink font-medium">{p.title}</td>
                  <td className="py-3 px-3"><Badge variant="navy" size="sm">{p.unit}</Badge></td>
                  <td className="py-3 px-3 text-sm text-ink-muted">{p.qty} eks</td>
                  <td className="py-3 px-3 text-sm text-ink">{formatRupiah(p.estimasi)}</td>
                  <td className="py-3 px-3"><Badge variant={STATUS_META[p.status].variant} size="sm">{STATUS_META[p.status].label}</Badge></td>
                  <td className="py-3 px-5 text-right text-sm text-ink-muted">{formatDateShort(p.date)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-sm text-ink-muted">Tidak ada usulan pada status ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajukan Pengadaan Buku"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" form="form-pengadaan" icon={<Plus size={16} />}>Ajukan</Button>
          </>
        }
      >
        <form id="form-pengadaan" onSubmit={handleAdd} className="space-y-4">
          <Input label="Judul / Kebutuhan Buku" name="judul" placeholder="mis. Novel Sastra Indonesia Pilihan" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jumlah Eksemplar" name="qty" type="number" min={1} defaultValue={10} />
            <Select label="Unit Tujuan" name="unit" options={[{ value: 'SD', label: 'SD' }, { value: 'SMP', label: 'SMP' }, { value: 'SMA', label: 'SMA' }, { value: 'SEMUA', label: 'Semua Unit' }]} />
          </div>
          <Input label="Estimasi Harga Total (Rp)" name="estimasi" type="number" placeholder="1500000" />
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Alasan / Justifikasi</label>
            <textarea name="alasan" rows={3} placeholder="Contoh: menambah koleksi fiksi untuk program literasi kelas 5."
              className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all resize-none" />
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}

function BudgetStat({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'warning' | 'success' }) {
  const cls = tone === 'warning' ? 'text-warning' : tone === 'success' ? 'text-success' : 'text-ink';
  return (
    <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
      <p className="text-xs text-ink-muted mb-1">{label}</p>
      <p className={`text-base font-bold ${cls}`}>{formatRupiah(value)}</p>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-md bg-canvas/50 border border-line/60">
      <span className="text-navy">{icon}</span>
      <div>
        <p className="text-[11px] text-ink-muted leading-none">{label}</p>
        <p className="text-base font-bold text-ink leading-tight">{formatNumber(value)}</p>
      </div>
    </div>
  );
}
