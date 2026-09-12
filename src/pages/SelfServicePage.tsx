import { useState, useMemo, useRef } from 'react';
import {
  ScanLine, BookPlus, RotateCcw, CheckCircle2, XCircle, MapPin,
  ArrowRight, ArrowLeft, Trash2, Library, UserCheck, Info, Home,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookCover } from '@/components/BookCover';
import { findBookByBarcode, findMemberById, BOOKS, MEMBERS } from '@/lib/data';
import { addDays, formatDateShort } from '@/lib/format';
import type { Book, BookCopy, Member, Unit } from '@/types';

type Notify = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;

interface SelfServiceProps {
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  notify: Notify;
}

// Barcode buku memuat prefiks unit (BK-SD-xxxx). Pakai itu untuk menemukan
// eksemplar & lokasi rak yang tepat; jika tak cocok, ambil eksemplar pertama.
function resolveCopy(book: Book, barcode: string): BookCopy {
  const match = barcode.toUpperCase().match(/-(SD|SMP|SMA)-/);
  const unit = match ? (match[1] as Unit) : undefined;
  return (unit && book.copies.find((c) => c.unit === unit)) || book.copies[0];
}

export function SelfServicePage({ route, navigate, onLogout, notify }: SelfServiceProps) {
  const mode = useMemo<'home' | 'pinjam' | 'kembali'>(() => {
    if (route.includes('mode=pinjam')) return 'pinjam';
    if (route.includes('mode=kembali')) return 'kembali';
    return 'home';
  }, [route]);

  const preBookId = useMemo(() => {
    const m = route.match(/book=([^&]+)/);
    return m ? m[1] : null;
  }, [route]);

  return (
    <PublicLayout route={route} navigate={navigate} onLogout={onLogout}>
      {mode === 'home' && <KioskHome navigate={navigate} />}
      {mode === 'pinjam' && <BorrowFlow preBookId={preBookId} navigate={navigate} notify={notify} />}
      {mode === 'kembali' && <ReturnFlow preBookId={preBookId} navigate={navigate} notify={notify} />}
    </PublicLayout>
  );
}

/* ------------------------------- Beranda kios ------------------------------ */

function KioskHome({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-action-light text-action text-sm font-medium mb-3">
          <ScanLine size={16} /> Layanan Mandiri
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">Pinjam &amp; Kembalikan Buku Sendiri</h1>
        <p className="text-ink-muted max-w-lg mx-auto">
          Cukup pindai barcode — tanpa antre di meja petugas. Ikuti petunjuk di layar.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/mandiri?mode=pinjam')}
          className="group text-left p-6 rounded-xl border border-line bg-surface hover:border-action hover:shadow-elevated transition-all"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-action-light text-action mb-4">
            <BookPlus size={24} />
          </span>
          <h2 className="text-lg font-semibold text-ink mb-1 flex items-center gap-1.5">
            Pinjam Buku <ArrowRight size={18} className="text-action opacity-0 group-hover:opacity-100 transition-opacity" />
          </h2>
          <p className="text-sm text-ink-muted">
            Pindai kartu anggota, lalu pindai buku yang ingin dibawa pulang.
          </p>
        </button>

        <button
          onClick={() => navigate('/mandiri?mode=kembali')}
          className="group text-left p-6 rounded-xl border border-line bg-surface hover:border-action hover:shadow-elevated transition-all"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-success-bg text-success mb-4">
            <RotateCcw size={24} />
          </span>
          <h2 className="text-lg font-semibold text-ink mb-1 flex items-center gap-1.5">
            Kembalikan Buku <ArrowRight size={18} className="text-action opacity-0 group-hover:opacity-100 transition-opacity" />
          </h2>
          <p className="text-sm text-ink-muted">
            Pindai buku yang dikembalikan, layar akan menunjukkan rak tempat menaruhnya.
          </p>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <StepList
          title="Cara meminjam"
          steps={['Pindai kartu anggota', 'Pindai barcode tiap buku', 'Konfirmasi & bawa buku']}
        />
        <StepList
          title="Cara mengembalikan"
          steps={['Pindai barcode buku', 'Lihat lokasi rak di layar', 'Letakkan buku sesuai petunjuk']}
        />
      </div>
    </div>
  );
}

