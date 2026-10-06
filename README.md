# Mockup-NUFA

Mockup UI **Sistem Perpustakaan Terpadu SIT Nurul Fajri** — pengelolaan koleksi dan
layanan perpustakaan unit SD, SMP, dan SMA dalam satu tampilan.

Prototipe ini memakai data simulasi (`src/lib/data.ts`, `src/lib/catalog.ts`) untuk keperluan demonstrasi,
bukan data aktual SIT Nurul Fajri. Tidak ada backend maupun basis data.

## Stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS 3 dengan token warna kustom (`tailwind.config.js`)
- Ikon dari `lucide-react`
- Routing berbasis hash tanpa library (`src/lib/store.ts`)

## Menjalankan

```bash
npm install
npm run dev
```

## Skrip

| Perintah            | Keterangan                        |
| ------------------- | --------------------------------- |
| `npm run dev`       | Menjalankan dev server Vite       |
| `npm run build`     | Build produksi ke `dist/`         |
| `npm run preview`   | Meninjau hasil build              |
| `npm run lint`      | Menjalankan ESLint                |
| `npm run typecheck` | Memeriksa tipe tanpa emit berkas  |

## Peran demo

Halaman login tidak melakukan autentikasi. Peran ditentukan dari ID yang diisi,
atau lewat tiga tombol pintasan di bawah formulir:

| Peran      | Rute awal     | Tampilan                      |
| ---------- | ------------- | ----------------------------- |
| Yayasan    | `#/yayasan`   | Dashboard ringkasan lintas unit |
| Pustakawan | `#/pustakawan`| Beranda operasional + sirkulasi |
| Siswa      | `#/opac`      | Katalog publik (OPAC)         |

Peran juga bisa ditukar kapan saja lewat menu profil di kanan atas. Peran diturunkan
dari rute, jadi tetap benar setelah halaman di-refresh.

## Barcode demo

Barcode melekat pada **tiap eksemplar** (bukan per judul) dan memuat kode unit.

| Barcode          | Keterangan                                      |
| ---------------- | ----------------------------------------------- |
| `SD-000124`      | Kartu anggota Aulia Rahma (aktif)               |
| `SMA-000031`     | Kartu anggota Citra Dewanti (diblokir)          |
| `BK-SD-000328`   | Petualangan di Hutan Tropis — tersedia          |
| `BK-SD-000219`   | Jejak Peradaban Nusantara — sedang dipinjam     |
| `BK-SMA-000087`  | Pengantar Filsafat Modern — tidak dapat dipinjam |

Katalog berisi **1.008 judul** (±2.570 eksemplar, 22 kategori): 8 judul kurasi di
`src/lib/data.ts` dipakai skenario demo di atas, sedangkan 1.000 judul lainnya
dibangkitkan oleh `src/lib/catalog.ts` memakai PRNG ber-seed — hasilnya selalu sama
setiap kali dimuat. Ubah `GENERATED_COUNT` di `data.ts` untuk menambah/mengurangi.

## Struktur

```
src/
  components/
    layout/       AdminLayout (internal) & PublicLayout (OPAC)
    ui/           Button, Card, Badge, Dialog, Drawer, Table, Toast, dll.
    Charts.tsx    LineChart, BarChartH, DonutChart (SVG murni)
    ScanDialog    Pemindai barcode simulasi di OPAC
  lib/
    catalog.ts    Generator katalog simulasi (deterministik)
    data.ts       Seluruh data simulasi + helper findCopyByBarcode, findMemberById
    format.ts     Pemformatan angka, tanggal, waktu (locale id-ID, tanggal lokal)
    store.ts      Hook useRoute, useToasts; roleFromRoute
  pages/
    LoginPage           Login + tombol peran demo
    YayasanDashboard    Ringkasan lintas unit (Yayasan)
    PustakawanDashboard Beranda operasional pustakawan
    SirkulasiPage       Sirkulasi berbantuan di meja pustakawan
    KoleksiPage, AnggotaPage, InventarisPage,
    PengadaanPage, LaporanPage, AdministrasiPage
                        Modul pustakawan lainnya
    OpacPage            Katalog publik + Pinjaman/Reservasi/Profil siswa
    BookDetailPage      Detail buku & reservasi
    SelfServicePage     Kios layanan mandiri (pinjam & kembali)
  types.ts        Tipe bersama
```

Impor modul memakai alias `@/` yang menunjuk ke `src/`
(misal `@/components/ui/Button`).
