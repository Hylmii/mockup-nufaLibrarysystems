# PRD — Sistem Perpustakaan Terpadu SIT Nurul Fajri

**Product Requirements Document**
Powered by IKODIO · Status dokumen: Draf untuk prototipe (mockup)
Terakhir diperbarui: 12 September 2026

---

## 1. Ringkasan Eksekutif

Sistem Perpustakaan Terpadu SIT Nurul Fajri adalah aplikasi web untuk mengelola koleksi
dan layanan perpustakaan tiga unit sekolah (SD, SMP, SMA) dalam satu platform terintegrasi.
Sistem melayani tiga peran: **Manajemen Yayasan** (pemantauan lintas unit), **Pustakawan**
(operasional harian per unit), dan **Siswa** (katalog publik/OPAC dan layanan mandiri).

Ciri utama yang membedakan sistem ini: **peminjaman dan pengembalian bersifat self-service**.
Siswa datang membawa kartu anggota ber-barcode, memindai kartu dan buku sendiri di kios,
tanpa harus antre di meja petugas. Saat mengembalikan, layar menampilkan lokasi rak tempat
buku harus diletakkan.

Dokumen saat ini menggambarkan prototipe berbasis **data simulasi** — belum terhubung ke
backend/basis data nyata. Bagian [§12 Status Implementasi](#12-status-implementasi) merinci
mana yang sudah fungsional dan mana yang masih placeholder.

---

## 2. Latar Belakang & Masalah

SIT Nurul Fajri mengelola perpustakaan di tiga jenjang (SD, SMP, SMA) yang selama ini
cenderung terpisah. Beberapa masalah yang ingin diselesaikan:

| # | Masalah | Dampak |
|---|---------|--------|
| M1 | Data koleksi & anggota tersebar per unit | Sulit melihat gambaran menyeluruh, laporan manual |
| M2 | Peminjaman/pengembalian bergantung pada petugas di meja | Antrean, beban kerja pustakawan tinggi |
| M3 | Sulit menemukan lokasi rak saat menata buku kembali | Buku salah rak, sulit ditemukan pembaca berikutnya |
| M4 | Stock opname manual | Selisih inventaris tidak cepat terdeteksi |
| M5 | Yayasan tidak punya visibilitas real-time lintas unit | Keputusan pengadaan/anggaran kurang berbasis data |

---

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan Produk
- **T1** — Menyatukan pengelolaan koleksi, anggota, dan sirkulasi tiga unit dalam satu sistem.
- **T2** — Memungkinkan peminjaman & pengembalian mandiri (self-service) berbasis barcode.
- **T3** — Memberi panduan penataan rak otomatis saat pengembalian.
- **T4** — Menyediakan dashboard pemantauan untuk Yayasan dan operasional untuk Pustakawan.
- **T5** — Mempermudah stock opname, pengadaan, dan pelaporan.

### 3.2 Metrik Keberhasilan (target saat produksi)
| Metrik | Target |
|--------|--------|
| Transaksi sirkulasi via self-service | ≥ 70% dari total |
| Rata-rata waktu pinjam mandiri | ≤ 60 detik |
| Akurasi lokasi rak saat pengembalian | ≥ 98% |
| Selisih stock opname per unit | ≤ 1% dari total eksemplar |
| Kepuasan pustakawan (berkurangnya beban meja) | Kualitatif, survei |

---

## 4. Ruang Lingkup

### 4.1 Termasuk (In Scope)
- Autentikasi & pemilihan peran (Yayasan, Pustakawan, Siswa).
- OPAC publik: pencarian, kategori, detail buku, reservasi.
- Scanner barcode buku di OPAC (lihat detail + pinjam langsung).
- Kios Layanan Mandiri: peminjaman & pengembalian.
- Modul Pustakawan: Beranda, Sirkulasi (berbantuan), Koleksi, Anggota, Inventaris/Stock Opname, Pengadaan, Laporan, Administrasi.
- Dashboard Yayasan: ringkasan metrik lintas unit, grafik, item perhatian.
- Sistem desain & tema visual (branding hijau Nurul Fajri).

### 4.2 Tidak Termasuk (Out of Scope — tahap ini)
- Backend, basis data, dan API nyata (saat ini data simulasi).
- Integrasi perangkat keras pemindai fisik (disimulasikan lewat input barcode).
- Pembayaran denda daring.
- Notifikasi email/WhatsApp.
- Aplikasi mobile native.
- Sub-halaman modul Yayasan selain Ringkasan (belum dibuat).

---

## 5. Persona & Peran Pengguna

| Peran | Contoh Pengguna | Kebutuhan Utama | Titik Akses Awal |
|-------|-----------------|-----------------|------------------|
| **Manajemen Yayasan** | H. Abdurrahman, M.Pd. (Ketua Yayasan) | Visibilitas lintas unit, laporan, item yang perlu perhatian | `#/yayasan` |
| **Pustakawan** | Sri Mulyani, S.IP. (Pustakawan Unit SD) | Sirkulasi, kelola koleksi & anggota, stock opname, pengadaan | `#/pustakawan` |
| **Siswa / Anggota** | Aulia Rahma (SD-000124) | Cari buku, pinjam/kembalikan mandiri, lihat pinjaman & reservasi | `#/opac` |

Catatan: Guru dan staf juga merupakan kategori anggota (`siswa | guru | staf`) dan memakai
antarmuka yang sama dengan siswa.

---

## 6. Alur Pengguna Utama

### 6.1 Peminjaman Mandiri (Siswa) — inti produk
1. Siswa membuka **Layanan Mandiri → Pinjam Buku** (atau menekan "Pinjam" dari hasil scan di OPAC).
2. **Pindai kartu anggota** (barcode = ID anggota). Sistem memverifikasi status.
   - Jika **diblokir** → transaksi ditolak, diarahkan ke pustakawan.
3. **Pindai barcode tiap buku**. Sistem memvalidasi ketersediaan eksemplar unit terkait.
4. Sistem menghitung **jatuh tempo (+7 hari)** dan menampilkan daftar.
5. Siswa menekan **Konfirmasi** → tampil **struk** (nomor transaksi, anggota, jatuh tempo, daftar buku).
6. Buku dapat langsung dibawa.

### 6.2 Pengembalian Mandiri (Siswa)
1. Siswa membuka **Layanan Mandiri → Kembalikan Buku** (atau menekan "Kembalikan" pada daftar Pinjaman Saya).
2. **Pindai barcode buku**.
3. Sistem menampilkan **panel lokasi rak** secara menonjol: **Unit, Rak, Nomor Panggil**.
4. Siswa meletakkan buku sesuai petunjuk. Daftar buku yang dikembalikan pada sesi ini terekam.

### 6.3 Pencarian & Scan di OPAC (Siswa)
1. Siswa mencari via kotak pencarian (judul/penulis/ISBN/kategori) **atau** menekan tombol **Scan**.
2. Scan barcode → kartu hasil menampilkan sampul, ketersediaan, lokasi.
3. Pilihan: **Lihat Detail** (halaman buku) atau **Pinjam Buku Ini** (masuk alur 6.1).

### 6.4 Operasional Pustakawan
- Beranda → ringkasan transaksi hari ini, antrean jatuh tempo/terlambat, reservasi, stock opname, isu import.
- Quick action: Mulai Peminjaman, Proses Pengembalian, Tambah Buku, Daftarkan Anggota, Mulai Stock Opname, Import Data.

### 6.5 Pemantauan Yayasan
- Dashboard metrik ringkas + grafik tren/komposisi/aktivitas + daftar "Perlu Perhatian" (drawer detail).

---

## 7. Kebutuhan Fungsional

Kode status: **✅ Terimplementasi (mockup)** · **🟡 Sebagian** · **⬜ Placeholder/Belum**

### 7.1 Autentikasi & Peran
| ID | Kebutuhan | Status |
|----|-----------|--------|
| AUTH-1 | Halaman login dengan ID pengguna & kata sandi | ✅ (tanpa validasi kata sandi) |
| AUTH-2 | Penentuan peran dari pola ID (mengandung "yayasan/ketua", "siswa/guru", selain itu pustakawan) | ✅ |
| AUTH-3 | Tombol demo untuk masuk cepat per peran | ✅ |
| AUTH-4 | Pengalih peran ("Mode Demo") di menu profil | ✅ |
| AUTH-5 | Autentikasi nyata + otorisasi/route guard | ⬜ |

### 7.2 OPAC (Siswa)
| ID | Kebutuhan | Status |
|----|-----------|--------|
| OPAC-1 | Beranda: hero pencarian, kategori populer, koleksi baru | ✅ |
| OPAC-2 | Pencarian & filter (kategori, tahun, tersedia saja) client-side | ✅ |
| OPAC-3 | Tombol **Scan** di samping pencarian → dialog scanner | ✅ |
| OPAC-4 | Halaman detail buku (info, sinopsis, eksemplar per unit, reservasi) | ✅ |
| OPAC-5 | Tab Pinjaman Saya dengan status & **opsi Kembalikan** | ✅ |
| OPAC-6 | Peringatan buku **lewat jatuh tempo** (banner + per-item) | ✅ |
| OPAC-7 | Tab Reservasi Saya | ✅ (data contoh) |
| OPAC-8 | Tab Profil anggota | ✅ (data contoh) |

### 7.3 Scanner Barcode (OPAC)
| ID | Kebutuhan | Status |
|----|-----------|--------|
| SCAN-1 | Viewfinder simulasi + input barcode manual + contoh barcode | ✅ |
| SCAN-2 | Temukan buku via `findBookByBarcode`, tampilkan hasil | ✅ |
| SCAN-3 | Aksi Lihat Detail → `/buku/:id` | ✅ |
| SCAN-4 | Aksi Pinjam → `/mandiri?mode=pinjam&book=:id` | ✅ |
| SCAN-5 | Integrasi pemindai kamera/HID nyata | ⬜ |

### 7.4 Layanan Mandiri (Kios)
| ID | Kebutuhan | Status |
|----|-----------|--------|
| SELF-1 | Beranda kios: pilihan Pinjam / Kembalikan + panduan langkah | ✅ |
| SELF-2 | Pinjam: scan kartu → verifikasi → scan buku → konfirmasi → struk | ✅ |
| SELF-3 | Tolak anggota berstatus diblokir | ✅ |
| SELF-4 | Hitung jatuh tempo +7 hari | ✅ |
| SELF-5 | Kembalikan: scan buku → tampilkan **lokasi rak** (Unit/Rak/No. Panggil) | ✅ |
| SELF-6 | Pra-isi buku dari daftar Pinjaman Saya (`?book=`) | ✅ |
| SELF-7 | Mutasi status eksemplar & catatan transaksi permanen | ⬜ (simulasi) |

### 7.5 Modul Pustakawan
| ID | Modul | Kemampuan (mockup) | Status |
|----|-------|--------------------|--------|
| LIB-1 | Beranda | Ringkasan transaksi, antrean, stock opname, isu import, aktivitas | ✅ |
| LIB-2 | Sirkulasi (berbantuan) | Cari anggota → scan buku → validasi → konfirmasi → resi; tab Peminjaman/Pengembalian/Perpanjangan | 🟡 (tab pengembalian/perpanjangan berbagi logika peminjaman) |
| LIB-3 | Koleksi | Statistik, cari/filter, tabel buku, Tambah Buku (dialog) | ✅ |
| LIB-4 | Anggota | Statistik, filter, tabel anggota, Daftarkan Anggota (dialog) | ✅ |
| LIB-5 | Inventaris | Status opname, sesi scan interaktif (sesuai/selisih), tabel selisih | ✅ |
| LIB-6 | Pengadaan | Ringkasan anggaran, daftar usulan berstatus, Ajukan Pengadaan (dialog) | ✅ |
| LIB-7 | Laporan | Filter periode/unit, metrik, grafik, buku terpopuler, ekspor | ✅ (ekspor = simulasi) |
| LIB-8 | Administrasi | Import Data (dropzone+riwayat+isu), Kebijakan, Kategori | ✅ (aksi = simulasi) |

### 7.6 Dashboard Yayasan
| ID | Kebutuhan | Status |
|----|-----------|--------|
| YAY-1 | Kartu metrik (judul, eksemplar, anggota, dipinjam, terlambat, selisih) dengan breakdown unit | ✅ |
| YAY-2 | Grafik tren peminjaman, komposisi koleksi, aktivitas per unit | ✅ |
| YAY-3 | Daftar "Perlu Perhatian" + drawer detail | ✅ |
| YAY-4 | Ekspor laporan | ✅ (simulasi/toast) |
| YAY-5 | Filter periode & unit benar-benar memfilter data | ⬜ (belum berpengaruh) |
| YAY-6 | Sub-halaman: Perbandingan Unit, Koleksi, Sirkulasi, Stock Opname, Laporan | ⬜ (fallback ke Ringkasan) |

### 7.7 Notifikasi
| ID | Kebutuhan | Status |
|----|-----------|--------|
| NOTIF-1 | Toast (success/warning/error/info) auto-dismiss 5 detik | ✅ |
| NOTIF-2 | Dropdown notifikasi di topbar admin | ✅ (isi statis) |

---

## 8. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|----------|-----------|
| **Kegunaan** | Alur kios ramah pengguna awam; target sentuh besar; fokus otomatis pada kolom scan. |
| **Aksesibilitas** | Kontras teks memenuhi WCAG AA (teks di atas foto pakai overlay + bayangan; wordmark hijau gelap ≥ 4.5:1); label `aria` pada tombol ikon; navigasi keyboard pada dialog (Esc menutup). |
| **Responsif** | Layout beradaptasi mobile → desktop; sidebar admin menjadi drawer di layar kecil. |
| **Performa** | Aset gambar dioptimasi (foto latar & logo dikompres); bundel produksi tunggal. |
| **Lokalisasi** | Seluruh antarmuka Bahasa Indonesia; format tanggal/angka `id-ID`. |
| **Konsistensi visual** | Satu sistem desain (token warna, radius, bayangan, animasi). |
| **Keandalan build** | Lolos `typecheck`; build produksi sukses. |

---

## 9. Model Data (Entitas)

Definisi tipe berada di `src/types.ts`; data contoh di `src/lib/data.ts`.

### 9.1 Enum & Tipe Dasar
- `Role`: `yayasan | pustakawan | siswa`
- `Unit`: `SD | SMP | SMA | SEMUA`
- `BookStatus`: `tersedia | dipinjam | direservasi | tidak-dapat-dipinjam`
- `CirculationTab`: `peminjaman | pengembalian | perpanjangan`
- `ToastType`: `success | warning | error | info`

### 9.2 Entitas Inti
| Entitas | Field kunci |
|---------|-------------|
| **Book** | id, barcode, title, author, publisher, year, isbn, category, language, synopsis, coverHue, copies[], popular?, isNew? |
| **BookCopy** | unit, shelf, callNumber, status, copyNumber |
| **Member** | id, name, unit, status (`aktif/diblokir/menunggu`), activeLoans, overdueCount, restriction?, avatarHue, joinedDate, category (`siswa/guru/staf`) |
| **ScannedBook** | barcode, title, status, dueDate? |
| **AttentionItem** | id, text, severity, unit?, action |
| **ActivityItem** | id, type, description, actor, time |
| **MetricBreakdown** | SD, SMP, SMA |

### 9.3 Relasi & Logika Penting
- Sebuah **Book** memiliki banyak **BookCopy** yang tersebar di beberapa unit.
- **Barcode buku** memuat prefiks unit (`BK-SD-…`, `BK-SMP-…`, `BK-SMA-…`). Prefiks ini
  dipakai untuk menemukan eksemplar & **lokasi rak** yang tepat saat pengembalian
  (fungsi `resolveCopy`).
- **Jatuh tempo** = tanggal pinjam + 7 hari (kebijakan default; dapat dikonfigurasi di Administrasi).
- Helper pencarian: `findBookByBarcode`, `findMemberById` (case-insensitive, ter-trim).

### 9.4 Data Simulasi (ringkas)
8 judul buku, 5 anggota contoh, metrik yayasan (8.420 judul, 11.260 eksemplar, 1.846 anggota
aktif, 326 dipinjam, 18 terlambat, 7 selisih), tren peminjaman 9 bulan, komposisi 6 kategori,
dan daftar tugas pustakawan (stock opname, isu import, reservasi, jatuh tempo).

---

## 10. Arsitektur & Teknologi

| Aspek | Keterangan |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 dengan token kustom (`tailwind.config.js`) |
| **Ikon** | lucide-react |
| **Routing** | Berbasis hash tanpa library (`useRoute` di `src/lib/store.ts`) — `window.location.hash` + event `hashchange` |
| **State** | Lokal via hooks (`useRoute`, `useRoleState`, `useToasts`); prop drilling; tanpa store global |
| **Data** | Konstanta modul (`src/lib/data.ts`); tanpa backend/persistensi |
| **Alias impor** | `@/` → `src/` |
| **Skrip** | `dev`, `build`, `preview`, `lint`, `typecheck` |

Catatan: `@supabase/supabase-js` terpasang tetapi belum digunakan — kandidat penyedia
backend saat integrasi nyata.

### 10.1 Peta Rute
| Rute (hash) | Halaman | Peran |
|-------------|---------|-------|
| `/login`, `/` | LoginPage | Semua |
| `/opac` (+ `?tab=`) | OpacPage (beranda/cari/kategori/pinjaman/reservasi/profil) | Siswa |
| `/buku/:id` | BookDetailPage | Siswa |
| `/mandiri` (+ `?mode=pinjam\|kembali&book=`) | SelfServicePage | Siswa |
| `/yayasan*` | YayasanDashboard | Yayasan |
| `/sirkulasi` | SirkulasiPage | Pustakawan |
| `/pustakawan` | PustakawanDashboard | Pustakawan |
| `/pustakawan/koleksi` (`?action=tambah`) | KoleksiPage | Pustakawan |
| `/pustakawan/anggota` (`?action=daftar`) | AnggotaPage | Pustakawan |
| `/pustakawan/inventaris` (`?action=mulai`) | InventarisPage | Pustakawan |
| `/pustakawan/pengadaan` (`?action=ajukan`) | PengadaanPage | Pustakawan |
| `/pustakawan/laporan` | LaporanPage | Pustakawan |
| `/pustakawan/administrasi` (`?action=import`) | AdministrasiPage | Pustakawan |

---

## 11. Desain & Sistem Visual

### 11.1 Identitas
- **Logo**: emblem resmi SIT Nurul Fajri (bulat, hijau/merah/oranye) dalam badge bulat putih agar rapi di latar terang & gelap.
- **Wordmark**: "SIT Nurul Fajri" + subjudul "Perpustakaan Terpadu".

### 11.2 Palet Warna (tema hijau, dari logo)
| Token | Nilai | Penggunaan |
|-------|-------|-----------|
| Hijau brand | `#23A958` | Aksen, logo |
| Hijau gelap (teks/aksi) | `#15803D` | Wordmark, tombol, tautan, focus ring |
| Hijau tua permukaan (`navy` 700/DEFAULT) | `#136535` | Sidebar, badge, judul |
| Skala hijau 50–900 | `#EAF6EF … #0A3B1E` | Latar, border, overlay |
| Merah brand | `#E1272A` | (dari logo) |
| Oranye brand | `#F6A61A` | (dari logo) |
| Semantik | success `#16794F`, warning `#A15C00`, error `#B42318` | Status |
| Netral | canvas `#F5F7FA`, line `#D9E2EC`, ink `#1F2937` | Latar & teks |

Catatan: token palet historis masih bernama `navy` di kode namun nilainya sudah hijau, agar
seluruh kelas yang ada ikut berubah tanpa refaktor besar.

### 11.3 Elemen Visual
- **Foto latar**: OPAC hero & panel login (`siswa.jpg`) dan sidebar admin (`portrait.jpeg`),
  semuanya dengan overlay hijau (opacity ringan 40–60% pada foto besar) + bayangan teks agar terbaca.
- **Komponen UI**: Button, Card, Badge/StatusBadge, Dialog, Drawer, Input/Select, Table,
  Tabs, Toast, MetricCard, States (Empty/Error/Loading/Skeleton), BookCover, Charts (Line/Bar/Donut buatan SVG).
- **Animasi**: fade/slide/scale/shimmer/toast + `scan-line` untuk viewfinder scanner.

---

## 12. Status Implementasi

Prototipe ini **fungsional di sisi antarmuka** namun memakai data simulasi. Ringkasan jujur:

### 12.1 Sudah berjalan
- Navigasi seluruh peran, pengalih peran demo.
- OPAC: pencarian/filter, detail buku, scanner, tab pinjaman dengan opsi kembalikan + warning tempo.
- Layanan Mandiri: alur pinjam (scan kartu→buku→struk) & kembali (scan→lokasi rak) interaktif.
- Sirkulasi pustakawan (berbantuan) dengan validasi barcode & resi.
- 6 modul Pustakawan (Koleksi, Anggota, Inventaris, Pengadaan, Laporan, Administrasi).
- Dashboard Yayasan dengan grafik & item perhatian.

### 12.2 Keterbatasan yang diketahui
| # | Keterbatasan |
|---|--------------|
| K1 | Tanpa backend/persistensi — refresh mereset state; transaksi tidak memutasi data. |
| K2 | Login tidak memvalidasi kata sandi; tidak ada route guard (rute bisa diakses langsung). |
| K3 | Peran awal selalu `pustakawan`; refresh di rute lain bisa membuat identitas sidebar tak sinkron. |
| K4 | Sub-halaman modul **Yayasan** (Perbandingan Unit, Koleksi, Sirkulasi, Stock Opname, Laporan) belum dibuat — fallback ke Ringkasan. |
| K5 | Filter periode/unit di dashboard Yayasan belum benar-benar memfilter data. |
| K6 | Tab Pengembalian & Perpanjangan pada Sirkulasi pustakawan berbagi logika Peminjaman. |
| K7 | Semua aksi tulis (simpan/tambah/hapus/ekspor/import) bersifat simulasi (toast). |
| K8 | Pemindai barcode disimulasikan lewat input teks (belum ada integrasi kamera/HID). |

---

## 13. Asumsi & Ketergantungan

- Setiap anggota memiliki **kartu ber-barcode**; setiap eksemplar buku memiliki **barcode unik** yang memuat kode unit.
- Lokasi fisik buku (rak) sudah tertata sesuai data nomor panggil.
- Tersedia perangkat kios (layar + pemindai) di area perpustakaan untuk self-service.
- Saat produksi: dibutuhkan backend (mis. Supabase) untuk autentikasi, basis data, dan API.

---

## 14. Roadmap / Fase Berikutnya (usulan)

**Fase 1 — Fondasi Backend**
- Integrasi basis data & API (koleksi, anggota, transaksi).
- Autentikasi nyata + otorisasi berbasis peran + route guard.
- Persistensi & mutasi status eksemplar saat pinjam/kembali.

**Fase 2 — Kelengkapan Fungsional**
- Sub-halaman modul Yayasan + filter yang benar-benar bekerja.
- Pisahkan logika Pengembalian & Perpanjangan pada Sirkulasi.
- CRUD nyata untuk Koleksi, Anggota, Pengadaan, Kategori, Kebijakan.
- Import/ekspor nyata (CSV/Excel/PDF).

**Fase 3 — Integrasi & Otomasi**
- Integrasi pemindai fisik (kamera/HID) di kios.
- Perhitungan & pembayaran denda; blokir otomatis.
- Notifikasi (email/WhatsApp) untuk jatuh tempo & reservasi siap.
- Audit trail & laporan lanjutan.

---

## 15. Lampiran — Glosarium

| Istilah | Arti |
|---------|------|
| **OPAC** | Online Public Access Catalog — katalog publik untuk siswa. |
| **Self-service / Layanan Mandiri** | Peminjaman/pengembalian yang dilakukan sendiri oleh siswa via pemindaian. |
| **Nomor Panggil (Call Number)** | Kode klasifikasi buku untuk penataan rak. |
| **Stock Opname** | Pemeriksaan fisik inventaris untuk mencocokkan data vs kenyataan. |
| **Eksemplar (Copy)** | Salinan fisik dari sebuah judul buku. |
| **Selisih** | Ketidakcocokan antara data dan hasil pemeriksaan fisik. |
| **Unit** | Jenjang sekolah: SD, SMP, atau SMA. |

---

*Dokumen ini menggambarkan prototipe berbasis data simulasi untuk keperluan demonstrasi,
bukan data aktual SIT Nurul Fajri. Powered by IKODIO.*
