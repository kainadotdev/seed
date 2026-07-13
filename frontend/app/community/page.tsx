'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, MessageCircle } from 'lucide-react';
import { AuthGuard } from '@/components/layout/auth-guard';
import { api } from '@/lib/api';
import { Seed } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function CommunityPage() {
  return (
    <AuthGuard>
      <CommunityContent />
    </AuthGuard>
  );
}

function CommunityContent() {
  const { user } = useAuth();
  const [seeds, setSeeds] = useState<Seed[] | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get<Seed[]>('/seeds/public').then(setSeeds).catch(() => setSeeds([]));
    api
      .get<Seed[]>('/seeds/saved')
      .then((data) => setSaved(new Set(data.map((s) => s.id))))
      .catch(() => undefined);
  }, []);

  async function toggleSave(e: React.MouseEvent, seedId: string) {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = saved.has(seedId);
    setSaved((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(seedId) : next.add(seedId);
      return next;
    });
    try {
      if (isSaved) await api.delete(`/seeds/${seedId}/save`);
      else await api.post(`/seeds/${seedId}/save`);
    } catch {
      // reverte em caso de erro
      setSaved((prev) => {
        const next = new Set(prev);
        isSaved ? next.add(seedId) : next.delete(seedId);
        return next;
      });
    }
  }

  return (
    <>
      <h1 className="mb-1 text-xl font-bold tracking-tight">Comunidade</h1>
      <p className="mb-5 text-sm text-text-dim">
        Seeds que outras pessoas escolheram tornar públicas. Comente, salve e acompanhe — sem curtidas, o foco é conhecimento.
      </p>

      {seeds === null && <p className="text-sm text-text-faint">Carregando comunidade...</p>}
      {seeds?.length === 0 && (
        <div className="py-16 text-center text-text-faint">
          <div className="mb-3.5 text-4xl">🌍</div>
          <div>Nenhuma Seed pública ainda. Seja o primeiro a compartilhar!</div>
        </div>
      )}

      {seeds?.map((s) => (
        <Link
          key={s.id}
          href={`/seed/${s.id}`}
          className="mb-3.5 block animate-cardIn rounded-seed border border-border bg-card p-4.5 p-[18px] transition-transform hover:-translate-y-0.5 hover:shadow-seed"
        >
          <div className="mb-2.5 flex items-center gap-2.5">
            <Link
              href={`/profile/${s.owner?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg bg-gradient-to-br from-seed-green-2 to-seed-green text-xs font-bold text-white"
            >
              {s.owner?.name?.[0]?.toUpperCase() ?? '?'}
            </Link>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[13.5px]">{s.owner?.name}</b>
              <span className="block text-xs text-text-faint">
                @{s.owner?.username} · {timeAgo(s.updatedAt)} · {s.type.toLowerCase()}
              </span>
            </div>
          </div>
          <div className="mb-1.5 text-[15.5px] font-semibold">{s.title}</div>
          <p className="seed-card-line-clamp mb-2.5 whitespace-pre-wrap text-[14.5px] leading-relaxed text-text-dim">
            {s.content}
          </p>
          {s.tags.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {s.tags.map((t) => (
                <span key={t} className="rounded-full bg-seed-green-light px-2.5 py-1 text-xs font-semibold text-seed-green">
                  #{t}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4.5 gap-[18px] border-t border-border pt-2.5 text-xs text-text-faint">
            <span className="flex items-center gap-1">
              <MessageCircle size={13} /> {s._count?.comments ?? 0} comentários
            </span>
            <button
              onClick={(e) => toggleSave(e, s.id)}
              disabled={s.owner?.id === user?.id}
              className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold disabled:opacity-40 ${
                saved.has(s.id) ? 'bg-seed-green-light text-seed-green' : 'hover:text-seed-green'
              }`}
            >
              <Bookmark size={13} fill={saved.has(s.id) ? 'currentColor' : 'none'} />
              {saved.has(s.id) ? 'Salva' : 'Salvar'}
            </button>
          </div>
        </Link>
      ))}
    </>
  );
}
