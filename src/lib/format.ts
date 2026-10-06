/**
 * Ubah string/Date menjadi Date. String tanggal saja (YYYY-MM-DD) dibaca sebagai
 * tanggal lokal — `new Date('2026-10-06')` akan dibaca UTC dan bisa bergeser sehari.
 */
function toDate(date: Date | string): Date {
  if (typeof date !== 'string') return date;
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(date);
}

/** Kunci tanggal lokal YYYY-MM-DD (pengganti toISOString yang memakai UTC). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export function formatNumber(n: number): string {
  return n.toLocaleString('id-ID');
}

export function formatDate(date: Date | string): string {
  const d = toDate(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(date: Date | string): string {
  const d = toDate(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = toDate(date);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)}, ${formatTime(date)} WIB`;
}

export function relativeTime(date: Date | string): string {
  const d = toDate(date);
  const now = new Date();
  const diff = Math.abs(now.getTime() - d.getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return formatDateShort(d);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isOverdue(date: Date | string): boolean {
  const d = toDate(date);
  return d.getTime() < new Date().getTime();
}
