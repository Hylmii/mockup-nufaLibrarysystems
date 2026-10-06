import { useState, useRef, useEffect } from 'react';
import {
  Menu, X, Home, Search, Grid, BookMarked, Calendar, User, ScanLine, ChevronDown, LogOut,
} from 'lucide-react';
import { NufaLogo } from '@/components/NufaLogo';
import { findMemberById } from '@/lib/data';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// Menu utama di header. Item akun (profil, reservasi, keluar) ada di menu avatar.
const MAIN_NAV: NavItem[] = [
  { label: 'Beranda', path: '/opac', icon: <Home size={16} /> },
  { label: 'Cari Koleksi', path: '/opac?tab=cari', icon: <Search size={16} /> },
  { label: 'Kategori', path: '/opac?tab=kategori', icon: <Grid size={16} /> },
  { label: 'Layanan Mandiri', path: '/mandiri', icon: <ScanLine size={16} /> },
  { label: 'Pinjaman Saya', path: '/opac?tab=pinjaman', icon: <BookMarked size={16} /> },
];

const ACCOUNT_NAV: NavItem[] = [
  { label: 'Profil Saya', path: '/opac?tab=profil', icon: <User size={16} /> },
  { label: 'Reservasi Saya', path: '/opac?tab=reservasi', icon: <Calendar size={16} /> },
];

// Anggota demo yang sedang masuk sebagai siswa.
const CURRENT_MEMBER = findMemberById('SD-000124');

interface PublicLayoutProps {
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function PublicLayout({ route, navigate, onLogout, children }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const memberName = CURRENT_MEMBER?.name ?? 'Siswa';
  const firstName = memberName.split(' ')[0];
  const overdue = CURRENT_MEMBER?.overdueCount ?? 0;

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAccountOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    setAccountOpen(false);
    onLogout();
  };

  const isActive = (path: string) => {
    if (path === '/opac') return route === '/opac';
    return route.startsWith(path.split('?')[0]) && route.includes(path.split('?')[1] || '');
  };
  const accountActive = ACCOUNT_NAV.some((item) => isActive(item.path));

  const overdueBadge = (path: string) =>
    path === '/opac?tab=pinjaman' && overdue > 0 ? (
      <span
        className="ml-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[11px] font-semibold leading-[18px] text-center"
        aria-label={`${overdue} pinjaman terlambat`}
      >
        {overdue}
      </span>
    ) : null;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/opac')} className="flex-shrink-0" aria-label="Beranda katalog">
            <NufaLogo size={34} />
          </button>

          {/* Menu utama — layar lebar. Ikon hanya tampil mulai 1150px agar tetap satu baris. */}
          <nav className="hidden lg:flex items-center gap-0.5 mx-auto" aria-label="Menu utama">
            {MAIN_NAV.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    active ? 'bg-action-light text-action' : 'text-ink-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  <span className="hidden min-[1150px]:inline-flex">{item.icon}</span>
                  {item.label}
                  {overdueBadge(item.path)}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            {/* Menu akun */}
            <div className="relative hidden lg:block" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                aria-label="Menu akun"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-colors ${
                  accountActive || accountOpen ? 'border-action/40 bg-action-light' : 'border-line hover:bg-canvas'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">
                  {memberName.charAt(0)}
                </span>
                <span className="hidden min-[1150px]:inline text-sm font-medium text-ink max-w-[96px] truncate">{firstName}</span>
                <ChevronDown size={16} className={`text-ink-muted transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>

              {accountOpen && (
                <div role="menu" className="absolute right-0 top-full mt-2 w-60 bg-surface border border-line rounded-lg shadow-elevated z-40 animate-scale-in">
                  <div className="px-4 py-3 border-b border-line">
                    <p className="text-sm font-semibold text-ink truncate">{memberName}</p>
                    <p className="text-xs text-ink-muted">
                      {CURRENT_MEMBER ? `${CURRENT_MEMBER.id} · Siswa ${CURRENT_MEMBER.unit}` : 'Anggota perpustakaan'}
                    </p>
                  </div>
                  <div className="py-1.5">
                    {ACCOUNT_NAV.map((item) => (
                      <button
                        key={item.path}
                        role="menuitem"
                        onClick={() => handleNav(item.path)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                          isActive(item.path) ? 'bg-action-light text-action font-medium' : 'text-ink hover:bg-canvas'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-line py-1.5">
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error-bg transition-colors"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tombol menu — tablet & ponsel */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative p-2 rounded-md text-ink-muted hover:bg-canvas"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              {!mobileOpen && overdue > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error border border-surface" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden border-t border-line bg-surface animate-slide-up" aria-label="Menu">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-canvas/40">
              <span className="w-9 h-9 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">
                {memberName.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{memberName}</p>
                {CURRENT_MEMBER && <p className="text-xs text-ink-muted">{CURRENT_MEMBER.id} · Siswa {CURRENT_MEMBER.unit}</p>}
              </div>
            </div>
            {[...MAIN_NAV, ...ACCOUNT_NAV].map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-line/50 transition-colors ${
                  isActive(item.path) ? 'bg-action-light text-action' : 'text-ink hover:bg-canvas'
                }`}
              >
                {item.icon}
                {item.label}
                {overdueBadge(item.path)}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error-bg transition-colors"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </nav>
        )}
      </header>

      <main>{children}</main>

      <footer className="bg-navy text-white/80 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <NufaLogo size={32} className="[&_span]:text-white [&_.text-ink-muted]:text-white/60" />
              <p className="text-sm text-white/60 mt-3 max-w-xs">
                Pengelolaan koleksi dan layanan perpustakaan SD, SMP, dan SMA dalam satu sistem terintegrasi.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-1">Layanan</p>
              <button onClick={() => navigate('/opac')} className="text-left hover:text-white transition-colors">Beranda</button>
              <button onClick={() => navigate('/opac?tab=cari')} className="text-left hover:text-white transition-colors">Cari Koleksi</button>
              <button onClick={() => navigate('/opac?tab=kategori')} className="text-left hover:text-white transition-colors">Kategori</button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/40">Data simulasi untuk keperluan mockup — bukan data aktual SIT Nurul Fajri.</p>
            <p className="text-xs text-white/40">Powered by IKODIO</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
