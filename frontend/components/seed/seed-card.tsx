'use client';

import Link from 'next/link';
import { MessageCircle, Bookmark } from 'lucide-react';
import { Seed } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const STAGE_LABEL: Record<Seed['status'], string> = {
  SEMENTE: 'Semente',
  CRESCENDO: 'Crescendo',
  PROJETO: 'Projeto',
  COLHIDA: 'Colhida',
};

export function SeedCard({ seed }: { seed: Seed }) {
  const { user } = useAuth();
  // Mostra o dono real da Seed (feed da comunidade) com fallback pro usuário logado (próprias Seeds).
  const owner = seed.owner ?? (user ? { id: user.id, username: user.username, name: user.name, avatar: user.avatar } : null);

  return (
    <Link
      href={`/seed/${seed.id}`}
      className="mb-3.5 block animate-cardIn rounded-seed border border-border bg-card p-4.5 p-[18px] transition-transform hover:-translate-y-0.5 hover:shadow-seed"
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg bg-gradient-to-br from-seed-green-2 to-seed-green text-xs font-bold text-white">
          {owner?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <b className="block truncate text-[13.5px]">{owner?.name ?? 'Anônimo'}</b>
          <span className="block text-xs text-text-faint">
            {timeAgo(seed.updatedAt ?? seed.createdAt)} · {seed.type.toLowerCase()}
          </span>
        </div>
        <span className="flex-none rounded-full bg-seed-green-light px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-seed-green">
          {STAGE_LABEL[seed.status]}
        </span>
      </div>
      <div className="mb-1.5 text-[15.5px] font-semibold">{seed.title}</div>
      <p className="seed-card-line-clamp mb-2.5 whitespace-pre-wrap text-[14.5px] leading-relaxed text-text-dim">
        {seed.content}
      </p>
      {seed.tags.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {seed.tags.map((t) => (
            <span key={t} className="rounded-full bg-seed-green-light px-2.5 py-1 text-xs font-semibold text-seed-green">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-4.5 gap-[18px] border-t border-border pt-2.5 text-xs text-text-faint">
        <span>{seed.favorite ? '⭐ favorito' : '☆'}</span>
        <span>{seed.visibility === 'PUBLIC' ? '🌐 público' : '🔒 privado'}</span>
        {seed._count && (
          <>
            <span className="flex items-center gap-1"><MessageCircle size={12} /> {seed._count.comments}</span>
            <span className="flex items-center gap-1"><Bookmark size={12} /> {seed._count.savedBy}</span>
          </>
        )}
      </div>
    </Link>
  );
}