function StepList({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="p-5 rounded-lg border border-line bg-canvas/40">
      <p className="text-sm font-semibold text-ink mb-3">{title}</p>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-ink-muted">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-navy-50 text-navy text-xs font-semibold flex-shrink-0">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* --------------------------------- Pinjam --------------------------------- */

interface CartItem {
  barcode: string;
  bookId: string;
  title: string;
  hue: number;
  unit: Unit;
  shelf: string;
  callNumber: string;
}

function BorrowFlow({
  preBookId, navigate, notify,
}: { preBookId: string | null; navigate: (p: string) => void; notify: Notify }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [memberInput, setMemberInput] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [memberError, setMemberError] = useState('');
  const [bookInput, setBookInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const bookRef = useRef<HTMLInputElement>(null);

  const dueDate = addDays(new Date(), 7).toISOString().split('T')[0];
  const pendingBook = useMemo(() => (preBookId ? BOOKS.find((b) => b.id === preBookId) ?? null : null), [preBookId]);

  const makeItem = (book: Book, barcode: string): CartItem => {
    const copy = resolveCopy(book, barcode);
    return {
      barcode, bookId: book.id, title: book.title, hue: book.coverHue,
      unit: copy.unit, shelf: copy.shelf, callNumber: copy.callNumber,
    };
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError('');
    const found = findMemberById(memberInput);
    if (!found) {
      setMemberError(`Kartu "${memberInput}" tidak dikenali. Coba lagi atau hubungi pustakawan.`);
      return;
    }
    if (found.status === 'diblokir') {
      setMemberError(`Kartu ${found.name} sedang diblokir (${found.restriction ?? 'ada tunggakan'}). Silakan ke meja pustakawan.`);
      return;
    }
    setMember(found);
    // Jika masuk dari tombol "Pinjam" scanner, langsung masukkan buku tsb.
    if (pendingBook) {
      const copy = resolveCopy(pendingBook, pendingBook.barcode);
      if (copy.status === 'tersedia') {
        setCart([makeItem(pendingBook, pendingBook.barcode)]);
      }
    }
    setStep(2);
    notify('success', 'Kartu dikenali', found.name);
  };

  const addBook = (code: string) => {
    const c = code.trim();
    if (!c) return;
    if (cart.some((i) => i.barcode.toLowerCase() === c.toLowerCase())) {
      notify('warning', 'Sudah ditambahkan', `${c} sudah ada di daftar.`);
      return;
    }
    const book = findBookByBarcode(c);
    if (!book) {
      notify('error', 'Tidak dikenali', `Barcode ${c} tidak terdaftar.`);
      return;
    }
    const copy = resolveCopy(book, c);
    if (copy.status !== 'tersedia') {
      notify('error', 'Tidak tersedia', `${book.title} sedang tidak dapat dipinjam.`);
      return;
    }
    setCart((prev) => [...prev, makeItem(book, c)]);
    notify('success', 'Buku ditambahkan', book.title);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBook(bookInput);
    setBookInput('');
    bookRef.current?.focus();
  };

  const resetAll = () => {
    setStep(1);
    setMember(null);
    setMemberInput('');
    setMemberError('');
    setCart([]);
    setBookInput('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <FlowHeader
        icon={<BookPlus size={18} />}
        title="Peminjaman Mandiri"
        onBack={() => navigate('/mandiri')}
      />
      <Stepper step={step} labels={['Kartu Anggota', 'Pindai Buku', 'Selesai']} />

      {/* Step 1 — kartu anggota */}
      {step === 1 && (
        <Card className="mt-5">
          <ScanHint label="Pindai kartu anggota" hint="Tempelkan barcode pada kartu anggota ke pemindai." />
          <form onSubmit={handleMemberSubmit} className="mt-4 space-y-3">
            <div className="relative">
              <ScanLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-action pointer-events-none" />
              <input
                autoFocus
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="Scan / ketik ID anggota (mis. SD-000124)"
                className="w-full rounded-md border-2 border-action/40 bg-surface pl-11 pr-3 py-3.5 text-base text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
              />
            </div>
            {memberError && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-error-bg border border-error-border text-error text-sm animate-slide-up">
                <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{memberError}</span>
              </div>
            )}
            <Button type="submit" fullWidth size="lg" icon={<ArrowRight size={18} />}>Lanjutkan</Button>
            <SampleChips label="Contoh kartu:" values={MEMBERS.slice(0, 3).map((m) => m.id)} onPick={setMemberInput} />
          </form>
        </Card>
      )}

      {/* Step 2 — pindai buku */}
      {step === 2 && member && (
        <div className="mt-5 space-y-4">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                style={{ backgroundColor: `hsl(${member.avatarHue}, 40%, 35%)` }}
              >
                {member.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{member.name}</p>
                <p className="text-xs text-ink-muted">{member.id} · Unit {member.unit}</p>
              </div>
              <Badge variant="success" size="sm" icon={<UserCheck size={12} />}>Terverifikasi</Badge>
            </div>
          </Card>

          <Card>
            <ScanHint label="Pindai barcode buku" hint="Pindai tiap buku yang ingin dipinjam. Fokus tetap di kolom ini." />
            <form onSubmit={handleBookSubmit} className="mt-4">
              <div className="relative">
                <ScanLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-action pointer-events-none" />
                <input
                  ref={bookRef}
                  autoFocus
                  value={bookInput}
                  onChange={(e) => setBookInput(e.target.value)}
                  placeholder="Scan / ketik barcode buku, tekan Enter"
                  className="w-full rounded-md border-2 border-action/40 bg-surface pl-11 pr-3 py-3.5 text-base text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
                />
              </div>
              <SampleChips label="Contoh buku:" values={BOOKS.slice(0, 3).map((b) => b.barcode)} onPick={(v) => { setBookInput(v); addBook(v); setBookInput(''); bookRef.current?.focus(); }} />
            </form>

            {cart.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {cart.map((item) => (
                  <li key={item.barcode} className="flex items-center gap-3 p-2.5 rounded-md border border-line">
                    <BookCover hue={item.hue} title={item.title} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                      <p className="text-xs text-ink-muted font-mono">{item.barcode}</p>
                      <p className="text-xs text-ink-muted">Jatuh tempo: {formatDateShort(dueDate)}</p>
                    </div>
                    <button
                      onClick={() => setCart((prev) => prev.filter((i) => i.barcode !== item.barcode))}
                      className="text-ink-muted hover:text-error p-1 rounded transition-colors"
                      aria-label="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex flex-col items-center py-8 text-center border border-dashed border-line rounded-md">
                <ScanLine size={28} className="text-ink-muted/40 mb-2" />
                <p className="text-sm text-ink-muted">Belum ada buku dipindai</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
              <span className="text-sm text-ink-muted">Total: <span className="font-semibold text-ink">{cart.length} buku</span></span>
              <Button onClick={() => setStep(3)} disabled={cart.length === 0} icon={<CheckCircle2 size={16} />}>
                Konfirmasi Peminjaman
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3 — selesai */}
      {step === 3 && member && (
        <Card className="mt-5">
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-14 h-14 rounded-full bg-success-bg border border-success-border flex items-center justify-center mb-3">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="text-lg font-bold text-ink">Peminjaman Berhasil</h2>
            <p className="text-sm text-ink-muted mt-1">
              {cart.length} buku dipinjam oleh {member.name}. Buku dapat langsung dibawa.
            </p>
          </div>

          <div className="border border-line rounded-lg p-4 mt-4 bg-canvas/30 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">No. Transaksi</span>
              <span className="font-mono text-ink">TRX-{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Anggota</span>
              <span className="text-ink">{member.name} ({member.id})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Jatuh tempo</span>
              <span className="text-ink font-medium">{formatDateShort(dueDate)}</span>
            </div>
            <div className="border-t border-line my-1" />
            {cart.map((item) => (
              <div key={item.barcode} className="flex justify-between text-sm">
                <span className="text-ink truncate max-w-[220px]">{item.title}</span>
                <span className="text-ink-muted font-mono text-xs">{item.barcode}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 mt-4 p-3 rounded-md bg-action-light border border-action/30 text-sm text-action">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <span>Harap kembalikan sebelum {formatDateShort(dueDate)} untuk menghindari denda keterlambatan.</span>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button variant="secondary" fullWidth onClick={resetAll} icon={<BookPlus size={16} />}>Pinjam Lagi</Button>
            <Button fullWidth onClick={() => navigate('/opac')} icon={<Home size={16} />}>Selesai</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* -------------------------------- Kembali --------------------------------- */

interface ReturnedItem {
  key: string;
  barcode: string;
  title: string;
  hue: number;
  unit: Unit;
  shelf: string;
  callNumber: string;
}

function ReturnFlow({
  preBookId, navigate, notify,
}: { preBookId: string | null; navigate: (p: string) => void; notify: Notify }) {
  // Jika dibuka dari "Kembalikan" di daftar pinjaman, langsung tampilkan lokasi raknya.
  const seed = useMemo<ReturnedItem | null>(() => {
    if (!preBookId) return null;
    const book = BOOKS.find((b) => b.id === preBookId);
    if (!book) return null;
    const copy = resolveCopy(book, book.barcode);
    return {
      key: `${book.barcode}-seed`, barcode: book.barcode, title: book.title, hue: book.coverHue,
      unit: copy.unit, shelf: copy.shelf, callNumber: copy.callNumber,
    };
  }, [preBookId]);

  const [bookInput, setBookInput] = useState('');
  const [current, setCurrent] = useState<ReturnedItem | null>(seed);
  const [history, setHistory] = useState<ReturnedItem[]>(seed ? [seed] : []);
  const [error, setError] = useState('');
  const bookRef = useRef<HTMLInputElement>(null);

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const c = bookInput.trim();
    if (!c) return;
    setBookInput('');
    const book = findBookByBarcode(c);
    if (!book) {
      setError(`Barcode ${c} tidak dikenali. Coba lagi atau hubungi pustakawan.`);
      notify('error', 'Tidak dikenali', `Barcode ${c} tidak terdaftar.`);
      bookRef.current?.focus();
      return;
    }
    const copy = resolveCopy(book, c);
    const item: ReturnedItem = {
      key: `${c}-${Date.now()}`, barcode: c, title: book.title, hue: book.coverHue,
      unit: copy.unit, shelf: copy.shelf, callNumber: copy.callNumber,
    };
    setError('');
    setCurrent(item);
    setHistory((prev) => [item, ...prev]);
    notify('success', 'Buku dikembalikan', book.title);
    bookRef.current?.focus();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <FlowHeader
        icon={<RotateCcw size={18} />}
        title="Pengembalian Mandiri"
        onBack={() => navigate('/mandiri')}
      />

      <Card className="mt-5">
        <ScanHint label="Pindai barcode buku yang dikembalikan" hint="Layar akan menunjukkan rak tempat buku harus diletakkan." />
        <form onSubmit={handleReturn} className="mt-4">
          <div className="relative">
            <ScanLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-action pointer-events-none" />
            <input
              ref={bookRef}
              autoFocus
              value={bookInput}
              onChange={(e) => setBookInput(e.target.value)}
              placeholder="Scan / ketik barcode buku, tekan Enter"
              className="w-full rounded-md border-2 border-action/40 bg-surface pl-11 pr-3 py-3.5 text-base text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 mt-3 p-3 rounded-md bg-error-bg border border-error-border text-error text-sm animate-slide-up">
              <XCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <SampleChips label="Contoh buku:" values={BOOKS.slice(0, 3).map((b) => b.barcode)} onPick={(v) => setBookInput(v)} />
        </form>
      </Card>

      {/* Petunjuk lokasi rak — tampilan utama pengembalian */}
      {current ? (
        <Card className="mt-4 border-success-border bg-success-bg/30 animate-scale-in">
          <div className="flex items-center gap-2 text-success mb-4">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">Pengembalian tercatat — letakkan buku di rak berikut</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <BookCover hue={current.hue} title={current.title} size="md" />
            <div className="flex-1 w-full">
              <p className="text-base font-semibold text-ink mb-3">{current.title}</p>
              <div className="grid grid-cols-3 gap-3">
                <ShelfStat icon={<Library size={18} />} label="Unit" value={current.unit} />
                <ShelfStat icon={<MapPin size={18} />} label="Rak" value={current.shelf} />
                <ShelfStat icon={<Info size={18} />} label="No. Panggil" value={current.callNumber} mono />
              </div>
              <p className="text-xs text-ink-muted mt-3 flex items-center gap-1.5">
                <ArrowRight size={14} /> Susun sesuai nomor panggil agar mudah ditemukan pembaca berikutnya.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="mt-4 flex flex-col items-center py-10 text-center border border-dashed border-line rounded-lg">
          <MapPin size={32} className="text-ink-muted/40 mb-2" />
          <p className="text-sm text-ink-muted">Pindai buku untuk melihat lokasi raknya</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-ink">Dikembalikan sesi ini ({history.length})</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/opac')} icon={<Home size={16} />}>Selesai</Button>
          </div>
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.key} className="flex items-center gap-3 p-2.5 rounded-md border border-line bg-surface">
                <BookCover hue={item.hue} title={item.title} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                  <p className="text-xs text-ink-muted font-mono">{item.barcode}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant="navy" size="sm">{item.unit}</Badge>
                  <p className="text-xs text-ink-muted mt-1">{item.shelf}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Bagian bersama ----------------------------- */

function FlowHeader({ icon, title, onBack }: { icon: React.ReactNode; title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-9 h-9 rounded-md border border-line text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
        aria-label="Kembali"
      >
        <ArrowLeft size={18} />
      </button>
      <span className="flex items-center justify-center w-9 h-9 rounded-md bg-navy-50 text-navy">{icon}</span>
      <h1 className="text-lg font-bold text-ink">{title}</h1>
    </div>
  );
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${
                  done ? 'bg-success text-white' : active ? 'bg-action text-white' : 'bg-canvas text-ink-muted border border-line'
                }`}
              >
                {done ? <CheckCircle2 size={16} /> : n}
              </span>
              <span className={`text-xs font-medium truncate ${active || done ? 'text-ink' : 'text-ink-muted'}`}>{label}</span>
            </div>
            {i < labels.length - 1 && <span className={`h-px flex-1 ${done ? 'bg-success' : 'bg-line'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function ScanHint({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-action-light text-action flex-shrink-0 animate-pulse">
        <ScanLine size={22} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink-muted mt-0.5">{hint}</p>
      </div>
    </div>
  );
}

function SampleChips({ label, values, onPick }: { label: string; values: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-xs text-ink-muted">{label}</span>
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className="text-xs px-2 py-1 rounded-md bg-canvas border border-line text-navy hover:border-navy-200 font-mono transition-all"
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function ShelfStat({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-surface border border-line text-center">
      <span className="inline-flex items-center justify-center text-navy mb-1">{icon}</span>
      <p className="text-[11px] text-ink-muted uppercase tracking-wide">{label}</p>
      <p className={`text-base font-bold text-ink ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
    </div>
  );
}
