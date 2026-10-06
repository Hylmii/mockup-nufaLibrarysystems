import { addDays, toDateKey } from '@/lib/format';
import { generateCatalog, CATEGORY_ICONS } from '@/lib/catalog';
import type { Book, BookCopy, Member, AttentionItem, ActivityItem, MetricBreakdown } from '@/types';

// Koleksi kurasi — dipakai langsung oleh skenario demo (pinjaman, tugas pustakawan, contoh barcode).
const CURATED_BOOKS: Book[] = [
  {
    id: 'bk-001',
    title: 'Petualangan di Hutan Tropis',
    author: 'Maya Anggraini',
    publisher: 'Pustaka Cendekia',
    year: 2022,
    isbn: '978-602-1234-001-1',
    category: 'Fiksi Petualangan',
    language: 'Indonesia',
    synopsis:
      'Sebuah kisah petualangan lima sahabat yang tersesat di hutan tropis Kalimantan. Mereka belajar tentang keberanian, persahabatan, dan pentingnya menjaga alam.',
    coverHue: 145,
    copies: [
      { barcode: 'BK-SD-000328', unit: 'SD', shelf: 'Rak A-03', callNumber: '899.221/MAY/p', status: 'tersedia', copyNumber: 1 },
      { barcode: 'BK-SD-000329', unit: 'SD', shelf: 'Rak A-03', callNumber: '899.221/MAY/p', status: 'dipinjam', copyNumber: 2 },
      { barcode: 'BK-SMP-000214', unit: 'SMP', shelf: 'Rak B-07', callNumber: '899.221/MAY/p', status: 'dipinjam', copyNumber: 1 },
    ],
    popular: true,
    isNew: false,
  },
  {
    id: 'bk-002',
    title: 'Ensiklopedia Sains Dasar',
    author: 'Tim Edukasi Nusantara',
    publisher: 'Erlangga Pendidikan',
    year: 2023,
    isbn: '978-602-1234-002-8',
    category: 'Sains',
    language: 'Indonesia',
    synopsis:
      'Buku referensi sains untuk SD yang membahas biologi, fisika, dan kimia dengan bahasa sederhana dan ilustrasi menarik.',
    coverHue: 210,
    copies: [
      { barcode: 'BK-SD-000517', unit: 'SD', shelf: 'Rak C-01', callNumber: '503/TIM/e', status: 'dipinjam', copyNumber: 1 },
      { barcode: 'BK-SMP-000226', unit: 'SMP', shelf: 'Rak C-03', callNumber: '503/TIM/e', status: 'tersedia', copyNumber: 1 },
      { barcode: 'BK-SMA-000118', unit: 'SMA', shelf: 'Rak C-05', callNumber: '503/TIM/e', status: 'tersedia', copyNumber: 1 },
    ],
    popular: false,
    isNew: true,
  },
  {
    id: 'bk-003',
    title: 'Jejak Peradaban Nusantara',
    author: 'Dr. Hendra Wijaya',
    publisher: 'Media Akademika',
    year: 2021,
    isbn: '978-602-1234-003-5',
    category: 'Sejarah',
    language: 'Indonesia',
    synopsis:
      'Penelusuran jejak peradaban Nusantara dari era kerajaan hingga masa kemerdekaan, lengkap dengan peta dan dokumen sejarah.',
    coverHue: 30,
    copies: [
      { barcode: 'BK-SD-000219', unit: 'SD', shelf: 'Rak D-02', callNumber: '959/WIJ/j', status: 'dipinjam', copyNumber: 1 },
      { barcode: 'BK-SMP-000231', unit: 'SMP', shelf: 'Rak D-04', callNumber: '959/WIJ/j', status: 'tersedia', copyNumber: 1 },
      { barcode: 'BK-SMA-000096', unit: 'SMA', shelf: 'Rak D-06', callNumber: '959/WIJ/j', status: 'direservasi', copyNumber: 1 },
    ],
    popular: true,
    isNew: false,
  },
  {
    id: 'bk-004',
    title: 'Matematika Terapan untuk SMP',
    author: 'Sri Wahyuni',
    publisher: 'Grafindo Litera',
    year: 2023,
    isbn: '978-602-1234-004-2',
    category: 'Matematika',
    language: 'Indonesia',
    synopsis:
      'Pembahasan matematika SMP dengan pendekatan kontekstual, soal latihan bertingkat, dan kunci jawaban lengkap.',
    coverHue: 280,
    copies: [
      { barcode: 'BK-SMP-000104', unit: 'SMP', shelf: 'Rak E-01', callNumber: '510/WAH/m', status: 'tersedia', copyNumber: 1 },
      { barcode: 'BK-SMP-000105', unit: 'SMP', shelf: 'Rak E-01', callNumber: '510/WAH/m', status: 'tersedia', copyNumber: 2 },
      { barcode: 'BK-SMP-000106', unit: 'SMP', shelf: 'Rak E-01', callNumber: '510/WAH/m', status: 'dipinjam', copyNumber: 3 },
    ],
    popular: false,
    isNew: true,
  },
  {
    id: 'bk-005',
    title: 'Pengantar Filsafat Modern',
    author: 'Prof. Bambang Soelistyo',
    publisher: 'Pustaka Filsafat',
    year: 2020,
    isbn: '978-602-1234-005-9',
    category: 'Filsafat',
    language: 'Indonesia',
    synopsis:
      'Telaah pemikiran filsuf modern dari Descartes hingga Kant, dengan kaitan terhadap perkembangan ilmu pengetahuan kontemporer.',
    coverHue: 350,
    copies: [
      { barcode: 'BK-SMA-000087', unit: 'SMA', shelf: 'Rak F-03', callNumber: '190/SOE/p', status: 'tidak-dapat-dipinjam', copyNumber: 1 },
      { barcode: 'BK-SMA-000088', unit: 'SMA', shelf: 'Rak F-03', callNumber: '190/SOE/p', status: 'tersedia', copyNumber: 2 },
    ],
    popular: false,
    isNew: false,
  },
  {
    id: 'bk-006',
    title: 'Biologi Sel dan Molekuler',
    author: 'Dr. Sari Pranata',
    publisher: 'Medika Edukasi',
    year: 2024,
    isbn: '978-602-1234-006-6',
    category: 'Biologi',
    language: 'Indonesia',
    synopsis:
      'Buku ajar biologi SMA yang membahas struktur sel, genetika molekuler, dan bioteknologi dengan diagram berkualitas tinggi.',
    coverHue: 95,
    copies: [
      { barcode: 'BK-SMA-000142', unit: 'SMA', shelf: 'Rak G-02', callNumber: '571.6/PRA/b', status: 'tersedia', copyNumber: 1 },
      { barcode: 'BK-SMA-000143', unit: 'SMA', shelf: 'Rak G-02', callNumber: '571.6/PRA/b', status: 'tersedia', copyNumber: 2 },
      { barcode: 'BK-SMA-000144', unit: 'SMA', shelf: 'Rak G-02', callNumber: '571.6/PRA/b', status: 'dipinjam', copyNumber: 3 },
    ],
    popular: true,
    isNew: true,
  },
  {
    id: 'bk-007',
    title: 'Kumpulan Puisi: Jejak Hujan',
    author: 'Reni Marlina',
    publisher: 'Sastra Kita',
    year: 2022,
    isbn: '978-602-1234-007-3',
    category: 'Puisi',
    language: 'Indonesia',
    synopsis:
      'Antologi puisi yang mengangkat tema alam, keluarga, dan harapan, cocok untuk pembaca SMP dan SMA.',
    coverHue: 175,
    copies: [
      { barcode: 'BK-SD-000655', unit: 'SD', shelf: 'Rak A-06', callNumber: '811/MAR/j', status: 'tersedia', copyNumber: 1 },
      { barcode: 'BK-SMP-000188', unit: 'SMP', shelf: 'Rak B-05', callNumber: '811/MAR/j', status: 'tersedia', copyNumber: 1 },
      { barcode: 'BK-SMA-000167', unit: 'SMA', shelf: 'Rak F-08', callNumber: '811/MAR/j', status: 'dipinjam', copyNumber: 1 },
    ],
    popular: false,
    isNew: false,
  },
  {
    id: 'bk-008',
    title: 'Ekonomi Makro: Teori dan Praktik',
    author: 'Ahmad Fauzi',
    publisher: 'Ekonomi Press',
    year: 2023,
    isbn: '978-602-1234-008-0',
    category: 'Ekonomi',
    language: 'Indonesia',
    synopsis:
      'Pengantar ekonomi makro untuk SMA, mencakup inflasi, pertumbuhan ekonomi, dan kebijakan moneter dengan studi kasus Indonesia.',
    coverHue: 55,
    copies: [
      { barcode: 'BK-SMA-000203', unit: 'SMA', shelf: 'Rak H-01', callNumber: '339/FAU/e', status: 'tersedia', copyNumber: 1 },
      { barcode: 'BK-SMA-000204', unit: 'SMA', shelf: 'Rak H-01', callNumber: '339/FAU/e', status: 'direservasi', copyNumber: 2 },
    ],
    popular: false,
    isNew: false,
  },
];

