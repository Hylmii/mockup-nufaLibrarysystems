import { useState, useRef, useEffect } from 'react';
import {
  ScanLine, Search, User as UserIcon, AlertTriangle, CheckCircle2, XCircle,
  Trash2, BookX, UserCheck, Clock, RotateCcw, Receipt, BookOpen,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/States';
import { findCopyByBarcode, findMemberById, MEMBERS } from '@/lib/data';
import { formatDateShort, addDays, toDateKey } from '@/lib/format';
import type { Role, Unit, CirculationTab, Member } from '@/types';

interface SirkulasiProps {
  role: Role;
  activeUnit: Unit;
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  notify: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

interface ScannedItem {
  barcode: string;
  title: string;
  status: 'siap' | 'sudah-dipinjam' | 'tidak-tersedia' | 'duplikat' | 'tidak-ditemukan';
  dueDate: string;
}

export function SirkulasiPage({
  role, activeUnit, route, navigate, onLogout, notify,
}: SirkulasiProps) {
  const [tab, setTab] = useState<CirculationTab>('peminjaman');
  const [memberId, setMemberId] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [memberError, setMemberError] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{ trxId: string; member: Member; items: ScannedItem[]; date: string } | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const memberRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member && barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [member]);

  // Auto-focus barcode input after each scan
  useEffect(() => {
    if (member && tab === 'peminjaman') {
      const t = setTimeout(() => barcodeRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [scannedItems, member, tab]);

  const handleMemberSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError('');
    const found = findMemberById(memberId);
    if (!found) {
      setMember(null);
      setMemberError(`ID anggota "${memberId}" tidak ditemukan. Periksa kembali ID atau daftarkan anggota baru.`);
      return;
    }
    setMember(found);
    setScannedItems([]);
    notify('success', 'Anggota ditemukan', `${found.name} (${found.id})`);
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const code = barcodeInput.trim();
    const existing = scannedItems.find((s) => s.barcode.toLowerCase() === code.toLowerCase());

    if (existing) {
      setScannedItems((prev) =>
        prev.map((s) =>
          s.barcode.toLowerCase() === code.toLowerCase()
            ? { ...s, status: 'duplikat' as const }
            : s,
        ),
      );
      notify('warning', 'Barcode duplikat', `Buku ${code} sudah ada dalam daftar.`);
      setBarcodeInput('');
      return;
    }

    const match = findCopyByBarcode(code);
    if (!match) {
      setScannedItems((prev) => [
        ...prev,
        { barcode: code, title: 'Tidak ditemukan', status: 'tidak-ditemukan', dueDate: '' },
      ]);
      notify('error', 'Barcode tidak dikenali', `Buku dengan barcode ${code} tidak terdaftar dalam koleksi.`);
      setBarcodeInput('');
      return;
    }

    // Status diambil dari eksemplar fisik yang dipindai (barcode unik per eksemplar).
    const { book, copy } = match;
    if (copy.status === 'dipinjam') {
      setScannedItems((prev) => [
        ...prev,
        { barcode: code, title: book.title, status: 'sudah-dipinjam', dueDate: '' },
      ]);
      notify('warning', 'Buku sudah dipinjam', `${book.title} sedang dipinjam dan tidak tersedia.`);
      setBarcodeInput('');
      return;
    }

    if (copy.status === 'tidak-dapat-dipinjam' || copy.status === 'direservasi') {
      setScannedItems((prev) => [
        ...prev,
        { barcode: code, title: book.title, status: 'tidak-tersedia', dueDate: '' },
      ]);
      notify('error', 'Buku tidak tersedia', `${book.title} tidak dapat dipinjam saat ini.`);
      setBarcodeInput('');
      return;
    }

    const dueDate = toDateKey(addDays(new Date(), 7));
    setScannedItems((prev) => [
      ...prev,
      { barcode: code, title: book.title, status: 'siap', dueDate },
    ]);
    notify('success', 'Buku ditambahkan', `${book.title} siap dipinjam.`);
    setBarcodeInput('');
  };

  const handleRemoveItem = (barcode: string) => {
    setScannedItems((prev) => prev.filter((s) => s.barcode !== barcode));
  };

  const handleCancel = () => {
    setScannedItems([]);
    setBarcodeInput('');
    notify('info', 'Transaksi dibatalkan', 'Semua item dihapus dari daftar.');
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (member) {
      setReceiptData({ trxId: `TRX-${Date.now().toString().slice(-8)}`, member, items: scannedItems.filter((s) => s.status === 'siap'), date: new Date().toISOString() });
      setReceiptOpen(true);
      setScannedItems([]);
    }
  };

  const validItems = scannedItems.filter((s) => s.status === 'siap');
  const hasBlockedMember = member?.status === 'diblokir';
  const canConfirm = validItems.length > 0 && !hasBlockedMember;

  const tabs = [
    { id: 'peminjaman', label: 'Peminjaman', icon: <BookOpen size={16} /> },
    { id: 'pengembalian', label: 'Pengembalian', icon: <RotateCcw size={16} /> },
    { id: 'perpanjangan', label: 'Perpanjangan', icon: <Clock size={16} /> },
  ];

  const memberBlocked = member?.status === 'diblokir';
  const memberWaiting = member?.status === 'menunggu';

  return (
    <AdminLayout
      role={role}
      activeUnit={activeUnit}
      route={route}
      navigate={navigate}
      onLogout={onLogout}
      pageTitle="Sirkulasi"
      breadcrumbs={[{ label: 'Pustakawan' }, { label: 'Sirkulasi' }]}
    >
      <div className="mb-4">
        <Tabs tabs={tabs} active={tab} onChange={(t) => setTab(t as CirculationTab)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: member panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Panel Anggota" subtitle="Cari atau pindai ID anggota" icon={<UserIcon size={18} />} />
            <form onSubmit={handleMemberSearch} className="space-y-3">
              <div className="relative">
                <ScanLine size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                <input
                  ref={memberRef}
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="Scan atau masukkan ID anggota"
                  className="w-full rounded-md border border-line bg-surface pl-10 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
                  autoFocus={!member}
                />
              </div>
              {memberError && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-error-bg border border-error-border text-error text-sm animate-slide-up">
                  <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{memberError}</span>
                </div>
              )}
              <Button type="submit" variant="secondary" size="md" icon={<Search size={16} />}>
                Cari Anggota
              </Button>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-ink-muted self-center">Coba:</span>
                {MEMBERS.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setMemberId(m.id); }}
                    className="text-xs px-2 py-1 rounded-md bg-canvas border border-line text-navy hover:border-navy-200 transition-all"
                  >
                    {m.id}
                  </button>
                ))}
              </div>
            </form>
          </Card>

          {member && (
            <Card className="animate-slide-up">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0"
                  style={{ backgroundColor: `hsl(${member.avatarHue}, 40%, 35%)` }}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-ink">{member.name}</h3>
                  </div>
                  <p className="text-sm text-ink-muted mb-2">{member.id} · {member.category === 'siswa' ? 'Siswa' : member.category === 'guru' ? 'Guru' : 'Staf'}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="navy" size="sm">Unit {member.unit}</Badge>
                    {member.status === 'aktif' && <Badge variant="success" size="sm" icon={<UserCheck size={12} />}>Aktif</Badge>}
                    {member.status === 'diblokir' && <Badge variant="error" size="sm" icon={<XCircle size={12} />}>Diblokir</Badge>}
                    {member.status === 'menunggu' && <Badge variant="warning" size="sm" icon={<Clock size={12} />}>Menunggu</Badge>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-line">
                <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
                  <p className="text-xs text-ink-muted mb-1">Peminjaman Aktif</p>
                  <p className="text-lg font-bold text-ink">{member.activeLoans}</p>
                </div>
                <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
                  <p className="text-xs text-ink-muted mb-1">Terlambat</p>
                  <p className={`text-lg font-bold ${member.overdueCount > 0 ? 'text-error' : 'text-ink'}`}>{member.overdueCount}</p>
                </div>
              </div>

              {memberBlocked && (
                <div className="flex items-start gap-2 p-3 mt-3 rounded-md bg-error-bg border border-error-border text-error text-sm">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Anggota diblokir</p>
                    <p className="mt-0.5 text-error/90">{member.restriction}</p>
                    <p className="mt-1 text-xs">Selesaikan keterlambatan terlebih dahulu sebelum meminjam buku baru.</p>
                  </div>
                </div>
              )}

              {memberWaiting && (
                <div className="flex items-start gap-2 p-3 mt-3 rounded-md bg-warning-bg border border-warning-border text-warning text-sm">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Perlu verifikasi</p>
                    <p className="mt-0.5 text-warning/90">{member.restriction}</p>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right: transaction panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title={tab === 'peminjaman' ? 'Panel Peminjaman' : tab === 'pengembalian' ? 'Panel Pengembalian' : 'Panel Perpanjangan'}
              subtitle={member ? `Anggota: ${member.name}` : 'Pilih anggota terlebih dahulu'}
              icon={tab === 'peminjaman' ? <BookOpen size={18} /> : tab === 'pengembalian' ? <RotateCcw size={18} /> : <Clock size={18} />}
            />

            {!member ? (
              <EmptyState
                icon={<UserIcon size={40} strokeWidth={1.5} />}
                title="Belum ada anggota dipilih"
                message="Cari atau pindai ID anggota di panel sebelah kiri untuk memulai transaksi."
              />
            ) : (
              <div className="space-y-4">
                {/* Barcode input */}
                <form onSubmit={handleBarcodeScan}>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    {tab === 'peminjaman' ? 'Scan barcode buku' : tab === 'pengembalian' ? 'Scan barcode buku yang dikembalikan' : 'Scan barcode buku untuk perpanjang'}
                  </label>
                  <div className="relative">
                    <ScanLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-action pointer-events-none" />
                    <input
                      ref={barcodeRef}
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Arahkan pemindai ke barcode atau ketik manual lalu tekan Enter"
                      className={`w-full rounded-md border-2 bg-surface pl-11 pr-3 py-3.5 text-base text-ink placeholder:text-ink-muted/60 focus:shadow-focus outline-none transition-all ${
                        memberBlocked ? 'border-error/40 opacity-60' : 'border-action/40 focus:border-action'
                      }`}
                      disabled={memberBlocked}
                    />
                  </div>
                  <p className="text-xs text-ink-muted mt-1.5 flex items-center gap-1">
                    <ScanLine size={12} />
                    Fokus otomatis aktif setelah setiap pemindaian. Tekan Enter untuk menambahkan.
                  </p>
                  {memberBlocked && (
                    <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                      <XCircle size={12} /> Peminjaman diblokir — selesaikan keterlambatan terlebih dahulu.
                    </p>
                  )}
                </form>

                {/* Scanned items table */}
                {scannedItems.length > 0 ? (
                  <div className="border border-line rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-line bg-canvas/50">
                          <th className="text-left text-xs font-semibold text-ink-muted uppercase py-2 px-3">Barcode</th>
                          <th className="text-left text-xs font-semibold text-ink-muted uppercase py-2 px-3">Judul</th>
                          <th className="text-left text-xs font-semibold text-ink-muted uppercase py-2 px-3">Status</th>
                          <th className="text-left text-xs font-semibold text-ink-muted uppercase py-2 px-3">Jatuh Tempo</th>
                          <th className="text-right text-xs font-semibold text-ink-muted uppercase py-2 px-3">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedItems.map((item) => (
                          <tr key={item.barcode} className="border-b border-line/40 last:border-0">
                            <td className="py-2.5 px-3 text-sm text-ink-muted font-mono">{item.barcode}</td>
                            <td className="py-2.5 px-3 text-sm text-ink max-w-[180px] truncate">{item.title}</td>
                            <td className="py-2.5 px-3">
                              {item.status === 'siap' && <Badge variant="success" size="sm" icon={<CheckCircle2 size={12} />}>Siap dipinjam</Badge>}
                              {item.status === 'sudah-dipinjam' && <Badge variant="warning" size="sm" icon={<Clock size={12} />}>Sedang dipinjam</Badge>}
                              {item.status === 'tidak-tersedia' && <Badge variant="neutral" size="sm" icon={<BookX size={12} />}>Tidak tersedia</Badge>}
                              {item.status === 'duplikat' && <Badge variant="warning" size="sm" icon={<AlertTriangle size={12} />}>Duplikat</Badge>}
                              {item.status === 'tidak-ditemukan' && <Badge variant="error" size="sm" icon={<XCircle size={12} />}>Tidak ditemukan</Badge>}
                            </td>
                            <td className="py-2.5 px-3 text-sm text-ink-muted">
                              {item.dueDate ? formatDateShort(item.dueDate) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRemoveItem(item.barcode)}
                                className="text-ink-muted hover:text-error p-1 rounded transition-colors"
                                aria-label="Hapus item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-line rounded-md">
                    <ScanLine size={32} className="text-ink-muted/40 mb-2" />
                    <p className="text-sm text-ink-muted">Belum ada buku dipindai</p>
                    <p className="text-xs text-ink-muted/70 mt-1">Pindai barcode untuk menambahkan buku ke daftar</p>
                  </div>
                )}

                {/* Summary + actions */}
                {scannedItems.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-line">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">Total buku siap dipinjam</span>
                      <span className="font-semibold text-ink">{validItems.length} buku</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={handleCancel} icon={<XCircle size={16} />}>
                        Batalkan
                      </Button>
                      <Button
                        onClick={() => setConfirmOpen(true)}
                        disabled={!canConfirm}
                        icon={<CheckCircle2 size={16} />}
                        className="flex-1"
                      >
                        Konfirmasi {tab === 'peminjaman' ? 'Peminjaman' : tab === 'pengembalian' ? 'Pengembalian' : 'Perpanjangan'}
                      </Button>
                    </div>
                    {!canConfirm && hasBlockedMember && (
                      <p className="text-xs text-error flex items-center gap-1">
                        <AlertTriangle size={12} /> Anggota diblokir — tidak dapat melanjutkan transaksi.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Konfirmasi Peminjaman"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Batal</Button>
            <Button onClick={handleConfirm} icon={<CheckCircle2 size={16} />}>Ya, Konfirmasi</Button>
          </>
        }
      >
        {member && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-md bg-action-light border border-action/30">
              <UserIcon size={20} className="text-action" />
              <div>
                <p className="text-sm font-medium text-ink">{member.name}</p>
                <p className="text-xs text-ink-muted">{member.id} · Unit {member.unit}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink mb-2">Buku yang akan dipinjam:</p>
              <ul className="space-y-1.5">
                {validItems.map((item) => (
                  <li key={item.barcode} className="flex items-center justify-between text-sm p-2 rounded-md bg-canvas/50">
                    <span className="text-ink">{item.title}</span>
                    <span className="text-ink-muted text-xs">Jatuh tempo: {formatDateShort(item.dueDate)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-ink-muted">
              Peminjaman akan dicatat dan buku berstatus dipinjam hingga tanggal jatuh tempo.
            </p>
          </div>
        )}
      </Dialog>

      {/* Receipt dialog */}
      <Dialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        title="Transaksi Berhasil"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReceiptOpen(false)}>Tutup</Button>
            <Button onClick={() => { setReceiptOpen(false); setMember(null); setMemberId(''); memberRef.current?.focus(); }} icon={<Receipt size={16} />}>
              Transaksi Baru
            </Button>
          </>
        }
      >
        {receiptData && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-12 h-12 rounded-full bg-success-bg border border-success-border flex items-center justify-center mb-3">
                <CheckCircle2 size={28} className="text-success" />
              </div>
              <h3 className="text-base font-semibold text-ink">Peminjaman Berhasil Dicatat</h3>
              <p className="text-sm text-ink-muted mt-1">
                {receiptData.items.length} buku telah dipinjam oleh {receiptData.member.name}
              </p>
            </div>
            <div className="border border-line rounded-md p-4 space-y-2 bg-canvas/30">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Nomor Transaksi</span>
                <span className="font-mono text-ink">{receiptData.trxId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Anggota</span>
                <span className="text-ink">{receiptData.member.name} ({receiptData.member.id})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Tanggal</span>
                <span className="text-ink">{formatDateShort(receiptData.date)}</span>
              </div>
              <div className="border-t border-line my-2" />
              {receiptData.items.map((item) => (
                <div key={item.barcode} className="flex justify-between text-sm">
                  <span className="text-ink truncate max-w-[200px]">{item.title}</span>
                  <span className="text-ink-muted text-xs">{formatDateShort(item.dueDate)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-muted text-center">
              Simpan resi ini sebagai bukti transaksi peminjaman.
            </p>
          </div>
        )}
      </Dialog>
    </AdminLayout>
  );
}
