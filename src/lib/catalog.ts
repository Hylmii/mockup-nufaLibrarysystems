import type { Book, BookCopy, BookStatus, Unit } from '@/types';

/*
 * Generator katalog simulasi.
 *
 * Menghasilkan ribuan judul yang terlihat wajar (judul, penulis, ISBN valid, nomor
 * panggil DDC, eksemplar per unit dengan barcode unik). Memakai PRNG ber-seed agar
 * hasilnya SELALU SAMA di setiap muat ulang — barcode yang dipakai untuk demo tidak
 * berubah-ubah.
 */

type Kind = 'fiksi' | 'nonfiksi' | 'puisi' | 'biografi' | 'referensi';

interface CategorySpec {
  name: string;
  ddc: string;
  units: Unit[];
  kind: Kind;
  patterns: string[];
  topics: string[];
  /** Peluang buku berbahasa asing (selain Indonesia). */
  foreign?: { language: string; chance: number };
}

const CATEGORIES: CategorySpec[] = [
  {
    name: 'Fiksi Petualangan', ddc: '899.221', units: ['SD', 'SMP'], kind: 'fiksi',
    patterns: ['Petualangan di {x}', 'Misteri {x}', 'Rahasia {x}', 'Ekspedisi ke {x}', 'Tersesat di {x}', 'Legenda {x}'],
    topics: ['Pulau Seribu Bintang', 'Gua Kristal', 'Gunung Merapi', 'Lembah Sunyi', 'Hutan Kalimantan', 'Kota Tua Batavia',
      'Danau Toba', 'Selat Malaka', 'Pulau Komodo', 'Kerajaan Bawah Laut', 'Rimba Papua', 'Candi Tersembunyi'],
  },
  {
    name: 'Fiksi Anak', ddc: '899.221', units: ['SD'], kind: 'fiksi',
    patterns: ['Kisah {x}', '{x} yang Pemberani', 'Dongeng {x}', 'Sahabat {x}', 'Hari Pertama {x}'],
    topics: ['Kancil Cerdik', 'Kelinci Kecil', 'Burung Pipit', 'Gajah Sumatra', 'Kucing Oren', 'Anak Nelayan',
      'Pohon Beringin', 'Bintang Kecil', 'Penyu Hijau', 'Kupu-Kupu Biru', 'Semut Merah'],
  },
  {
    name: 'Novel Remaja', ddc: '899.221', units: ['SMP', 'SMA'], kind: 'fiksi',
    patterns: ['{x}', 'Di Balik {x}', 'Surat untuk {x}', 'Langit {x}', 'Sepotong {x}', 'Janji {x}'],
    topics: ['Senja', 'Hujan Bulan Juni', 'Rumah Kayu', 'Jendela Kelas', 'Kota Kembang', 'Musim Kemarau',
      'Sahabat Pena', 'Lapangan Sekolah', 'Bintang Jatuh', 'Pelangi Pagi'],
  },
  {
    name: 'Sains', ddc: '500', units: ['SD', 'SMP'], kind: 'nonfiksi',
    patterns: ['Mengenal {x}', 'Eksperimen Seru: {x}', 'Rahasia {x}', 'Ensiklopedia Mini {x}', 'Sains Asyik: {x}'],
    topics: ['Tata Surya', 'Cuaca dan Iklim', 'Gaya dan Gerak', 'Cahaya dan Bunyi', 'Energi Terbarukan', 'Magnet',
      'Air dan Kehidupan', 'Batuan dan Mineral', 'Gunung Berapi', 'Listrik Sederhana', 'Teknologi Sehari-hari', 'Lautan'],
  },
  {
    name: 'Fisika', ddc: '530', units: ['SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Konsep Dasar {x}', 'Bank Soal {x}', 'Memahami {x}', '{x} untuk Pelajar', 'Latihan Soal {x}'],
    topics: ['Mekanika Newton', 'Termodinamika', 'Gelombang dan Bunyi', 'Optika Geometri', 'Listrik Statis', 'Listrik Dinamis',
      'Fluida', 'Kinematika', 'Kemagnetan', 'Getaran Harmonik', 'Usaha dan Energi', 'Momentum'],
  },
  {
    name: 'Kimia', ddc: '540', units: ['SMA'], kind: 'nonfiksi',
    patterns: ['Praktikum {x}', 'Ringkasan {x}', 'Pengantar {x}', 'Kupas Tuntas {x}'],
    topics: ['Stoikiometri', 'Larutan Asam Basa', 'Senyawa Karbon', 'Ikatan Kimia', 'Termokimia', 'Laju Reaksi',
      'Elektrokimia', 'Sistem Periodik', 'Kesetimbangan Kimia', 'Koloid', 'Polimer'],
  },
  {
    name: 'Biologi', ddc: '570', units: ['SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Biologi: {x}', 'Mengenal {x}', 'Atlas {x}', 'Praktikum {x}'],
    topics: ['Sistem Pencernaan', 'Sistem Peredaran Darah', 'Ekosistem', 'Genetika', 'Evolusi', 'Mikroorganisme',
      'Fotosintesis', 'Keanekaragaman Hayati', 'Sistem Saraf', 'Reproduksi Tumbuhan', 'Jaringan Hewan', 'Bioteknologi'],
  },
  {
    name: 'Matematika', ddc: '510', units: ['SD', 'SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Asyiknya Belajar {x}', 'Bank Soal {x}', 'Trik Cepat {x}', 'Pembahasan Lengkap {x}', 'Mahir {x}'],
    topics: ['Pecahan', 'Bilangan Bulat', 'Bangun Datar', 'Aljabar', 'Statistika', 'Peluang',
      'Trigonometri', 'Kalkulus Dasar', 'Persamaan Linear', 'Logika Matematika', 'Barisan dan Deret', 'Matriks'],
  },
  {
    name: 'Sejarah', ddc: '959.8', units: ['SD', 'SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Sejarah {x}', 'Jejak {x}', 'Kisah {x}', 'Mengenal {x}'],
    topics: ['Kerajaan Majapahit', 'Kerajaan Sriwijaya', 'Perang Diponegoro', 'Sumpah Pemuda', 'Proklamasi Kemerdekaan',
      'Kesultanan Demak', 'Pergerakan Nasional', 'Kerajaan Mataram Islam', 'Revolusi Fisik', 'Jalur Rempah',
      'Kerajaan Kutai', 'Pertempuran Surabaya'],
  },
  {
    name: 'Geografi', ddc: '910', units: ['SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Geografi {x}', 'Atlas {x}', 'Mengenal {x}', 'Dinamika {x}'],
    topics: ['Indonesia', 'Asia Tenggara', 'Bencana Alam', 'Kependudukan', 'Sumber Daya Alam', 'Iklim Tropis',
      'Kepulauan Nusantara', 'Benua Afrika', 'Litosfer', 'Hidrosfer', 'Atmosfer'],
  },
  {
    name: 'Ekonomi', ddc: '330', units: ['SMA'], kind: 'nonfiksi',
    patterns: ['Ekonomi {x}', 'Pengantar {x}', 'Memahami {x}', 'Studi Kasus {x}'],
    topics: ['Koperasi', 'Pasar dan Harga', 'Kewirausahaan', 'Akuntansi Dasar', 'Perbankan Syariah', 'APBN',
      'Pajak', 'Perdagangan Internasional', 'Ketenagakerjaan', 'Inflasi', 'Pembangunan', 'Literasi Keuangan'],
  },
  {
    name: 'Agama Islam', ddc: '297', units: ['SD', 'SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Mengenal {x}', 'Belajar {x}', 'Buku Saku {x}', 'Mutiara {x}'],
    topics: ['Rukun Iman', 'Rukun Islam', 'Sirah Nabawiyah', 'Akhlak Mulia', 'Fikih Ibadah', 'Tajwid Praktis',
      'Kisah 25 Nabi', 'Adab Sehari-hari', 'Sejarah Kebudayaan Islam', 'Doa Harian', 'Para Sahabat Nabi', 'Zakat dan Sedekah'],
  },
  {
    name: 'Bahasa Indonesia', ddc: '499.221', units: ['SD', 'SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Terampil {x}', 'Panduan {x}', 'Mahir {x}', 'Latihan {x}'],
    topics: ['Menulis Cerpen', 'Membaca Cepat', 'Berpidato', 'Menulis Puisi', 'Ejaan Bahasa Indonesia', 'Teks Eksposisi',
      'Teks Narasi', 'Berbahasa Santun', 'Menulis Laporan', 'Berdiskusi', 'Meresensi Buku'],
  },
  {
    name: 'Bahasa Inggris', ddc: '420', units: ['SD', 'SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['{x} Made Easy', 'Practical {x}', 'Fun with {x}', 'Essential {x}', 'Mastering {x}'],
    topics: ['Grammar', 'Vocabulary', 'Conversation', 'Reading', 'Writing', 'Speaking',
      'Daily English', 'Phonics', 'Tenses', 'Pronunciation', 'Idioms'],
    foreign: { language: 'Inggris', chance: 0.7 },
  },
  {
    name: 'Bahasa Arab', ddc: '492.7', units: ['SD', 'SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Belajar {x}', 'Mudah Memahami {x}', 'Latihan {x}', 'Pengantar {x}', 'Buku Ajar {x}'],
    topics: ['Bahasa Arab Dasar', 'Nahwu', 'Sharaf', 'Muhadatsah', 'Mufradat', 'Imla', 'Qiraah', 'Khat Arab'],
    foreign: { language: 'Arab', chance: 0.4 },
  },
  {
    name: 'Komputer', ddc: '004', units: ['SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Belajar {x}', '{x} untuk Pemula', 'Panduan {x}', 'Proyek {x}'],
    topics: ['Pemrograman Python', 'Desain Grafis', 'Lembar Kerja', 'Jaringan Komputer', 'Algoritma', 'Scratch',
      'Robotika', 'Membuat Website', 'Keamanan Siber', 'Kecerdasan Buatan', 'Basis Data', 'Animasi 2D'],
  },
  {
    name: 'Seni & Budaya', ddc: '700', units: ['SD', 'SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Mengenal {x}', 'Seni {x}', 'Kreasi {x}', 'Pesona {x}'],
    topics: ['Batik Nusantara', 'Tari Tradisional', 'Wayang Kulit', 'Alat Musik Daerah', 'Origami', 'Kaligrafi',
      'Rumah Adat', 'Lagu Daerah', 'Kerajinan Bambu', 'Menggambar Sketsa', 'Teater Sekolah'],
  },
  {
    name: 'Biografi', ddc: '920', units: ['SD', 'SMP', 'SMA'], kind: 'biografi',
    patterns: ['Kisah Hidup {x}', 'Biografi {x}', 'Teladan dari {x}', 'Perjuangan {x}'],
    topics: ['Ki Hajar Dewantara', 'R.A. Kartini', 'Bung Hatta', 'Cut Nyak Dhien', 'B.J. Habibie', 'Buya Hamka',
      'Pangeran Diponegoro', 'Dewi Sartika', 'Mohammad Natsir', 'Jenderal Sudirman', 'Cut Meutia', 'K.H. Ahmad Dahlan'],
  },
  {
    name: 'Puisi', ddc: '811', units: ['SMP', 'SMA'], kind: 'puisi',
    patterns: ['Kumpulan Puisi: {x}', 'Antologi {x}', 'Sajak {x}', 'Puisi-Puisi {x}'],
    topics: ['Rindu Kampung', 'Daun Gugur', 'Laut Biru', 'Fajar Menyingsing', 'Ibu', 'Tanah Air',
      'Cahaya Pagi', 'Embun', 'Pelabuhan', 'Doa Malam'],
  },
  {
    name: 'Filsafat', ddc: '100', units: ['SMA'], kind: 'nonfiksi',
    patterns: ['Pengantar {x}', 'Memahami {x}', 'Dialog tentang {x}', 'Sejarah {x}'],
    topics: ['Filsafat Ilmu', 'Logika', 'Etika', 'Filsafat Islam', 'Pemikiran Al-Ghazali', 'Filsafat Yunani',
      'Berpikir Kritis', 'Estetika', 'Filsafat Pendidikan', 'Pemikiran Ibnu Sina'],
  },
  {
    name: 'Kesehatan', ddc: '613', units: ['SD', 'SMP', 'SMA'], kind: 'nonfiksi',
    patterns: ['Hidup Sehat: {x}', 'Panduan {x}', 'Mengenal {x}'],
    topics: ['Gizi Seimbang', 'Kesehatan Remaja', 'P3K di Sekolah', 'Olahraga Teratur', 'Kebersihan Diri',
      'Kesehatan Gigi', 'Pola Tidur', 'Kesehatan Mental', 'Bahaya Narkoba', 'Makanan Bergizi'],
  },
  {
    name: 'Ensiklopedia', ddc: '030', units: ['SD', 'SMP', 'SMA'], kind: 'referensi',
    patterns: ['Ensiklopedia {x}', 'Ensiklopedia Junior: {x}', 'Ensiklopedia Bergambar: {x}'],
    topics: ['Hewan', 'Tumbuhan', 'Tubuh Manusia', 'Luar Angkasa', 'Penemuan Dunia', 'Negara-Negara',
      'Dinosaurus', 'Laut', 'Teknologi', 'Budaya Indonesia', 'Pahlawan Nasional', 'Sains'],
  },
];

const FIRST_NAMES = [
  'Ahmad', 'Siti', 'Budi', 'Dewi', 'Rizki', 'Nur', 'Agus', 'Fitri', 'Hendra', 'Rina', 'Yusuf', 'Laila', 'Fajar', 'Indah',
  'Arif', 'Maya', 'Ilham', 'Ratna', 'Hasan', 'Wulan', 'Dimas', 'Aisyah', 'Bayu', 'Nadia', 'Taufik', 'Annisa', 'Rudi', 'Zahra',
];
const LAST_NAMES = [
  'Pratama', 'Wijaya', 'Saputra', 'Lestari', 'Hidayat', 'Kurniawan', 'Rahmawati', 'Nugroho', 'Santoso', 'Fauziah', 'Siregar',
  'Nasution', 'Harahap', 'Hakim', 'Rahman', 'Setiawan', 'Permana', 'Utami', 'Syahputra', 'Maulana', 'Gunawan', 'Firmansyah',
];
const PUBLISHERS = [
  'Pustaka Cendekia', 'Grafindo Litera', 'Media Akademika', 'Sastra Kita', 'Medika Edukasi', 'Cahaya Ilmu', 'Pelita Edukasi',
  'Lentera Pustaka', 'Nuansa Cendekia', 'Bintang Literasi', 'Samudra Ilmu', 'Pustaka Fajar',
];

const SYNOPSIS: Record<Kind, { open: string[]; close: string[] }> = {
  fiksi: {
    open: [
      'Kisah seru tentang {topic} yang mengajak {level} berpetualang sambil belajar tentang keberanian.',
      'Cerita hangat seputar {topic}, penuh persahabatan, kejujuran, dan kepedulian terhadap sesama.',
      'Sebuah cerita yang berlatar {topic}, menghadirkan tokoh-tokoh yang dekat dengan keseharian {level}.',
    ],
    close: [
      'Dilengkapi ilustrasi yang menarik di setiap bab.',
      'Cocok dibaca bersama teman maupun keluarga.',
      'Menyisipkan pesan moral tanpa terasa menggurui.',
    ],
  },
  nonfiksi: {
    open: [
      'Membahas {topic} secara runtut dengan bahasa yang mudah dipahami {level}.',
      'Panduan lengkap mengenai {topic}, disusun selaras dengan kurikulum untuk {level}.',
      'Mengupas {topic} dari konsep dasar hingga penerapannya dalam kehidupan sehari-hari.',
    ],
    close: [
      'Dilengkapi rangkuman dan latihan di setiap bab.',
      'Disertai contoh soal beserta pembahasannya.',
      'Memuat ilustrasi, tabel, dan diagram yang membantu pemahaman.',
    ],
  },
  puisi: {
    open: [
      'Kumpulan puisi bertema {topic} yang lembut dan reflektif.',
      'Antologi sajak tentang {topic}, ditulis dengan bahasa yang sederhana namun bermakna.',
    ],
    close: ['Cocok untuk {level} yang ingin mengenal keindahan sastra.', 'Disertai catatan singkat tentang proses kreatif penulis.'],
  },
  biografi: {
    open: [
      'Menelusuri perjalanan hidup {topic}, dari masa kecil hingga perjuangannya bagi bangsa.',
      'Kisah keteladanan {topic} yang ditulis untuk menginspirasi {level}.',
    ],
    close: ['Dilengkapi foto dan linimasa peristiwa penting.', 'Memuat kutipan-kutipan yang menggugah semangat.'],
  },
  referensi: {
    open: [
      'Buku referensi bergambar tentang {topic} untuk {level}.',
      'Rujukan lengkap seputar {topic}, disusun per entri agar mudah dicari.',
    ],
    close: ['Koleksi referensi — dibaca di tempat.', 'Dilengkapi indeks dan foto berwarna.'],
  },
};

/* ---------------------------------- PRNG ---------------------------------- */

/** mulberry32 — PRNG kecil ber-seed; hasil deterministik. */
function createRandom(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)];
  const shuffle = <T,>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  return { next, int, pick, shuffle };
}

