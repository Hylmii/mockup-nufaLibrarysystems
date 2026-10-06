import { useState, useRef, useEffect } from 'react';
import {
  Bell, ChevronDown, Menu, X, Home, BookOpen, Users,
  BarChart3, Package, ClipboardList, GitCompare,
  BookMarked, ShoppingCart, ArrowLeftRight, Settings,
  Building2, LogOut, GraduationCap,
} from 'lucide-react';
import { NufaLogo } from '@/components/NufaLogo';
import { Badge } from '@/components/ui/Badge';
import type { Role, Unit } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  yayasan: [
    { label: 'Ringkasan Yayasan', path: '/yayasan', icon: <Home size={18} /> },
    // Sub-halaman berikut belum dibuat (PRD YAY-6) — saat ini menampilkan Ringkasan.
    { label: 'Perbandingan Unit', path: '/yayasan/perbandingan', icon: <GitCompare size={18} />, badge: 'Segera' },
    { label: 'Koleksi', path: '/yayasan/koleksi', icon: <BookOpen size={18} />, badge: 'Segera' },
    { label: 'Sirkulasi', path: '/yayasan/sirkulasi', icon: <ArrowLeftRight size={18} />, badge: 'Segera' },
    { label: 'Stock Opname', path: '/yayasan/stock-opname', icon: <ClipboardList size={18} />, badge: 'Segera' },
    { label: 'Laporan', path: '/yayasan/laporan', icon: <BarChart3 size={18} />, badge: 'Segera' },
  ],
  pustakawan: [
    { label: 'Beranda', path: '/pustakawan', icon: <Home size={18} /> },
    { label: 'Sirkulasi', path: '/sirkulasi', icon: <ArrowLeftRight size={18} /> },
    { label: 'Koleksi', path: '/pustakawan/koleksi', icon: <BookOpen size={18} /> },
    { label: 'Anggota', path: '/pustakawan/anggota', icon: <Users size={18} /> },
    { label: 'Inventaris', path: '/pustakawan/inventaris', icon: <Package size={18} /> },
    { label: 'Pengadaan', path: '/pustakawan/pengadaan', icon: <ShoppingCart size={18} /> },
    { label: 'Laporan', path: '/pustakawan/laporan', icon: <BarChart3 size={18} /> },
    { label: 'Administrasi', path: '/pustakawan/administrasi', icon: <Settings size={18} /> },
  ],
  siswa: [],
};

/**
 * Menu aktif = item dengan path terpanjang yang cocok dengan rute (tanpa query),
 * agar menu induk seperti "/yayasan" tidak ikut tersorot di sub-halamannya.
 */
