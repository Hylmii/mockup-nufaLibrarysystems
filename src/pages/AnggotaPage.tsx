import { useState, useMemo } from 'react';
import {
  UserPlus, Search, Users, UserCheck, UserX, Clock, Eye, Pencil, ShieldOff,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select } from '@/components/ui/Input';
import { MEMBERS } from '@/lib/data';
import { formatNumber, formatDateShort } from '@/lib/format';
import type { Role, Unit, Member } from '@/types';

type Notify = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;

interface AdminPageProps {
  role: Role;
  activeUnit: Unit;
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  notify: Notify;
}

const CATEGORY_LABEL: Record<Member['category'], string> = { siswa: 'Siswa', guru: 'Guru', staf: 'Staf' };

export function AnggotaPage({ role, activeUnit, route, navigate, onLogout, notify }: AdminPageProps) {
  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState('SEMUA');
  const [status, setStatus] = useState('SEMUA');
  const [addOpen, setAddOpen] = useState(() => route.includes('action=daftar'));

  const totals = useMemo(() => ({
    total: MEMBERS.length,
    aktif: MEMBERS.filter((m) => m.status === 'aktif').length,
    diblokir: MEMBERS.filter((m) => m.status === 'diblokir').length,
    menunggu: MEMBERS.filter((m) => m.status === 'menunggu').length,
  }), []);

  const filtered = useMemo(() => MEMBERS.filter((m) => {
    if (search && !`${m.name} ${m.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (unit !== 'SEMUA' && m.unit !== unit) return false;
    if (status !== 'SEMUA' && m.status !== status) return false;
    return true;
  }), [search, unit, status]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddOpen(false);
    notify('success', 'Anggota didaftarkan', 'Anggota baru berhasil ditambahkan (simulasi).');
  };

  return (
    <AdminLayout
      role={role} activeUnit={activeUnit} route={route} navigate={navigate}
      onLogout={onLogout}
      pageTitle="Anggota"
      breadcrumbs={[{ label: 'Pustakawan' }, { label: 'Anggota' }]}
      pageActions={
        <Button size="sm" icon={<UserPlus size={16} />} onClick={() => setAddOpen(true)} className="hidden sm:inline-flex">
          Daftarkan Anggota
        </Button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Users size={18} />} label="Total Anggota" value={totals.total} />
        <StatCard icon={<UserCheck size={18} />} label="Aktif" value={totals.aktif} tone="success" />
        <StatCard icon={<Clock size={18} />} label="Menunggu" value={totals.menunggu} tone="warning" />
        <StatCard icon={<UserX size={18} />} label="Diblokir" value={totals.diblokir} tone="error" />
      </div>

      <Card className="mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau ID anggota"
              className="w-full rounded-md border border-line bg-surface pl-10 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
            />
          </div>
          <div className="w-full lg:w-36">
            <Select value={unit} onChange={(e) => setUnit(e.target.value)}
              options={[{ value: 'SEMUA', label: 'Semua Unit' }, { value: 'SD', label: 'SD' }, { value: 'SMP', label: 'SMP' }, { value: 'SMA', label: 'SMA' }]} />
          </div>
          <div className="w-full lg:w-44">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}
              options={[{ value: 'SEMUA', label: 'Semua Status' }, { value: 'aktif', label: 'Aktif' }, { value: 'menunggu', label: 'Menunggu' }, { value: 'diblokir', label: 'Diblokir' }]} />
          </div>
          <Button icon={<UserPlus size={16} />} onClick={() => setAddOpen(true)} className="sm:hidden">Daftarkan</Button>
        </div>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-5">Anggota</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Unit</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Kategori</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Pinjaman</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Status</th>
                <th className="text-right text-xs font-semibold text-ink-muted uppercase py-3 px-5">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-line/40 last:border-0 hover:bg-canvas/40">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={{ backgroundColor: `hsl(${m.avatarHue}, 40%, 35%)` }}>
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{m.name}</p>
                        <p className="text-xs text-ink-muted font-mono">{m.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3"><Badge variant="navy" size="sm">{m.unit}</Badge></td>
                  <td className="py-3 px-3 text-sm text-ink-muted">{CATEGORY_LABEL[m.category]}</td>
                  <td className="py-3 px-3 text-sm">
                    <span className="text-ink">{m.activeLoans} aktif</span>
                    {m.overdueCount > 0 && <span className="text-error ml-1.5">· {m.overdueCount} telat</span>}
                  </td>
                  <td className="py-3 px-3">
                    {m.status === 'aktif' && <Badge variant="success" size="sm">Aktif</Badge>}
                    {m.status === 'menunggu' && <Badge variant="warning" size="sm">Menunggu</Badge>}
                    {m.status === 'diblokir' && <Badge variant="error" size="sm">Diblokir</Badge>}
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn title="Lihat" onClick={() => notify('info', m.name, `${m.id} · Bergabung ${formatDateShort(m.joinedDate)}`)}><Eye size={16} /></IconBtn>
                      <IconBtn title="Edit" onClick={() => notify('info', 'Edit Anggota', `Membuka editor untuk ${m.name} (simulasi).`)}><Pencil size={16} /></IconBtn>
                      <IconBtn title={m.status === 'diblokir' ? 'Buka blokir' : 'Blokir'} danger
                        onClick={() => notify('warning', m.status === 'diblokir' ? 'Buka Blokir' : 'Blokir Anggota', `${m.name} (simulasi).`)}>
                        <ShieldOff size={16} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-sm text-ink-muted">Tidak ada anggota yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Daftarkan Anggota Baru"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" form="form-daftar-anggota" icon={<UserPlus size={16} />}>Daftarkan</Button>
          </>
        }
      >
        <form id="form-daftar-anggota" onSubmit={handleAdd} className="space-y-4">
          <Input label="Nama Lengkap" name="nama" placeholder="Nama anggota" required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Unit" name="unit" options={[{ value: 'SD', label: 'SD' }, { value: 'SMP', label: 'SMP' }, { value: 'SMA', label: 'SMA' }]} />
            <Select label="Kategori" name="kategori" options={[{ value: 'siswa', label: 'Siswa' }, { value: 'guru', label: 'Guru' }, { value: 'staf', label: 'Staf' }]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nomor Induk / NIS" name="nis" placeholder="mis. 000201" />
            <Input label="Kelas / Jabatan" name="kelas" placeholder="mis. 5A" />
          </div>
          <Input label="Email / Kontak (opsional)" name="kontak" placeholder="email@sekolah.sch.id" />
          <p className="text-xs text-ink-muted">Kartu anggota beserta barcode akan dicetak setelah pendaftaran.</p>
        </form>
      </Dialog>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, tone = 'default' }: { icon: React.ReactNode; label: string; value: number; tone?: 'default' | 'success' | 'warning' | 'error' }) {
  const toneCls =
    tone === 'success' ? 'text-success bg-success-bg'
    : tone === 'warning' ? 'text-warning bg-warning-bg'
    : tone === 'error' ? 'text-error bg-error-bg'
    : 'text-navy bg-navy-50';
  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        <span className={`flex items-center justify-center w-10 h-10 rounded-md ${toneCls}`}>{icon}</span>
        <div>
          <p className="text-xs text-ink-muted">{label}</p>
          <p className="text-xl font-bold text-ink">{formatNumber(value)}</p>
        </div>
      </div>
    </Card>
  );
}

function IconBtn({ children, title, onClick, danger }: { children: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title} aria-label={title}
      className={`p-1.5 rounded-md transition-colors ${danger ? 'text-ink-muted hover:text-error hover:bg-error-bg' : 'text-ink-muted hover:text-action hover:bg-action-light'}`}>
      {children}
    </button>
  );
}
