import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, X, Compass, Atom, Scroll, Calculator, Leaf, PenLine,
  TrendingUp, BrainCircuit, ChevronRight, BookOpen, Bookmark,
  CheckCircle2, Clock, Loader2, ScanLine, RotateCcw, AlertTriangle,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScanDialog } from '@/components/ScanDialog';
import { BookCover } from '@/components/BookCover';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { FilterChip } from '@/components/ui/Tabs';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { BOOKS, POPULAR_CATEGORIES } from '@/lib/data';
import type { Book, Unit } from '@/types';

interface OpacPageProps {
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  notify: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Compass: <Compass size={20} />,
  Atom: <Atom size={20} />,
  Scroll: <Scroll size={20} />,
  Calculator: <Calculator size={20} />,
  Leaf: <Leaf size={20} />,
  PenLine: <PenLine size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  BrainCircuit: <BrainCircuit size={20} />,
};

export function OpacPage({ route, navigate, onLogout, notify }: OpacPageProps) {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [filters, setFilters] = useState({
    unit: 'SEMUA',
    jenjang: 'SEMUA',
    kategori: 'SEMUA',
    penulis: '',
    tahun: 'SEMUA',
    tersediaSaja: false,
  });

  const newBooks = BOOKS.filter((b) => b.isNew);
  const categories = Array.from(new Set(BOOKS.map((b) => b.category)));

  // Determine active tab from route
  const routeTab = useMemo(() => {
    if (route.includes('tab=cari')) return 'cari';
    if (route.includes('tab=kategori')) return 'kategori';
    if (route.includes('tab=pinjaman')) return 'pinjaman';
    if (route.includes('tab=reservasi')) return 'reservasi';
    if (route.includes('tab=profil')) return 'profil';
    return 'beranda';
  }, [route]);

  useEffect(() => {
    if (routeTab === 'cari') setHasSearched(true);
  }, [routeTab]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearching(true);
    setHasSearched(true);
    setTimeout(() => setSearching(false), 600);
  };

  const filteredBooks = useMemo(() => {
    let result = BOOKS;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        b.category.toLowerCase().includes(q),
      );
    }
    if (filters.kategori !== 'SEMUA') {
      result = result.filter((b) => b.category === filters.kategori);
    }
    if (filters.tersediaSaja) {
      result = result.filter((b) => b.copies.some((c) => c.status === 'tersedia'));
    }
    if (filters.tahun !== 'SEMUA') {
      const year = parseInt(filters.tahun);
      result = result.filter((b) => b.year === year);
    }
    return result;
  }, [search, filters]);

  const activeFilterCount = [
    filters.unit !== 'SEMUA',
    filters.kategori !== 'SEMUA',
    filters.tahun !== 'SEMUA',
    filters.tersediaSaja,
  ].filter(Boolean).length;

  return (
    <PublicLayout route={route} navigate={navigate} onLogout={onLogout}>
      {routeTab === 'beranda' && (
        <BerandaTab
          search={search}
          setSearch={setSearch}
          onSearch={handleSearch}
          newBooks={newBooks}
          navigate={navigate}
          onOpenScan={() => setScanOpen(true)}
        />
      )}

      {routeTab === 'cari' && (
        <CariTab
          search={search}
          setSearch={setSearch}
          onSearch={handleSearch}
          searching={searching}
          hasSearched={hasSearched}
          filteredBooks={filteredBooks}
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilterCount={activeFilterCount}
          categories={categories}
          navigate={navigate}
          onOpenScan={() => setScanOpen(true)}
        />
      )}

      {routeTab === 'kategori' && (
        <KategoriTab navigate={navigate} />
      )}

      {routeTab === 'pinjaman' && (
        <PinjamanTab navigate={navigate} />
      )}

      {routeTab === 'reservasi' && (
        <ReservasiTab navigate={navigate} />
      )}

      {routeTab === 'profil' && (
        <ProfilTab />
      )}

      <ScanDialog open={scanOpen} onClose={() => setScanOpen(false)} navigate={navigate} notify={notify} />
    </PublicLayout>
  );
}

