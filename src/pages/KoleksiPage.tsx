import { useState, useMemo } from 'react';
import {
  BookPlus, Search, Eye, Pencil, Trash2, BookOpen, Library, CheckCircle2, ArrowLeftRight,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select } from '@/components/ui/Input';
import { BookCover } from '@/components/BookCover';
import { BOOKS } from '@/lib/data';
import { formatNumber } from '@/lib/format';
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

const PAGE_SIZE = 20;

export function KoleksiPage({ role, activeUnit, route, navigate, onLogout, notify }: AdminPageProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('SEMUA');
  const [unit, setUnit] = useState('SEMUA');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(() => route.includes('action=tambah'));

  const categories = useMemo(() => Array.from(new Set(BOOKS.map((b) => b.category))), []);

  const totals = useMemo(() => {
    const copies = BOOKS.flatMap((b) => b.copies);
    return {
      judul: BOOKS.length,
      eksemplar: copies.length,
      tersedia: copies.filter((c) => c.status === 'tersedia').length,
      dipinjam: copies.filter((c) => c.status === 'dipinjam').length,
    };
  }, []);

  const filtered = useMemo(() => {
    return BOOKS.filter((b) => {
      if (search && !`${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== 'SEMUA' && b.category !== category) return false;
      if (unit !== 'SEMUA' && !b.copies.some((c) => c.unit === unit)) return false;
      return true;
    });
  }, [search, category, unit]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddOpen(false);
    notify('success', 'Buku ditambahkan', 'Judul baru berhasil ditambahkan ke koleksi (simulasi).');
  };

  return (
    <AdminLayout
      role={role} activeUnit={activeUnit} route={route} navigate={navigate}
      onLogout={onLogout}
      pageTitle="Koleksi"
      breadcrumbs={[{ label: 'Pustakawan' }, { label: 'Koleksi' }]}
      pageActions={
        <Button size="sm" icon={<BookPlus size={16} />} onClick={() => setAddOpen(true)} className="hidden sm:inline-flex">
          Tambah Buku
        </Button>
      }
    >
      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<BookOpen size={18} />} label="Total Judul" value={totals.judul} />
        <StatCard icon={<Library size={18} />} label="Total Eksemplar" value={totals.eksemplar} />
        <StatCard icon={<CheckCircle2 size={18} />} label="Tersedia" value={totals.tersedia} tone="success" />
        <StatCard icon={<ArrowLeftRight size={18} />} label="Dipinjam" value={totals.dipinjam} tone="warning" />
      </div>

      {/* Toolbar */}
      <Card className="mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari judul, penulis, atau ISBN"
              className="w-full rounded-md border border-line bg-surface pl-10 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
            />
          </div>
          <div className="w-full lg:w-48">
            <Select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              options={[{ value: 'SEMUA', label: 'Semua Kategori' }, ...categories.map((c) => ({ value: c, label: c }))]}
            />
          </div>
          <div className="w-full lg:w-36">
            <Select
              value={unit}
              onChange={(e) => { setUnit(e.target.value); setPage(1); }}
              options={[
                { value: 'SEMUA', label: 'Semua Unit' },
                { value: 'SD', label: 'SD' }, { value: 'SMP', label: 'SMP' }, { value: 'SMA', label: 'SMA' },
              ]}
            />
          </div>
          <Button icon={<BookPlus size={16} />} onClick={() => setAddOpen(true)} className="sm:hidden">Tambah</Button>
        </div>
      </Card>

      {/* Tabel */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-5">Buku</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Kategori</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Unit</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Eksemplar</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Status</th>
                <th className="text-right text-xs font-semibold text-ink-muted uppercase py-3 px-5">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((book) => {
                const units = Array.from(new Set(book.copies.map((c) => c.unit)));
                const available = book.copies.some((c) => c.status === 'tersedia');
                return (
                  <tr key={book.id} className="border-b border-line/40 last:border-0 hover:bg-canvas/40">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <BookCover hue={book.coverHue} title={book.title} size="xs" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink truncate max-w-[220px]">{book.title}</p>
                          <p className="text-xs text-ink-muted">{book.author} · {book.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3"><Badge variant="navy" size="sm">{book.category}</Badge></td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">{units.map((u) => <Badge key={u} variant="neutral" size="sm">{u}</Badge>)}</div>
                    </td>
                    <td className="py-3 px-3 text-sm text-ink-muted">{book.copies.length}</td>
                    <td className="py-3 px-3">
                      {available
                        ? <StatusBadge status="tersedia" />
                        : <StatusBadge status="dipinjam" />}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="Detail" onClick={() => navigate(`/buku/${book.id}`)}><Eye size={16} /></IconBtn>
                        <IconBtn title="Edit" onClick={() => notify('info', 'Edit Buku', `Membuka editor untuk "${book.title}" (simulasi).`)}><Pencil size={16} /></IconBtn>
                        <IconBtn title="Hapus" danger onClick={() => notify('warning', 'Hapus Buku', `Konfirmasi penghapusan "${book.title}" (simulasi).`)}><Trash2 size={16} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-sm text-ink-muted">Tidak ada buku yang cocok dengan filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-line">
            <p className="text-sm text-ink-muted">
              Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {formatNumber(filtered.length)} judul
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-3 py-1.5 text-sm rounded-md border border-line text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Sebelumnya
              </button>
              <span className="text-sm text-ink-muted px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-line text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Dialog Tambah Buku */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Buku Baru"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" form="form-tambah-buku" icon={<BookPlus size={16} />}>Simpan Buku</Button>
          </>
        }
      >
        <form id="form-tambah-buku" onSubmit={handleAdd} className="space-y-4">
          <Input label="Judul Buku" name="judul" placeholder="Judul lengkap" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Penulis" name="penulis" placeholder="Nama penulis" required />
            <Input label="Penerbit" name="penerbit" placeholder="Nama penerbit" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ISBN" name="isbn" placeholder="978-..." />
            <Input label="Tahun Terbit" name="tahun" type="number" placeholder="2024" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Kategori" name="kategori" options={categories.map((c) => ({ value: c, label: c }))} />
            <Select label="Unit" name="unit" options={[{ value: 'SD', label: 'SD' }, { value: 'SMP', label: 'SMP' }, { value: 'SMA', label: 'SMA' }]} />
          </div>
          <Input label="Jumlah Eksemplar" name="eksemplar" type="number" defaultValue={1} min={1} />
        </form>
      </Dialog>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, tone = 'default' }: { icon: React.ReactNode; label: string; value: number; tone?: 'default' | 'success' | 'warning' }) {
  const toneCls = tone === 'success' ? 'text-success bg-success-bg' : tone === 'warning' ? 'text-warning bg-warning-bg' : 'text-navy bg-navy-50';
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
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-md transition-colors ${danger ? 'text-ink-muted hover:text-error hover:bg-error-bg' : 'text-ink-muted hover:text-action hover:bg-action-light'}`}
    >
      {children}
    </button>
  );
}
