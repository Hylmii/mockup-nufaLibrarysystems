import { useState } from 'react';
import { Menu, X, Home, Search, Grid, BookMarked, Calendar, User, ScanLine } from 'lucide-react';
import { NufaLogo } from '@/components/NufaLogo';

const PUBLIC_NAV = [
  { label: 'Beranda', path: '/opac', icon: <Home size={18} /> },
  { label: 'Cari Koleksi', path: '/opac?tab=cari', icon: <Search size={18} /> },
  { label: 'Kategori', path: '/opac?tab=kategori', icon: <Grid size={18} /> },
  { label: 'Layanan Mandiri', path: '/mandiri', icon: <ScanLine size={18} /> },
  { label: 'Pinjaman Saya', path: '/opac?tab=pinjaman', icon: <BookMarked size={18} /> },
  { label: 'Reservasi Saya', path: '/opac?tab=reservasi', icon: <Calendar size={18} /> },
  { label: 'Profil', path: '/opac?tab=profil', icon: <User size={18} /> },
];

interface PublicLayoutProps {
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function PublicLayout({ route, navigate, onLogout, children }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/opac') return route === '/opac';
    return route.startsWith(path.split('?')[0]) && route.includes(path.split('?')[1] || '');
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 bg-surface border-b border-line">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/opac')} className="flex-shrink-0">
            <NufaLogo size={32} />
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {PUBLIC_NAV.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path) ? 'bg-action-light text-action' : 'text-ink-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="hidden md:inline-flex text-sm text-ink-muted hover:text-ink px-3 py-2 rounded-md hover:bg-canvas transition-colors"
            >
              Keluar
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-ink-muted hover:bg-canvas"
              aria-label="Buka menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-line bg-surface animate-slide-up">
            {PUBLIC_NAV.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-line/50 transition-colors ${
                  isActive(item.path) ? 'bg-action-light text-action' : 'text-ink hover:bg-canvas'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error-bg transition-colors"
            >
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
