export type Role = 'yayasan' | 'pustakawan' | 'siswa';
export type Unit = 'SD' | 'SMP' | 'SMA' | 'SEMUA';
export type BookStatus = 'tersedia' | 'dipinjam' | 'direservasi' | 'tidak-dapat-dipinjam';
export type CirculationTab = 'peminjaman' | 'pengembalian' | 'perpanjangan';
export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Book {
  id: string;
  barcode: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  category: string;
  language: string;
  synopsis: string;
  coverHue: number;
  copies: BookCopy[];
  popular?: boolean;
  isNew?: boolean;
}

export interface BookCopy {
  unit: Unit;
  shelf: string;
  callNumber: string;
  status: BookStatus;
  copyNumber: number;
}

export interface Member {
  id: string;
  name: string;
  unit: Unit;
  status: 'aktif' | 'diblokir' | 'menunggu';
  activeLoans: number;
  overdueCount: number;
  restriction?: string;
  avatarHue: number;
  joinedDate: string;
  category: 'siswa' | 'guru' | 'staf';
}

export interface ScannedBook {
  barcode: string;
  title: string;
  status: 'siap' | 'sudah-dipinjam' | 'tidak-tersedia' | 'duplikat' | 'tidak-ditemukan';
  dueDate?: string;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface AttentionItem {
  id: string;
  text: string;
  severity: 'warning' | 'error' | 'info';
  unit?: Unit;
  action: string;
}

export interface ActivityItem {
  id: string;
  type: 'peminjaman' | 'pengembalian' | 'reservasi' | 'pengadaan' | 'anggota' | 'stock-opname';
  description: string;
  actor: string;
  time: string;
}

export interface MetricBreakdown {
  SD: number;
  SMP: number;
  SMA: number;
}