function findActivePath(nav: NavItem[], route: string): string | undefined {
  const path = route.split('?')[0];
  return nav
    .filter((item) => path === item.path || path.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;
}

const ROLE_LABELS: Record<Role, string> = {
  yayasan: 'Manajemen Yayasan',
  pustakawan: 'Pustakawan',
  siswa: 'Siswa',
};

const ROLE_USERS: Record<Role, { name: string; sub: string }> = {
  yayasan: { name: 'H. Abdurrahman, M.Pd.', sub: 'Ketua Yayasan' },
  pustakawan: { name: 'Sri Mulyani, S.IP.', sub: 'Pustakawan Unit SD' },
  siswa: { name: 'Aulia Rahma', sub: 'SD-000124 · Siswa SD' },
};

interface AdminLayoutProps {
  role: Role;
  activeUnit: Unit;
  route: string;
  navigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
  pageTitle: string;
  pageActions?: React.ReactNode;
}

export function AdminLayout({
  role, activeUnit, route, navigate, onLogout,
  children, breadcrumbs, pageTitle, pageActions,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const nav = NAV_BY_ROLE[role];
  const user = ROLE_USERS[role];
  const activePath = findActivePath(nav, route);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,59,30,0.55) 0%, rgba(19,101,53,0.40) 50%, rgba(15,80,41,0.60) 100%), url('/images/portrait.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className={`fixed top-0 left-0 h-full w-sidebar bg-navy text-white z-40 flex flex-col transition-transform duration-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <NufaLogo size={32} className="[&_span]:text-white [&_.text-ink-muted]:text-white/60" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white" aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/10">
            <Building2 size={16} className="text-white/80" />
            <span className="text-sm font-medium text-white">SIT Nurul Fajri</span>
          </div>
          {role === 'pustakawan' && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-md bg-white/10">
              <span className="text-xs text-white/80">Unit aktif:</span>
              <Badge variant="info" size="sm">{activeUnit}</Badge>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <p className="px-3 text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-2">Menu</p>
          <ul className="space-y-0.5">
            {nav.map((item) => {
              const isActive = item.path === activePath;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-white text-navy-800 font-semibold shadow-sm [text-shadow:none]'
                        : 'text-white/90 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <span
                        className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full [text-shadow:none] ${
                          isActive ? 'bg-navy-50 text-navy-800' : 'bg-white/20 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-[11px] text-white/60">Powered by IKODIO</p>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-navy-900/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="lg:ml-sidebar">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-surface border-b border-line h-16 flex items-center px-4 lg:px-6 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-ink-muted hover:text-ink" aria-label="Buka menu">
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-ink truncate">{pageTitle}</h1>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-xs text-ink-muted" aria-label="Breadcrumb">
                {breadcrumbs.map((bc, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span>/</span>}
                    {bc.path ? (
                      <button onClick={() => navigate(bc.path!)} className="hover:text-action transition-colors">
                        {bc.label}
                      </button>
                    ) : (
                      <span className="text-ink">{bc.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>

          {pageActions}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-md text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
              aria-label="Notifikasi"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-surface" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-line rounded-lg shadow-elevated z-30 animate-scale-in">
                <div className="px-4 py-3 border-b border-line">
                  <p className="text-sm font-semibold text-ink">Notifikasi</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {[
                    { icon: <Bell size={16} />, title: '18 peminjaman terlambat', time: '2 menit lalu', color: 'text-warning' },
                    { icon: <ClipboardList size={16} />, title: 'Stock opname SMP 78% selesai', time: '1 jam lalu', color: 'text-action' },
                    { icon: <Users size={16} />, title: '3 anggota baru menunggu verifikasi', time: '3 jam lalu', color: 'text-ink-muted' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-canvas/50 border-b border-line/50">
                      <span className={`${n.color} mt-0.5`}>{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink">{n.title}</p>
                        <p className="text-xs text-ink-muted mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-canvas transition-colors"
              aria-label="Menu profil"
              aria-expanded={profileOpen}
            >
              <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-sm font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-ink max-w-[140px] truncate">{user.name}</span>
                <span className="text-xs text-ink-muted">{user.sub}</span>
              </div>
              <ChevronDown size={16} className="text-ink-muted" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-line rounded-lg shadow-elevated z-30 animate-scale-in">
                <div className="px-4 py-3 border-b border-line">
                  <p className="text-sm font-medium text-ink">{user.name}</p>
                  <p className="text-xs text-ink-muted">{user.sub}</p>
                </div>
                <div className="py-1.5">
                  <p className="px-4 py-1.5 text-[11px] font-semibold text-ink-muted uppercase tracking-wide">Mode Demo</p>
                  {(['yayasan', 'pustakawan', 'siswa'] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(r === 'siswa' ? '/opac' : `/${r}`);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                        role === r ? 'bg-action-light text-action font-medium' : 'text-ink hover:bg-canvas'
                      }`}
                    >
                      {r === 'yayasan' && <Building2 size={16} />}
                      {r === 'pustakawan' && <BookMarked size={16} />}
                      {r === 'siswa' && <GraduationCap size={16} />}
                      {ROLE_LABELS[r]}
                      {role === r && <span className="ml-auto text-xs">aktif</span>}
                    </button>
                  ))}
                </div>
                <div className="border-t border-line py-1.5">
                  <button
                    onClick={() => { onLogout(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error-bg transition-colors"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
