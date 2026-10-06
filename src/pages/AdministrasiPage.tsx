import { useState, useMemo } from 'react';
import {
  Upload, FileWarning, ScrollText, Tags, Save, Download, Plus, Trash2,
  CheckCircle2, FileSpreadsheet, Settings,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { PUSTAKAWAN_TASKS, BOOKS } from '@/lib/data';
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

const IMPORT_HISTORY = [
  { file: 'anggota_sd_2024.csv', rows: 128, status: 'berhasil', date: '10 Sep 2026' },
  { file: 'koleksi_smp_batch3.xlsx', rows: 64, status: 'berhasil', date: '8 Sep 2026' },
  { file: 'import_anggota_sma_2024.csv', rows: 3, status: 'perlu koreksi', date: '7 Sep 2026' },
];

export function AdministrasiPage({ role, activeUnit, route, navigate, onLogout, notify }: AdminPageProps) {
  const [tab, setTab] = useState('import');
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    BOOKS.forEach((b) => map.set(b.category, (map.get(b.category) ?? 0) + b.copies.length));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, []);

  const tabs = [
    { id: 'import', label: 'Import Data', icon: <Upload size={16} /> },
    { id: 'kebijakan', label: 'Kebijakan', icon: <ScrollText size={16} /> },
    { id: 'kategori', label: 'Kategori', icon: <Tags size={16} /> },
  ];

  return (
    <AdminLayout
      role={role} activeUnit={activeUnit} route={route} navigate={navigate}
      onLogout={onLogout}
      pageTitle="Administrasi"
      breadcrumbs={[{ label: 'Pustakawan' }, { label: 'Administrasi' }]}
    >
      <div className="mb-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      {tab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader title="Import Data" subtitle="Unggah data anggota atau koleksi secara massal" icon={<Upload size={18} />} />
              <button
                onClick={() => notify('info', 'Pilih Berkas', 'Membuka pemilih berkas (simulasi).')}
                className="w-full flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed border-line hover:border-action hover:bg-action-light/30 transition-colors"
              >
                <FileSpreadsheet size={40} className="text-ink-muted/50 mb-3" />
                <p className="text-sm font-medium text-ink">Seret berkas CSV / Excel ke sini</p>
                <p className="text-xs text-ink-muted mt-1">atau klik untuk memilih berkas (maks 5 MB)</p>
              </button>
              <div className="flex items-center justify-between mt-3">
                <button onClick={() => notify('info', 'Template', 'Mengunduh template CSV (simulasi).')}
                  className="inline-flex items-center gap-1.5 text-xs text-action hover:underline font-medium">
                  <Download size={14} /> Unduh template CSV
                </button>
                <Button size="sm" icon={<Upload size={16} />} onClick={() => notify('success', 'Import diproses', 'Berkas sedang divalidasi (simulasi).')}>Proses Import</Button>
              </div>
            </Card>

            <Card padding="none">
              <div className="p-5 pb-0">
                <CardHeader title="Riwayat Import" icon={<ScrollText size={18} />} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-5">Berkas</th>
                      <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Baris</th>
                      <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Status</th>
                      <th className="text-right text-xs font-semibold text-ink-muted uppercase py-3 px-5">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {IMPORT_HISTORY.map((h) => (
                      <tr key={h.file} className="border-b border-line/40 last:border-0">
                        <td className="py-3 px-5 text-sm text-ink font-mono">{h.file}</td>
                        <td className="py-3 px-3 text-sm text-ink-muted">{h.rows}</td>
                        <td className="py-3 px-3">
                          {h.status === 'berhasil'
                            ? <Badge variant="success" size="sm">Berhasil</Badge>
                            : <Badge variant="warning" size="sm">Perlu koreksi</Badge>}
                        </td>
                        <td className="py-3 px-5 text-right text-sm text-ink-muted">{h.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Perlu Koreksi" icon={<FileWarning size={18} />}
              action={<Badge variant="warning" size="sm">{PUSTAKAWAN_TASKS.importIssues.length}</Badge>} />
            <ul className="space-y-2">
              {PUSTAKAWAN_TASKS.importIssues.map((imp, i) => (
                <li key={i} className="p-3 rounded-md border border-warning-border/40 bg-warning-bg/30">
                  <p className="text-sm font-medium text-ink truncate">{imp.fileName}</p>
                  <p className="text-xs text-ink-muted mt-1">{imp.issue}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="warning" size="sm">{imp.rows} baris</Badge>
                    <button onClick={() => notify('info', 'Koreksi Import', 'Membuka editor koreksi data (simulasi).')}
                      className="text-xs text-action hover:underline font-medium">Perbaiki</button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'kebijakan' && (
        <Card className="max-w-2xl">
          <CardHeader title="Kebijakan Peminjaman" subtitle="Berlaku untuk seluruh unit" icon={<Settings size={18} />} />
          <form onSubmit={(e) => { e.preventDefault(); notify('success', 'Kebijakan disimpan', 'Perubahan kebijakan diterapkan (simulasi).'); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Durasi Pinjam (hari)" name="durasi" type="number" defaultValue={7} />
              <Input label="Maks. Buku per Anggota" name="maks" type="number" defaultValue={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Denda per Hari (Rp)" name="denda" type="number" defaultValue={1000} />
              <Input label="Masa Reservasi (hari)" name="reservasi" type="number" defaultValue={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Maks. Perpanjangan" name="perpanjangan" type="number" defaultValue={1} />
              <Input label="Blokir Otomatis (hari telat)" name="blokir" type="number" defaultValue={14} />
            </div>
            <div className="pt-2">
              <Button type="submit" icon={<Save size={16} />}>Simpan Kebijakan</Button>
            </div>
          </form>
        </Card>
      )}

      {tab === 'kategori' && (
        <Card className="max-w-2xl">
          <CardHeader title="Kategori Koleksi" subtitle="Kelola klasifikasi buku" icon={<Tags size={18} />} />
          <form onSubmit={(e) => { e.preventDefault(); notify('success', 'Kategori ditambahkan', 'Kategori baru dibuat (simulasi).'); }} className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input name="kategoriBaru" placeholder="Nama kategori baru" />
            </div>
            <Button type="submit" icon={<Plus size={16} />}>Tambah</Button>
          </form>
          <ul className="divide-y divide-line/60 border border-line rounded-md">
            {categories.map((c) => (
              <li key={c.name} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-success" />
                  <span className="text-sm text-ink">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-muted">{c.count} eksemplar</span>
                  <button onClick={() => notify('warning', 'Hapus Kategori', `Konfirmasi penghapusan kategori "${c.name}" (simulasi).`)}
                    className="text-ink-muted hover:text-error p-1 rounded transition-colors" aria-label="Hapus">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </AdminLayout>
  );
}
