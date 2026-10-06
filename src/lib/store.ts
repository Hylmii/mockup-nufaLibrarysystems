import { useState, useCallback, useEffect } from 'react';
import type { Role, Toast, ToastType } from '@/types';

// Jumlah perpindahan rute di dalam aplikasi sejak halaman dimuat. Dipakai untuk tahu
// apakah "kembali" masih mengarah ke halaman aplikasi ini, bukan ke situs sebelumnya.
let inAppNavigations = 0;

/** True bila ada halaman aplikasi sebelumnya di riwayat browser. */
export function canGoBackInApp(): boolean {
  return inAppNavigations > 0;
}

export function useRoute() {
  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/login';
  });

  useEffect(() => {
    const onHashChange = () => {
      inAppNavigations += 1;
      const hash = window.location.hash.replace(/^#/, '');
      setRoute(hash || '/login');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}

/**
 * Perbarui URL tanpa menambah riwayat dan tanpa memicu navigasi (mis. menyimpan
 * kata kunci pencarian saat mengetik). Rute di state sengaja tidak ikut berubah.
 */
export function replaceRoute(path: string) {
  window.history.replaceState(window.history.state, '', `#${path}`);
}

/**
 * Peran ditentukan dari rute agar tetap benar setelah halaman di-refresh
 * atau saat rute dibuka langsung lewat tautan.
 */
export function roleFromRoute(route: string): Role {
  if (route.startsWith('/yayasan')) return 'yayasan';
  if (route.startsWith('/opac') || route.startsWith('/buku') || route.startsWith('/mandiri')) return 'siswa';
  return 'pustakawan';
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    [],
  );

  return { toasts, notify, dismiss };
}
