import { useState, useRef, useEffect } from 'react';
import {
  ScanLine, CheckCircle2, Clock, MapPin, XCircle, BookPlus, RotateCcw,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { BookCover } from '@/components/BookCover';
import { Badge } from '@/components/ui/Badge';
import { findCopyByBarcode, sampleBarcodes, type CopyMatch } from '@/lib/data';

interface ScanDialogProps {
  open: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  notify: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

// Campuran eksemplar tersedia & tidak, agar kedua kondisi bisa dicoba.
const SAMPLE_BARCODES = sampleBarcodes(3, true).concat('BK-SD-000219');

export function ScanDialog({ open, onClose, navigate, notify }: ScanDialogProps) {
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<CopyMatch | null>(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setBarcode('');
    setResult(null);
    setNotFound(false);
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [open]);

  const doScan = (code: string) => {
    const c = code.trim();
    if (!c) return;
    const match = findCopyByBarcode(c);
    if (match) {
      setResult(match);
      setNotFound(false);
      notify('success', 'Buku ditemukan', match.book.title);
    } else {
      setResult(null);
      setNotFound(true);
      notify('error', 'Barcode tidak dikenali', `Tidak ada buku dengan barcode "${c}".`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doScan(barcode);
  };

  const rescan = () => {
    setBarcode('');
    setResult(null);
    setNotFound(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Yang dipinjam adalah eksemplar fisik yang dipindai, bukan sembarang eksemplar judul ini.
  const copyAvailable = result?.copy.status === 'tersedia';
  const otherAvailable = result
    ? result.book.copies.filter((c) => c.status === 'tersedia' && c.barcode !== result.copy.barcode)
    : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Pindai Barcode Buku"
      maxWidth="max-w-md"
      footer={
        result ? (
          <>
            <Button variant="secondary" onClick={() => { onClose(); navigate(`/buku/${result.book.id}`); }}>
              Lihat Detail
            </Button>
            <Button
              onClick={() => { onClose(); navigate(`/mandiri?mode=pinjam&barcode=${encodeURIComponent(result.copy.barcode)}`); }}
              icon={<BookPlus size={16} />}
              disabled={!copyAvailable}
            >
              Pinjam Buku Ini
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
        )
      }
    >
      {!result ? (
        <div className="space-y-4">
          {/* Viewfinder simulasi kamera */}
          <div className="relative mx-auto w-full max-w-[16rem] aspect-square rounded-xl bg-navy-900 overflow-hidden">
            <span className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-white/70 rounded-tl-md" />
            <span className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-white/70 rounded-tr-md" />
            <span className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-white/70 rounded-bl-md" />
            <span className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-white/70 rounded-br-md" />
            <ScanLine size={72} strokeWidth={1.25} className="absolute inset-0 m-auto text-white/20" />
            <span className="absolute left-6 right-6 h-0.5 bg-brand-green shadow-[0_0_10px_2px_rgba(35,169,88,0.7)] animate-scan-line" />
            <p className="absolute bottom-3 inset-x-0 text-center text-[11px] text-white/60">
              Arahkan barcode ke dalam kotak
            </p>
          </div>

          {notFound && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-error-bg border border-error-border text-error text-sm animate-slide-up">
              <XCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>Barcode tidak dikenali. Coba lagi atau ketik manual.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-ink mb-1.5">Atau masukkan barcode manual</label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="mis. BK-SD-000328"
                className="flex-1 min-w-0 rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-action focus:shadow-focus outline-none transition-all"
              />
              <Button type="submit" icon={<ScanLine size={16} />}>Pindai</Button>
            </div>
          </form>

          <div>
            <p className="text-xs text-ink-muted mb-2">Contoh barcode (demo):</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_BARCODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => { setBarcode(code); doScan(code); }}
                  className="text-xs px-2 py-1 rounded-md bg-canvas border border-line text-navy hover:border-navy-200 font-mono transition-all"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={rescan}
            className="inline-flex items-center gap-1.5 text-sm text-action hover:underline"
          >
            <RotateCcw size={14} /> Pindai buku lain
          </button>

          <div className="flex gap-4">
            <BookCover hue={result.book.coverHue} title={result.book.title} author={result.book.author} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Badge variant="navy" size="sm">{result.book.category}</Badge>
                {result.book.isNew && <Badge variant="info" size="sm">Baru</Badge>}
              </div>
              <h3 className="text-base font-semibold text-ink leading-tight">{result.book.title}</h3>
              <p className="text-sm text-ink-muted">{result.book.author} · {result.book.year}</p>
              <p className="text-xs text-ink-muted/80 font-mono mt-1">{result.copy.barcode} · Eks. {result.copy.copyNumber}</p>
            </div>
          </div>

          <div className="p-3 rounded-md border border-line bg-canvas/40 space-y-2">
            {copyAvailable ? (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 size={16} />
                <span className="font-medium">Eksemplar ini tersedia untuk dipinjam</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm text-warning">
                <Clock size={16} className="flex-shrink-0 mt-0.5" />
                <span className="font-medium">
                  {otherAvailable.length > 0
                    ? `Eksemplar ini tidak dapat dipinjam — ${otherAvailable.length} eksemplar lain tersedia (Unit ${Array.from(new Set(otherAvailable.map((c) => c.unit))).join(', ')})`
                    : 'Eksemplar ini tidak dapat dipinjam — bisa direservasi lewat detail'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <MapPin size={14} />
              <span>{result.copy.unit} · {result.copy.shelf} · {result.copy.callNumber}</span>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