function BerandaTab({
  search, setSearch, onSearch, newBooks, navigate, onOpenScan,
}: {
  search: string;
  setSearch: (v: string) => void;
  onSearch: () => void;
  newBooks: Book[];
  navigate: (p: string) => void;
  onOpenScan: () => void;
}) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        {/* Foto suasana perpustakaan + lapisan navy agar teks terbaca */}
        <img
          src="/images/siswa.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/55 via-navy/40 to-navy-800/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-md">
            Temukan buku yang ingin kamu baca
          </h1>
          <p className="text-sm sm:text-base text-white mb-6 max-w-xl mx-auto drop-shadow">
            Jelajahi koleksi perpustakaan SD, SMP, dan SMA SIT Nurul Fajri dalam satu pencarian.
          </p>
          <div className="max-w-2xl mx-auto flex items-stretch gap-2">
            <form onSubmit={onSearch} className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul, penulis, ISBN, atau kategori"
                className="w-full rounded-lg border border-line bg-surface pl-12 pr-24 py-3.5 text-base text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all shadow-elevated"
                autoFocus
              />
              <Button type="submit" size="md" className="absolute right-2 top-1/2 -translate-y-1/2">
                Cari
              </Button>
            </form>
            <button
              type="button"
              onClick={onOpenScan}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 rounded-lg bg-white text-navy font-medium shadow-elevated hover:bg-canvas transition-colors"
              aria-label="Pindai barcode buku"
            >
              <ScanLine size={20} />
              <span className="hidden sm:inline">Scan</span>
            </button>
          </div>
          <p className="text-xs text-white mt-3 drop-shadow">
            Punya buku di tangan?{' '}
            <button type="button" onClick={onOpenScan} className="underline font-medium hover:text-white/80">
              Pindai barcode
            </button>{' '}
            untuk lihat detail &amp; pinjam langsung.
          </p>
        </div>
      </section>

      {/* Popular categories */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Kategori Populer</h2>
          <button onClick={() => navigate('/opac?tab=kategori')} className="text-sm text-action hover:underline flex items-center gap-1">
            Lihat Semua <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_CATEGORIES.slice(0, 8).map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate('/opac?tab=cari')}
              className="flex items-center gap-3 p-4 rounded-lg border border-line bg-surface hover:border-navy-200 hover:shadow-card transition-all text-left"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-md bg-navy-50 text-navy flex-shrink-0">
                {iconMap[cat.icon]}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{cat.name}</p>
                <p className="text-xs text-ink-muted">{cat.count.toLocaleString('id-ID')} judul</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* New collections */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Koleksi Baru</h2>
          <button onClick={() => navigate('/opac?tab=cari')} className="text-sm text-action hover:underline flex items-center gap-1">
            Lihat Semua <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {newBooks.map((book) => (
            <BookResultCard key={book.id} book={book} navigate={navigate} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CariTab({
  search, setSearch, onSearch, searching, hasSearched, filteredBooks,
  filters, setFilters, showFilters, setShowFilters, activeFilterCount,
  categories, navigate, onOpenScan,
}: {
  search: string;
  setSearch: (v: string) => void;
  onSearch: () => void;
  searching: boolean;
  hasSearched: boolean;
  filteredBooks: Book[];
  filters: any;
  setFilters: (f: any) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  activeFilterCount: number;
  categories: string[];
  navigate: (p: string) => void;
  onOpenScan: () => void;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="mb-4 flex items-stretch gap-2">
        <form onSubmit={onSearch} className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, penulis, ISBN, atau kategori"
            className="w-full rounded-lg border border-line bg-surface pl-12 pr-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
          />
        </form>
        <button
          type="button"
          onClick={onOpenScan}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 rounded-lg border border-line bg-surface text-navy font-medium hover:bg-canvas hover:border-navy-200 transition-colors"
          aria-label="Pindai barcode buku"
        >
          <ScanLine size={20} />
          <span className="hidden sm:inline">Scan</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-all ${
            activeFilterCount > 0 ? 'bg-navy text-white border-navy' : 'bg-surface text-ink border-line hover:bg-canvas'
          }`}
        >
          <Filter size={16} />
          Filter
          {activeFilterCount > 0 && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{activeFilterCount}</span>
          )}
        </button>

        {/* Filter chips on mobile */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto flex-1">
          <FilterChip label="Semua Unit" active={filters.kategori === 'SEMUA'} onClick={() => setFilters({ ...filters, kategori: 'SEMUA' })} />
          {categories.slice(0, 3).map((cat) => (
            <FilterChip key={cat} label={cat} active={filters.kategori === cat} onClick={() => setFilters({ ...filters, kategori: cat })} />
          ))}
        </div>

        {/* Desktop filters */}
        <div className="hidden lg:flex items-center gap-2 flex-1">
          <div className="w-48">
            <Select
              value={filters.kategori}
              onChange={(e) => setFilters({ ...filters, kategori: e.target.value })}
              options={[
                { value: 'SEMUA', label: 'Semua Kategori' },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
          <div className="w-36">
            <Select
              value={filters.tahun}
              onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
              options={[
                { value: 'SEMUA', label: 'Semua Tahun' },
                ...Array.from(new Set(BOOKS.map((b) => b.year))).sort((a, b) => b - a).map((y) => ({ value: String(y), label: String(y) })),
              ]}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={filters.tersediaSaja}
              onChange={(e) => setFilters({ ...filters, tersediaSaja: e.target.checked })}
              className="w-4 h-4 rounded border-line text-action focus:ring-action"
            />
            Tersedia Saja
          </label>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters({ unit: 'SEMUA', jenjang: 'SEMUA', kategori: 'SEMUA', penulis: '', tahun: 'SEMUA', tersediaSaja: false })}
            className="text-sm text-ink-muted hover:text-error flex items-center gap-1"
          >
            <X size={14} /> Reset
          </button>
        )}
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden mb-4 p-4 bg-surface border border-line rounded-lg animate-slide-up">
          <div className="space-y-3">
            <Select
              label="Kategori"
              value={filters.kategori}
              onChange={(e) => setFilters({ ...filters, kategori: e.target.value })}
              options={[
                { value: 'SEMUA', label: 'Semua Kategori' },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
            />
            <Select
              label="Tahun Terbit"
              value={filters.tahun}
              onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
              options={[
                { value: 'SEMUA', label: 'Semua Tahun' },
                ...Array.from(new Set(BOOKS.map((b) => b.year))).sort((a, b) => b - a).map((y) => ({ value: String(y), label: String(y) })),
              ]}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.tersediaSaja}
                onChange={(e) => setFilters({ ...filters, tersediaSaja: e.target.checked })}
                className="w-4 h-4 rounded border-line text-action focus:ring-action"
              />
              <span className="text-sm text-ink">Tersedia Saja</span>
            </label>
            <Button variant="secondary" fullWidth onClick={() => setShowFilters(false)}>
              Terapkan Filter
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {searching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full h-48 rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          icon={<Search size={40} strokeWidth={1.5} />}
          title="Tidak ada hasil ditemukan"
          message={`Tidak ada buku yang cocok dengan "${search}". Coba ubah kata kunci atau hapus filter.`}
          action={
            <Button variant="secondary" onClick={() => { setSearch(''); setFilters({ unit: 'SEMUA', jenjang: 'SEMUA', kategori: 'SEMUA', penulis: '', tahun: 'SEMUA', tersediaSaja: false }); }}>
              Reset Pencarian
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-ink-muted mb-4">
            {filteredBooks.length} buku ditemukan
            {search && ` untuk "${search}"`}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <BookResultCard key={book.id} book={book} navigate={navigate} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BookResultCard({ book, navigate }: { book: Book; navigate: (p: string) => void }) {
  const availableCount = book.copies.filter((c) => c.status === 'tersedia').length;
  const totalCount = book.copies.length;

  return (
    <button
      onClick={() => navigate(`/buku/${book.id}`)}
      className="flex flex-col text-left bg-surface border border-line rounded-lg overflow-hidden hover:border-navy-200 hover:shadow-elevated transition-all duration-150 group"
    >
      <div className="flex justify-center p-4 bg-canvas/30 border-b border-line/40">
        <BookCover hue={book.coverHue} title={book.title} author={book.author} size="sm" />
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-sm font-semibold text-ink leading-tight line-clamp-2 mb-1 group-hover:text-action transition-colors">
          {book.title}
        </p>
        <p className="text-xs text-ink-muted mb-2">{book.author} · {book.year}</p>
        <div className="mt-auto">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <Badge variant="navy" size="sm">{book.category}</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {availableCount > 0 ? (
              <>
                <CheckCircle2 size={14} className="text-success" />
                <span className="text-success font-medium">Tersedia ({availableCount}/{totalCount})</span>
              </>
            ) : (
              <>
                <Clock size={14} className="text-warning" />
                <span className="text-warning font-medium">Dipinjam</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function KategoriTab({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-ink mb-1">Kategori Koleksi</h1>
      <p className="text-sm text-ink-muted mb-6">Jelajahi koleksi berdasarkan kategori</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {POPULAR_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => navigate('/opac?tab=cari')}
            className="flex items-center gap-3 p-5 rounded-lg border border-line bg-surface hover:border-navy-200 hover:shadow-card transition-all text-left"
          >
            <span className="flex items-center justify-center w-12 h-12 rounded-md bg-navy-50 text-navy flex-shrink-0">
              {iconMap[cat.icon]}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{cat.name}</p>
              <p className="text-xs text-ink-muted">{cat.count.toLocaleString('id-ID')} judul</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PinjamanTab({ navigate }: { navigate: (p: string) => void }) {
  // Pinjaman dikaitkan ke buku nyata agar tombol "Kembalikan" bisa membuka
  // kios pengembalian mandiri dengan lokasi rak yang sesuai.
  const loans = [
    { book: BOOKS[0], daysOffset: 5 },   // aman
    { book: BOOKS[1], daysOffset: 2 },   // segera jatuh tempo
    { book: BOOKS[2], daysOffset: -3 },  // sudah lewat tempo
  ];

  const overdueCount = loans.filter((l) => l.daysOffset < 0).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-ink mb-1">Pinjaman Saya</h1>
      <p className="text-sm text-ink-muted mb-6">Daftar buku yang sedang Anda pinjam</p>

      {overdueCount > 0 && (
        <div className="flex items-start gap-2.5 mb-4 p-3 rounded-lg bg-error-bg border border-error-border text-error animate-slide-up">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">{overdueCount} buku sudah lewat jatuh tempo</p>
            <p className="text-error/90 mt-0.5">Segera kembalikan untuk menghindari denda dan pemblokiran keanggotaan.</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loans.map(({ book, daysOffset }) => {
          const dueDate = new Date(Date.now() + daysOffset * 86400000);
          const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);
          const overdue = daysLeft < 0;
          const daysLate = Math.abs(daysLeft);
          const dueSoon = daysLeft >= 0 && daysLeft <= 2;

          return (
            <div
              key={book.id}
              className={`rounded-lg border p-4 transition-colors ${
                overdue ? 'border-error-border bg-error-bg/40' : 'border-line bg-surface'
              }`}
            >
              <div className="flex items-center gap-4">
                <BookCover hue={book.coverHue} title={book.title} author={book.author} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{book.title}</p>
                  <p className="text-xs text-ink-muted">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="navy" size="sm">Unit {book.copies[0].unit}</Badge>
                    <span className="text-xs text-ink-muted">
                      Jatuh tempo: {dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {overdue ? (
                    <Badge variant="error" size="sm">Terlambat {daysLate} hari</Badge>
                  ) : dueSoon ? (
                    <Badge variant="warning" size="sm">{daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari lagi`}</Badge>
                  ) : (
                    <Badge variant="success" size="sm">{daysLeft} hari lagi</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={overdue ? 'primary' : 'secondary'}
                    icon={<RotateCcw size={14} />}
                    onClick={() => navigate(`/mandiri?mode=kembali&book=${book.id}`)}
                  >
                    Kembalikan
                  </Button>
                </div>
              </div>

              {overdue && (
                <div className="flex items-start gap-2 mt-3 p-2.5 rounded-md bg-error-bg border border-error-border text-error text-xs">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Buku ini <span className="font-semibold">terlambat {daysLate} hari</span>. Harap segera dikembalikan lewat Layanan Mandiri.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReservasiTab({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-ink mb-1">Reservasi Saya</h1>
      <p className="text-sm text-ink-muted mb-6">Daftar buku yang Anda reservasi</p>
      <Card padding="sm">
        <div className="flex items-center gap-4">
          <BookCover hue={55} title="Ekonomi Makro: Teori dan Praktik" size="xs" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">Ekonomi Makro: Teori dan Praktik</p>
            <p className="text-xs text-ink-muted">Ahmad Fauzi</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="info" size="sm" icon={<Bookmark size={12} />}>Antrian 1</Badge>
              <span className="text-xs text-ink-muted">Estimasi tersedia: 3 hari</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProfilTab() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-ink mb-1">Profil Saya</h1>
      <p className="text-sm text-ink-muted mb-6">Informasi keanggotaan perpustakaan</p>
      <Card>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-line">
          <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-white text-xl font-semibold">
            A
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Aulia Rahma</h2>
            <p className="text-sm text-ink-muted">SD-000124 · Siswa SD</p>
            <Badge variant="success" size="sm" className="mt-1.5" icon={<CheckCircle2 size={12} />}>Aktif</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
            <p className="text-xs text-ink-muted mb-1">Peminjaman Aktif</p>
            <p className="text-xl font-bold text-ink">2</p>
          </div>
          <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
            <p className="text-xs text-ink-muted mb-1">Total Dipinjam</p>
            <p className="text-xl font-bold text-ink">18</p>
          </div>
          <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
            <p className="text-xs text-ink-muted mb-1">Reservasi Aktif</p>
            <p className="text-xl font-bold text-ink">1</p>
          </div>
          <div className="p-3 rounded-md bg-canvas/50 border border-line/60">
            <p className="text-xs text-ink-muted mb-1">Terlambat</p>
            <p className="text-xl font-bold text-success">0</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
