'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/layout/auth-guard';
import { SeedCard } from '@/components/seed/seed-card';
import { api } from '@/lib/api';
import { Seed } from '@/lib/types';

const FILTERS = ['recentes', 'favoritos', 'arquivados', 'crescendo'] as const;
type Filter = (typeof FILTERS)[number];

export default function TimelinePage() {
  return (
    <AuthGuard>
      <TimelineContent />
    </AuthGuard>
  );
}

function TimelineContent() {
  const [seeds, setSeeds] = useState<Seed[] | null>(null);
  const [filter, setFilter] = useState<Filter>('recentes');

  useEffect(() => {
    api
      .get<Seed[]>(`/seeds?includeArchived=${filter === 'arquivados'}`)
      .then(setSeeds)
      .catch(() => setSeeds([]));
  }, [filter]);

  const filtered = (seeds ?? []).filter((s) => {
    if (filter === 'favoritos') return s.favorite && !s.archived;
    if (filter === 'arquivados') return s.archived;
    if (filter === 'crescendo') return s.status === 'CRESCENDO' && !s.archived;
    return !s.archived;
  });

  return (
    <>
      <h1 className="mb-5 text-xl font-bold tracking-tight">Timeline</h1>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-none rounded-full border px-3.5 py-1.5 text-sm font-semibold capitalize ${
              filter === f ? 'border-transparent bg-seed-green-light text-seed-green' : 'border-border bg-bg-2 text-text-dim'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {seeds === null && <p className="text-sm text-text-faint">Carregando...</p>}
      {seeds !== null && filtered.length === 0 && (
        <div className="py-16 text-center text-text-faint">
          <div className="mb-3.5 text-4xl">🌱</div>
          <div>Sua timeline está vazia. Toda Seed que você plantar aparece aqui.</div>
        </div>
      )}
      {filtered.map((s) => (
        <SeedCard key={s.id} seed={s} />
      ))}
    </>
  );
}
