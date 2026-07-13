'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem('seed_theme') ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(saved === 'dark');
  }, []);

  function applyTheme(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
    localStorage.setItem('seed_theme', dark ? 'dark' : 'light');
  }

  return (
    <Button variant="icon" onClick={() => applyTheme(!isDark)} aria-label="Alternar tema">
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
