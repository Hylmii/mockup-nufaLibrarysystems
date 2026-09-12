import { useState, useCallback, useEffect } from 'react';
import type { Role, Toast, ToastType } from '@/types';

export function useRoute() {
  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/login';
  });

  useEffect(() => {
    const onHashChange = () => {
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

export function useRoleState(initial: Role) {
  const [role, setRole] = useState<Role>(initial);
  const changeRole = useCallback((r: Role) => setRole(r), []);
  return { role, changeRole };
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
