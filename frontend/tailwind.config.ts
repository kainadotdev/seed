import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        card: 'var(--card)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-dim': 'var(--text-dim)',
        'text-faint': 'var(--text-faint)',
        seed: {
          green: 'var(--green)',
          'green-2': 'var(--green-2)',
          'green-light': 'var(--green-light)',
        },
      },
      borderRadius: {
        seed: '16px',
        'seed-lg': '22px',
      },
      boxShadow: {
        seed: '0 1px 2px rgba(20,32,26,.04), 0 8px 24px rgba(20,32,26,.06)',
      },
      keyframes: {
        riseIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        cardIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        riseIn: 'riseIn .6s ease forwards',
        cardIn: 'cardIn .35s ease',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
