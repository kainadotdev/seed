import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Seed — Toda grande ideia começou como uma pequena semente',
  description:
    'Capture pensamentos, desenvolva ideias com inteligência artificial e transforme pequenas sementes em grandes projetos.',
};

// Aplica o tema salvo antes da primeira pintura, evitando flash de tema errado.
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('seed_theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (saved === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
