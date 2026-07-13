'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/layout/auth-guard';
import { CaptureBox } from '@/components/seed/capture-box';
import { SeedCard } from '@/components/seed/seed-card';
import { api } from '@/lib/api';
import { Seed } from '@/lib/types';

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const [seeds, setSeeds] = useState<Seed[] | null>(null);

  useEffect(() => {
    api.get<Seed[]>('/seeds').then(setSeeds).catch(() => setSeeds([]));
  }, []);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Início</h1>
      </div>
      <CaptureBox onCreated={(seed) => setSeeds((prev) => [seed, ...(prev ?? [])])} />
      {seeds === null && <p className="text-sm text-text-faint">Carregando suas Seeds...</p>}
      {seeds?.length === 0 && (
        <div className="py-16 text-center text-text-faint">
          <div className="mb-3.5 text-4xl">🌱</div>
          <div className="mb-1.5 font-semibold text-text">Nenhuma Seed por aqui ainda</div>
          <div>Plante sua primeira ideia acima.</div>
        </div>
      )}
      {seeds?.map((s) => (
        <SeedCard key={s.id} seed={s} />
      ))}
    </>
  );
}
