import { useState } from 'react';
import {
  ArrowLeft, Bookmark, CheckCircle2, Clock, MapPin, BookOpen,
  Building2, User as UserIcon, Calendar, Hash, Languages, Library,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { BookCover } from '@/components/BookCover';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { BOOKS } from '@/lib/data';
import type { Book, Unit } from '@/types';

interface BookDetailProps {
  bookId: string;
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  notify: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export function BookDetailPage({ bookId, route, navigate, onLogout, notify }: BookDetailProps) {
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserved, setReserved] = useState(false);

  const book = BOOKS.find((b) => b.id === bookId);

  if (!book) {
    return (
      <PublicLayout route={route} navigate={navigate} onLogout={onLogout}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BookOpen size={48} className="text-ink-muted/40 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-ink mb-2">Buku Tidak Ditemukan</h1>
          <p className="text-sm text-ink-muted mb-4">Buku yang Anda cari tidak tersedia dalam koleksi.</p>
          <Button variant="secondary" onClick={() => navigate('/opac')} icon={<ArrowLeft size={16} />}>
            Kembali ke Katalog
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const availableCopies = book.copies.filter((c) => c.status === 'tersedia');
  const totalCopies = book.copies.length;

  const handleReserve = () => {
    setReserveOpen(false);
    setReserved(true);
    notify('success', 'Reservasi Berhasil', `"${book.title}" telah direservasi. Anda akan mendapat notifikasi saat buku tersedia.`);
  };

  const canReserve = book.copies.some((c) => c.status !== 'tersedia' && c.status !== 'tidak-dapat-dipinjam');

  return (
    <PublicLayout route={route} navigate={navigate} onLogout={onLogout}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-ink-muted mb-4">
          <button onClick={() => navigate('/opac')} className="hover:text-action transition-colors">Beranda</button>
          <span>/</span>
          <button onClick={() => navigate('/opac?tab=cari')} className="hover:text-action transition-colors">Katalog</button>
          <span>/</span>
          <span className="text-ink truncate">{book.title}</span>
        </nav>

        <button
          onClick={() => navigate('/opac?tab=cari')}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke hasil pencarian
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: cover + quick info */}
          <div className="lg:col-span-1">
            <div className="flex justify-center lg:justify-start">
              <BookCover hue={book.coverHue} title={book.title} author={book.author} size="lg" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="p-4 rounded-lg border border-line bg-surface">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-ink">Ketersediaan</span>
                  <span className="text-sm font-semibold text-ink">{availableCopies.length}/{totalCopies}</span>
                </div>
                {availableCopies.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 size={16} />
                    <span>Tersedia untuk dipinjam</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-warning">
                    <Clock size={16} />
                    <span>Sedang dipinjam — reservasi tersedia</span>
                  </div>
                )}
              </div>

              {reserved ? (
                <div className="p-4 rounded-lg border border-success-border bg-success-bg flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-success">Reservasi Aktif</p>
                    <p className="text-xs text-success/80 mt-0.5">Anda akan mendapat notifikasi saat buku tersedia.</p>
                  </div>
                </div>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  variant={availableCopies.length > 0 ? 'secondary' : 'primary'}
                  icon={<Bookmark size={18} />}
                  onClick={() => setReserveOpen(true)}
                  disabled={!canReserve && availableCopies.length > 0}
                >
                  {availableCopies.length > 0 ? 'Reservasi Buku' : 'Reservasi Sekarang'}
                </Button>
              )}
            </div>
          </div>

          {/* Right: details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="navy" size="md">{book.category}</Badge>
                {book.isNew && <Badge variant="info" size="md">Koleksi Baru</Badge>}
              </div>
              <h1 className="text-2xl font-bold text-ink mb-2 leading-tight">{book.title}</h1>
              <p className="text-base text-ink-muted">oleh {book.author}</p>
            </div>

            <Card>
              <CardHeader title="Informasi Buku" icon={<BookOpen size={18} />} />
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <InfoRow icon={<Building2 size={16} />} label="Penerbit" value={book.publisher} />
                <InfoRow icon={<Calendar size={16} />} label="Tahun Terbit" value={String(book.year)} />
                <InfoRow icon={<Hash size={16} />} label="ISBN" value={book.isbn} />
                <InfoRow icon={<Languages size={16} />} label="Bahasa" value={book.language} />
                <InfoRow icon={<Library size={16} />} label="Total Eksemplar" value={`${totalCopies} eksemplar`} />
                <InfoRow icon={<BookOpen size={16} />} label="Kategori" value={book.category} />
              </dl>
            </Card>

            <Card>
              <CardHeader title="Sinopsis" icon={<BookOpen size={18} />} />
              <p className="text-sm text-ink leading-relaxed">{book.synopsis}</p>
            </Card>

            {/* Copies table */}
            <Card padding="none">
              <div className="p-5 pb-0">
                <CardHeader title="Eksemplar per Unit" subtitle="Lokasi dan status setiap eksemplar" icon={<MapPin size={18} />} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-5">Unit</th>
                      <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Rak</th>
                      <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Nomor Panggil</th>
                      <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-3">Eksemplar</th>
                      <th className="text-left text-xs font-semibold text-ink-muted uppercase py-3 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.copies.map((copy, i) => (
                      <tr key={i} className="border-b border-line/40 last:border-0">
                        <td className="py-3 px-5">
                          <Badge variant="navy" size="sm">{copy.unit}</Badge>
                        </td>
                        <td className="py-3 px-3 text-sm text-ink">{copy.shelf}</td>
                        <td className="py-3 px-3 text-sm text-ink-muted font-mono">{copy.callNumber}</td>
                        <td className="py-3 px-3 text-sm text-ink-muted">Eks. {copy.copyNumber}</td>
                        <td className="py-3 px-5">
                          <StatusBadge status={copy.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Reservation dialog */}
      <Dialog
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        title="Konfirmasi Reservasi"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReserveOpen(false)}>Batal</Button>
            <Button onClick={handleReserve} icon={<Bookmark size={16} />}>Ya, Reservasi</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BookCover hue={book.coverHue} title={book.title} size="xs" />
            <div>
              <p className="text-sm font-medium text-ink">{book.title}</p>
              <p className="text-xs text-ink-muted">{book.author}</p>
            </div>
          </div>
          <p className="text-sm text-ink-muted">
            Anda akan mendaftarkan reservasi untuk buku ini. Anda akan mendapat notifikasi
            saat buku tersedia untuk diambil di perpustakaan.
          </p>
          <div className="p-3 rounded-md bg-action-light border border-action/30 text-sm text-action">
            <p className="font-medium">Estimasi waktu tunggu: 3–5 hari</p>
            <p className="text-xs mt-0.5">Berdasarkan riwayat peminjaman buku ini.</p>
          </div>
        </div>
      </Dialog>
    </PublicLayout>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-ink-muted flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-ink-muted">{label}</dt>
        <dd className="text-sm text-ink font-medium">{value}</dd>
      </div>
    </div>
  );
}