/** Jumlah judul tambahan yang dibangkitkan otomatis (deterministik, lihat catalog.ts). */
const GENERATED_COUNT = 1000;

export const BOOKS: Book[] = [
  ...CURATED_BOOKS,
  ...generateCatalog({ count: GENERATED_COUNT, reservedTitles: CURATED_BOOKS.map((b) => b.title) }),
];

export const MEMBERS: Member[] = [
  {
    id: 'SD-000124',
    name: 'Aulia Rahma',
    unit: 'SD',
    status: 'aktif',
    activeLoans: 3,
    overdueCount: 1,
    restriction: undefined,
    avatarHue: 145,
    joinedDate: '2023-07-15',
    category: 'siswa',
  },
  {
    id: 'SMP-000056',
    name: 'Bagus Pratama',
    unit: 'SMP',
    status: 'aktif',
    activeLoans: 3,
    overdueCount: 0,
    restriction: undefined,
    avatarHue: 210,
    joinedDate: '2022-08-20',
    category: 'siswa',
  },
  {
    id: 'SMA-000031',
    name: 'Citra Dewanti',
    unit: 'SMA',
    status: 'diblokir',
    activeLoans: 2,
    overdueCount: 2,
    restriction: 'Diblokir karena 2 peminjaman terlambat belum dikembalikan',
    avatarHue: 350,
    joinedDate: '2021-09-10',
    category: 'siswa',
  },
  {
    id: 'SD-000098',
    name: 'Drs. Suparman',
    unit: 'SD',
    status: 'aktif',
    activeLoans: 0,
    overdueCount: 0,
    restriction: undefined,
    avatarHue: 30,
    joinedDate: '2020-01-05',
    category: 'guru',
  },
  {
    id: 'SMP-000041',
    name: 'Fitri Handayani',
    unit: 'SMP',
    status: 'menunggu',
    activeLoans: 2,
    overdueCount: 1,
    restriction: 'Menunggu verifikasi perpanjangan keanggotaan',
    avatarHue: 280,
    joinedDate: '2023-01-15',
    category: 'guru',
  },
];

