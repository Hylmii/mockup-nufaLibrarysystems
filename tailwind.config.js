/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tema hijau brand SIT Nurul Fajri (sebelumnya navy/biru).
        // Nama "navy" dipertahankan agar seluruh kelas bg-navy/text-navy ikut berubah tanpa menyentuh komponen.
        navy: {
          DEFAULT: '#136535',
          50: '#EAF6EF',
          100: '#CBE9D6',
          200: '#A3D8B7',
          300: '#6FC08F',
          400: '#3DA968',
          500: '#219A4E',
          600: '#17823F',
          700: '#136535',
          800: '#0F5029',
          900: '#0A3B1E',
        },
        surface: '#FFFFFF',
        canvas: '#F5F7FA',
        ink: {
          DEFAULT: '#1F2937',
          muted: '#64748B',
        },
        line: {
          DEFAULT: '#D9E2EC',
          strong: '#B6C4D2',
        },
        success: {
          DEFAULT: '#16794F',
          bg: '#E6F3EC',
          border: '#A7D4BC',
        },
        warning: {
          DEFAULT: '#A15C00',
          bg: '#FBF0E0',
          border: '#E0C49A',
        },
        error: {
          DEFAULT: '#B42318',
          bg: '#FBEAEA',
          border: '#E8B5B0',
        },
        // Elemen interaktif (tombol, tautan, fokus) — hijau, selaras wordmark.
        action: {
          DEFAULT: '#15803D',
          hover: '#11672F',
          light: '#E7F4EC',
        },
        // Warna brand SIT Nurul Fajri, diambil dari logo resmi
        brand: {
          green: '#23A958',
          'green-dark': '#15803D', // varian gelap untuk teks di latar terang (kontras AA)
          red: '#E1272A',
          orange: '#F6A61A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        sidebar: '248px',
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '8px',
        md: '10px',
        lg: '12px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(16, 35, 54, 0.04), 0 1px 3px 0 rgba(16, 35, 54, 0.06)',
        card: '0 1px 3px 0 rgba(16, 35, 54, 0.05), 0 1px 2px -1px rgba(16, 35, 54, 0.04)',
        elevated: '0 4px 12px -2px rgba(16, 35, 54, 0.08), 0 2px 6px -1px rgba(16, 35, 54, 0.05)',
        drawer: '0 10px 40px -4px rgba(16, 35, 54, 0.15), 0 4px 12px -2px rgba(16, 35, 54, 0.08)',
        focus: '0 0 0 3px rgba(21, 128, 61, 0.35)',
        success: '0 0 0 3px rgba(22, 121, 79, 0.25)',
        error: '0 0 0 3px rgba(180, 35, 24, 0.25)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scan-line': {
          '0%': { top: '10%' },
          '50%': { top: '88%' },
          '100%': { top: '10%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.25s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'toast-in': 'toast-in 0.25s ease-out',
        'scan-line': 'scan-line 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
