import { useState } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, Info, BookOpen } from 'lucide-react';
import { NufaLogo } from '@/components/NufaLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Role } from '@/types';

interface LoginProps {
  onLogin: (role: Role) => void;
  notify: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export function LoginPage({ onLogin }: LoginProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password.trim()) {
      setError('ID pengguna dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const id = userId.trim().toLowerCase();
      if (id.includes('yayasan') || id.includes('ketua')) {
        onLogin('yayasan');
      } else if (id.includes('siswa') || id.includes('guru')) {
        onLogin('siswa');
      } else {
        onLogin('pustakawan');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: brand panel with bookshelf pattern */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] bg-navy relative overflow-hidden">
        {/* Foto suasana perpustakaan + lapisan navy agar teks terbaca */}
        <img
          src="/images/siswa.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900/55 via-navy/40 to-navy-800/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">
          <NufaLogo size={40} className="[&_span]:text-white [&_.text-ink-muted]:text-white/60" />
          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Perpustakaan Terpadu SIT Nurul Fajri
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Pengelolaan koleksi dan layanan perpustakaan SD, SMP, dan SMA dalam satu sistem terintegrasi.
            </p>
            <div className="flex items-center gap-6 mt-8">
              <div>
                <p className="text-2xl font-bold">8.420</p>
                <p className="text-xs text-white/70">Judul Buku</p>
              </div>
              <div className="w-px h-10 bg-white/15" />
              <div>
                <p className="text-2xl font-bold">11.260</p>
                <p className="text-xs text-white/70">Eksemplar</p>
              </div>
              <div className="w-px h-10 bg-white/15" />
              <div>
                <p className="text-2xl font-bold">1.846</p>
                <p className="text-xs text-white/70">Anggota Aktif</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/60">Powered by IKODIO</p>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-canvas">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <NufaLogo size={44} />
          </div>

          <div className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-8">
            <h1 className="text-xl font-bold text-ink mb-2">Masuk ke Sistem</h1>
            <p className="text-sm text-ink-muted mb-6">
              Masuk untuk mengakses pengelolaan perpustakaan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="ID Pengguna atau Email"
                name="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="contoh: pustakawan.sd"
                icon={<UserIcon size={18} />}
                autoComplete="username"
                autoFocus
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-ink">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    className="text-xs text-action hover:underline"
                    onClick={() => undefined}
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className={`w-full rounded-md border bg-surface pl-10 pr-10 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 transition-all outline-none ${
                      error ? 'border-error focus:shadow-error focus:border-error' : 'border-line focus:border-action focus:shadow-focus'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-line text-action focus:ring-action"
                />
                <span className="text-sm text-ink">Ingat saya</span>
              </label>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-error-bg border border-error-border text-error text-sm animate-slide-up">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-line">
              <p className="text-xs text-ink-muted text-center mb-3">
                Coba masuk sebagai peran berikut (demo):
              </p>
              <div className="grid grid-cols-3 gap-2">
                <DemoRoleButton label="Yayasan" onClick={() => onLogin('yayasan')} />
                <DemoRoleButton label="Pustakawan" onClick={() => onLogin('pustakawan')} />
                <DemoRoleButton label="Siswa" onClick={() => onLogin('siswa')} />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 mt-4 p-3 rounded-md bg-warning-bg/50 border border-warning-border/50">
            <Info size={16} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ink-muted">
              Prototipe ini menggunakan data simulasi untuk keperluan demonstrasi — bukan data aktual SIT Nurul Fajri.
            </p>
          </div>

          <p className="text-center text-xs text-ink-muted mt-6">
            Powered by IKODIO
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoRoleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 text-sm font-medium text-navy border border-line rounded-md hover:bg-canvas hover:border-navy-200 transition-all"
    >
      {label}
    </button>
  );
}