export const YAYASAN_METRICS = {
  totalJudul: 8420,
  totalEksemplar: 11260,
  anggotaAktif: 1846,
  sedangDipinjam: 326,
  terlambat: 18,
  selisihStockOpname: 7,
};

export const ANGGOTA_BREAKDOWN: MetricBreakdown = { SD: 820, SMP: 560, SMA: 466 };
export const DIPINJAM_BREAKDOWN: MetricBreakdown = { SD: 148, SMP: 101, SMA: 77 };
export const TERLAMBAT_BREAKDOWN: MetricBreakdown = { SD: 8, SMP: 6, SMA: 4 };
export const SELISIH_BREAKDOWN: MetricBreakdown = { SD: 1, SMP: 5, SMA: 1 };

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'att-1',
    text: '18 peminjaman melewati jatuh tempo',
    severity: 'warning',
    action: 'Lihat Detail',
  },
  {
    id: 'att-2',
    text: '5 selisih stock opname Unit SMP belum diselesaikan',
    severity: 'warning',
    unit: 'SMP',
    action: 'Lihat Detail',
  },
  {
    id: 'att-3',
    text: '1 proses import anggota memerlukan peninjauan',
    severity: 'info',
    action: 'Lihat Detail',
  },
];

export const TREND_PINJAMAN = [
  { month: 'Jan', value: 280 },
  { month: 'Feb', value: 295 },
  { month: 'Mar', value: 340 },
  { month: 'Apr', value: 310 },
  { month: 'Mei', value: 365 },
  { month: 'Jun', value: 390 },
  { month: 'Jul', value: 420 },
  { month: 'Agu', value: 380 },
  { month: 'Sep', value: 326 },
];

