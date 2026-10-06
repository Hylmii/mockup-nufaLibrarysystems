import { useCallback } from 'react';
import { useRoute, roleFromRoute, useToasts } from '@/lib/store';
import { ToastStack } from '@/components/ui/Toast';
import { LoginPage } from '@/pages/LoginPage';
import { YayasanDashboard } from '@/pages/YayasanDashboard';
import { PustakawanDashboard } from '@/pages/PustakawanDashboard';
import { SirkulasiPage } from '@/pages/SirkulasiPage';
import { OpacPage } from '@/pages/OpacPage';
import { BookDetailPage } from '@/pages/BookDetailPage';
import { SelfServicePage } from '@/pages/SelfServicePage';
import { KoleksiPage } from '@/pages/KoleksiPage';
import { AnggotaPage } from '@/pages/AnggotaPage';
import { InventarisPage } from '@/pages/InventarisPage';
import { PengadaanPage } from '@/pages/PengadaanPage';
import { LaporanPage } from '@/pages/LaporanPage';
import { AdministrasiPage } from '@/pages/AdministrasiPage';
import type { Role, Unit } from '@/types';

function App() {
  const { route, navigate } = useRoute();
  const role = roleFromRoute(route);
  const { toasts, notify, dismiss } = useToasts();

  const activeUnit: Unit = role === 'pustakawan' ? 'SD' : 'SEMUA';

  const handleLogin = useCallback(
    (r: Role) => {
      if (r === 'siswa') {
        navigate('/opac');
      } else if (r === 'yayasan') {
        navigate('/yayasan');
      } else {
        navigate('/pustakawan');
      }
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const commonProps = { role, activeUnit, route, navigate, onLogout: handleLogout, notify };

  // Route matching
  if (route === '/login' || route === '/') {
    return (
      <>
        <LoginPage onLogin={handleLogin} notify={notify} />
        <ToastStack toasts={toasts} onDismiss={dismiss} />
      </>
    );
  }

  if (route.startsWith('/yayasan')) {
    return (
      <>
        <YayasanDashboard {...commonProps} />
        <ToastStack toasts={toasts} onDismiss={dismiss} besideSidebar />
      </>
    );
  }

  if (route.startsWith('/sirkulasi')) {
    return (
      <>
        <SirkulasiPage {...commonProps} />
        <ToastStack toasts={toasts} onDismiss={dismiss} besideSidebar />
      </>
    );
  }

  if (route.startsWith('/pustakawan')) {
    let Page = PustakawanDashboard;
    if (route.startsWith('/pustakawan/koleksi')) Page = KoleksiPage;
    else if (route.startsWith('/pustakawan/anggota')) Page = AnggotaPage;
    else if (route.startsWith('/pustakawan/inventaris')) Page = InventarisPage;
    else if (route.startsWith('/pustakawan/pengadaan')) Page = PengadaanPage;
    else if (route.startsWith('/pustakawan/laporan')) Page = LaporanPage;
    else if (route.startsWith('/pustakawan/administrasi')) Page = AdministrasiPage;
    return (
      <>
        <Page {...commonProps} />
        <ToastStack toasts={toasts} onDismiss={dismiss} besideSidebar />
      </>
    );
  }

  if (route.startsWith('/buku/')) {
    const bookId = route.replace('/buku/', '');
    return (
      <>
        <BookDetailPage bookId={bookId} route={route} navigate={navigate} onLogout={handleLogout} notify={notify} />
        <ToastStack toasts={toasts} onDismiss={dismiss} />
      </>
    );
  }

  if (route.startsWith('/mandiri')) {
    return (
      <>
        <SelfServicePage route={route} navigate={navigate} onLogout={handleLogout} notify={notify} />
        <ToastStack toasts={toasts} onDismiss={dismiss} />
      </>
    );
  }

  if (route.startsWith('/opac')) {
    return (
      <>
        <OpacPage route={route} navigate={navigate} onLogout={handleLogout} notify={notify} />
        <ToastStack toasts={toasts} onDismiss={dismiss} />
      </>
    );
  }

  // Fallback
  return (
    <>
      <LoginPage onLogin={handleLogin} notify={notify} />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

export default App;
