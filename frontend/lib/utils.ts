import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina classes condicionalmente e resolve conflitos do Tailwind (padrão shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  if (h < 24) return `${h}h`;
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}