export const AKTIVITAS_UNIT = [
  { unit: 'SD', peminjaman: 148, pengembalian: 132, reservasi: 24 },
  { unit: 'SMP', peminjaman: 101, pengembalian: 95, reservasi: 18 },
  { unit: 'SMA', peminjaman: 77, pengembalian: 71, reservasi: 12 },
];

export const CATEGORY_COMPOSITION = [
  { category: 'Fiksi', count: 2840, pct: 33.7 },
  { category: 'Sains', count: 1690, pct: 20.1 },
  { category: 'Sejarah', count: 1260, pct: 15.0 },
  { category: 'Pendidikan', count: 1180, pct: 14.0 },
  { category: 'Agama', count: 850, pct: 10.1 },
  { category: 'Lainnya', count: 600, pct: 7.1 },
];

export const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'peminjaman',
    description: 'Peminjaman "Petualangan di Hutan Tropis" oleh Aulia Rahma (SD-000124)',
    actor: 'Pustakawan SD',
    time: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'act-2',
    type: 'pengembalian',
    description: 'Pengembalian "Ensiklopedia Sains Dasar" oleh Bagus Pratama (SMP-000056)',
    actor: 'Pustakawan SMP',
    time: new Date(Date.now() - 22 * 60000).toISOString(),
  },
  {
    id: 'act-3',
    type: 'reservasi',
    description: 'Reservasi "Ekonomi Makro: Teori dan Praktik" oleh Citra Dewanti (SMA-000031)',
    actor: 'Sistem Otomatis',
    time: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'act-4',
    type: 'anggota',
    description: 'Pendaftaran anggota baru: Daffa Rahman (SD-000201)',
    actor: 'Pustakawan SD',
    time: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'act-5',
    type: 'pengadaan',
    description: 'Pengadaan 15 eksemplar baru kategori Biologi',
    actor: 'Pustakawan SMA',
    time: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'act-6',
    type: 'stock-opname',
    description: 'Stock opname Unit SMP — 78% selesai, 5 selisih ditemukan',
    actor: 'Pustakawan SMP',
    time: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

/** Kategori beserta jumlah judul sebenarnya di katalog, urut terbanyak. */
export const POPULAR_CATEGORIES = Array.from(
  BOOKS.reduce((map, b) => map.set(b.category, (map.get(b.category) ?? 0) + 1), new Map<string, number>()),
  ([name, count]) => ({ name, icon: CATEGORY_ICONS[name] ?? 'Library', count }),
).sort((a, b) => b.count - a.count);

export const PUSTAKAWAN_TASKS = {
  dueToday: [
    { member: 'Aulia Rahma', memberId: 'SD-000124', title: 'Petualangan di Hutan Tropis', barcode: 'BK-SD-000329', dueDate: addDaysStr(0) },
    { member: 'Bagus Pratama', memberId: 'SMP-000056', title: 'Matematika Terapan untuk SMP', barcode: 'BK-SMP-000106', dueDate: addDaysStr(0) },
  ],
  overdue: [
    { member: 'Citra Dewanti', memberId: 'SMA-000031', title: 'Biologi Sel dan Molekuler', barcode: 'BK-SMA-000144', dueDate: addDaysStr(-5), daysLate: 5 },
    { member: 'Aulia Rahma', memberId: 'SD-000124', title: 'Jejak Peradaban Nusantara', barcode: 'BK-SD-000219', dueDate: addDaysStr(-3), daysLate: 3 },
    { member: 'Citra Dewanti', memberId: 'SMA-000031', title: 'Kumpulan Puisi: Jejak Hujan', barcode: 'BK-SMA-000167', dueDate: addDaysStr(-2), daysLate: 2 },
    { member: 'Fitri Handayani', memberId: 'SMP-000041', title: 'Petualangan di Hutan Tropis', barcode: 'BK-SMP-000214', dueDate: addDaysStr(-1), daysLate: 1 },
  ],
  reservations: [
    { member: 'Citra Dewanti', memberId: 'SMA-000031', title: 'Ekonomi Makro: Teori dan Praktik', status: 'Siap Diambil' },
    { member: 'Fitri Handayani', memberId: 'SMP-000041', title: 'Matematika Terapan untuk SMP', status: 'Menunggu' },
  ],
  stockOpname: {
    unit: 'SMP',
    progress: 78,
    scanned: 890,
    total: 1140,
    discrepancies: 5,
  },
  importIssues: [
    { fileName: 'import_anggota_sma_2024.csv', issue: '3 baris memiliki format tanggal lahir tidak valid', rows: 3 },
  ],
};

function addDaysStr(days: number): string {
  return toDateKey(addDays(new Date(), days));
}

/** Pinjaman aktif anggota demo (Aulia Rahma) — dipakai tab Pinjaman Saya & Profil di OPAC. */
export const MEMBER_LOANS = [
  { memberId: 'SD-000124', barcode: 'BK-SD-000517', daysOffset: 5 },  // aman
  { memberId: 'SD-000124', barcode: 'BK-SD-000329', daysOffset: 0 },  // jatuh tempo hari ini
  { memberId: 'SD-000124', barcode: 'BK-SD-000219', daysOffset: -3 }, // lewat jatuh tempo
];

export interface CopyMatch {
  book: Book;
  copy: BookCopy;
}

// Indeks barcode → eksemplar, dibangun sekali agar pencarian tetap instan di ribuan eksemplar.
const COPY_INDEX = new Map<string, CopyMatch>(
  BOOKS.flatMap((book) => book.copies.map((copy) => [copy.barcode.toLowerCase(), { book, copy }] as const)),
);

/** Cari eksemplar dari barcode-nya (tidak peka huruf besar/kecil, spasi diabaikan). */
export function findCopyByBarcode(barcode: string): CopyMatch | undefined {
  return COPY_INDEX.get(barcode.trim().toLowerCase());
}

export function findBookByBarcode(barcode: string): Book | undefined {
  return findCopyByBarcode(barcode)?.book;
}

/** Barcode contoh untuk tombol demo: satu eksemplar per judul, pilih yang tersedia bila ada. */
export function sampleBarcodes(count: number, onlyAvailable = false): string[] {
  return CURATED_BOOKS.flatMap((b) => {
    const copy = b.copies.find((c) => c.status === 'tersedia') ?? (onlyAvailable ? undefined : b.copies[0]);
    return copy ? [copy.barcode] : [];
  }).slice(0, count);
}

export function findMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id.toLowerCase() === id.toLowerCase().trim());
}