/* --------------------------------- Helper --------------------------------- */

/** ISBN-13 (978-602-RRR-PPP-C) dengan digit cek yang valid: 12 digit badan + 1 digit cek. */
function isbn13(registrant: number, publication: number): string {
  const reg = String(registrant).padStart(3, '0');
  const pub = String(publication).padStart(3, '0');
  const body = `978602${reg}${pub}`;
  const sum = body.split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return `978-602-${reg}-${pub}-${check}`;
}

/** "siswa SD", "siswa SMP dan SMA", "siswa SD, SMP, dan SMA". */
function levelText(units: Unit[]): string {
  if (units.length === 1) return `siswa ${units[0]}`;
  if (units.length === 2) return `siswa ${units[0]} dan ${units[1]}`;
  return `siswa ${units.slice(0, -1).join(', ')}, dan ${units[units.length - 1]}`;
}

/* -------------------------------- Generator ------------------------------- */

export interface GenerateOptions {
  count: number;
  seed?: number;
  /** Judul yang sudah dipakai (mis. koleksi kurasi) agar tidak dobel. */
  reservedTitles?: Iterable<string>;
  /** Nomor barcode awal per unit (hindari bentrok dengan barcode kurasi). */
  barcodeStart?: number;
}

export function generateCatalog({ count, seed = 20260906, reservedTitles = [], barcodeStart = 1001 }: GenerateOptions): Book[] {
  const rnd = createRandom(seed);
  const used = new Set(reservedTitles);

  // Semua kombinasi judul per kategori, diacak sekali.
  const pools = CATEGORIES.map((spec) =>
    rnd.shuffle(spec.patterns.flatMap((p) => spec.topics.map((t) => ({ title: p.replace('{x}', t), topic: t })))),
  );

  // Ambil bergiliran antarkategori agar sebarannya merata.
  const picks: { spec: CategorySpec; specIndex: number; title: string; topic: string }[] = [];
  while (picks.length < count && pools.some((p) => p.length > 0)) {
    for (let i = 0; i < CATEGORIES.length && picks.length < count; i++) {
      let item = pools[i].pop();
      while (item && used.has(item.title)) item = pools[i].pop();
      if (!item) continue;
      used.add(item.title);
      picks.push({ spec: CATEGORIES[i], specIndex: i, title: item.title, topic: item.topic });
    }
  }

  const counters: Record<'SD' | 'SMP' | 'SMA', number> = { SD: barcodeStart, SMP: barcodeStart, SMA: barcodeStart };

  return picks.map(({ spec, specIndex, title, topic }, i) => {
    // Penulis
    const last = rnd.pick(LAST_NAMES);
    let author = `${rnd.pick(FIRST_NAMES)} ${last}`;
    const honor = rnd.next();
    if (honor < 0.12) author = `Dr. ${author}`;
    else if (honor < 0.24) author = `${author}, S.Pd.`;
    else if (honor < 0.32) author = `${author}, M.Pd.`;

    const year = 2025 - Math.floor(Math.pow(rnd.next(), 1.6) * 18);
    const language = spec.foreign && rnd.next() < spec.foreign.chance ? spec.foreign.language : 'Indonesia';
    const callNumber = `${spec.ddc}/${last.slice(0, 3).toUpperCase()}/${(title.match(/[A-Za-z]/)?.[0] ?? 'x').toLowerCase()}`;
    const letter = String.fromCharCode(65 + (specIndex % 26));

    // Unit yang memiliki judul ini (minimal satu), lalu 1–3 eksemplar per unit.
    const units = spec.units.filter(() => rnd.next() < 0.6);
    if (units.length === 0) units.push(rnd.pick(spec.units));

    const copies: BookCopy[] = [];
    for (const unit of units) {
      const shelf = `Rak ${letter}-${String(rnd.int(1, 8)).padStart(2, '0')}`;
      const r = rnd.next();
      const n = r < 0.5 ? 1 : r < 0.85 ? 2 : 3;
      for (let c = 1; c <= n; c++) {
        let status: BookStatus;
        if (spec.kind === 'referensi' && c === 1) {
          status = 'tidak-dapat-dipinjam';
        } else {
          const s = rnd.next();
          status = s < 0.7 ? 'tersedia' : s < 0.88 ? 'dipinjam' : s < 0.95 ? 'direservasi' : 'tidak-dapat-dipinjam';
        }
        const key = unit as 'SD' | 'SMP' | 'SMA';
        const barcode = `BK-${unit}-${String(counters[key]++).padStart(6, '0')}`;
        copies.push({ barcode, unit, shelf, callNumber, status, copyNumber: c });
      }
    }

    const level = levelText(units);
    const syn = SYNOPSIS[spec.kind];
    const synopsis = `${rnd.pick(syn.open)} ${rnd.pick(syn.close)}`
      .replace('{topic}', topic)
      .replace(/\{level\}/g, level);

    return {
      id: `bk-${String(1001 + i)}`,
      title,
      author,
      publisher: rnd.pick(PUBLISHERS),
      year,
      isbn: isbn13(700 + Math.floor(i / 1000), i % 1000),
      category: spec.name,
      language,
      synopsis,
      coverHue: rnd.int(0, 359),
      copies,
      popular: rnd.next() < 0.06,
      isNew: year >= 2024,
    };
  });
}

/** Nama ikon lucide per kategori (dipetakan ke komponen di OPAC). */
export const CATEGORY_ICONS: Record<string, string> = {
  'Fiksi Petualangan': 'Compass',
  'Fiksi Anak': 'Smile',
  'Novel Remaja': 'BookHeart',
  Sains: 'Atom',
  Fisika: 'Magnet',
  Kimia: 'FlaskConical',
  Biologi: 'Leaf',
  Matematika: 'Calculator',
  Sejarah: 'Scroll',
  Geografi: 'Globe',
  Ekonomi: 'TrendingUp',
  'Agama Islam': 'Moon',
  'Bahasa Indonesia': 'Languages',
  'Bahasa Inggris': 'MessageCircle',
  'Bahasa Arab': 'BookText',
  Komputer: 'Monitor',
  'Seni & Budaya': 'Palette',
  Biografi: 'UserRound',
  Puisi: 'PenLine',
  Filsafat: 'BrainCircuit',
  Kesehatan: 'HeartPulse',
  Ensiklopedia: 'Library',
};
