# Mockup-NUFA

Mockup UI **Sistem Perpustakaan Terpadu SIT Nurul Fajri** — pengelolaan koleksi dan
layanan perpustakaan unit SD, SMP, dan SMA dalam satu tampilan.

Prototipe ini memakai data simulasi (`src/lib/data.ts`) untuk keperluan demonstrasi,
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

Peran juga bisa ditukar kapan saja lewat menu profil di kanan atas.

## Struktur

```
src/
  components/
    layout/       AdminLayout (internal) & PublicLayout (OPAC)
    ui/           Button, Card, Badge, Dialog, Drawer, Table, Toast, dll.
    Charts.tsx    LineChart, BarChartH, DonutChart (SVG murni)
  lib/
    data.ts       Seluruh data simulasi
    format.ts     Pemformatan angka, tanggal, waktu (locale id-ID)
    store.ts      Hook useRoute, useRoleState, useToasts
  pages/          LoginPage, YayasanDashboard, PustakawanDashboard,
                  SirkulasiPage, OpacPage, BookDetailPage
  types.ts        Tipe bersama
```

Impor modul memakai alias `@/` yang menunjuk ke `src/`
(misal `@/components/ui/Button`).
