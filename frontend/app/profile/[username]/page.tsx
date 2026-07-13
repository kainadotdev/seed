'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sprout, Flame, TrendingUp, Globe2 } from 'lucide-react';
import { AuthGuard } from '@/components/layout/auth-guard';
import { SeedCard } from '@/components/seed/seed-card';
import { api } from '@/lib/api';
import { Seed, User, ProfileStats } from '@/lib/types';

interface PublicProfile extends User {
  seeds: Seed[];
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const params = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    api.get<PublicProfile>(`/users/${params.username}`).then(setProfile).catch(() => setProfile(null));
    api.get<ProfileStats>(`/users/${params.username}/stats`).then(setStats).catch(() => setStats(null));
  }, [params.username]);

  if (!profile) return <p className="text-sm text-text-faint">Carregando perfil...</p>;

  return (
    <>
      <h1 className="mb-5 text-xl font-bold tracking-tight">Perfil</h1>
      <div className="relative mb-14 h-[150px] overflow-hidden rounded-seed-lg bg-gradient-to-br from-seed-green-light to-bg-2">
        <div className="absolute -bottom-10 left-6 flex h-[88px] w-[88px] items-center justify-center rounded-[20px] border-4 border-bg bg-gradient-to-br from-seed-green-2 to-seed-green text-3xl font-bold text-white shadow-seed">
          {profile.name[0]?.toUpperCase()}
        </div>
      </div>
      <h2 className="mb-1 text-xl font-bold tracking-tight">{profile.name}</h2>
      <div className="mb-2.5 text-sm text-text-faint">@{profile.username} · seed.app/u/{profile.username}</div>
      <p className="mb-6 max-w-md text-sm text-text-dim">
        {profile.bio || `Cultivando ideias desde ${new Date(profile.createdAt).toLocaleDateString('pt-BR')}.`}
      </p>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<Sprout size={16} />} label="Seeds criadas" value={stats.totalSeeds} />
          <StatCard icon={<TrendingUp size={16} />} label="Projetos" value={stats.byStatus.PROJETO ?? 0} />
          <StatCard icon={<Flame size={16} />} label="Dias ativos" value={stats.activeDays} />
          <StatCard icon={<Globe2 size={16} />} label="Seeds públicas" value={stats.publicSeeds} />
        </div>
      )}

      {stats && (
        <div className="mb-8 rounded-seed border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-dim">Evolução das ideias</h3>
          <div className="space-y-2.5">
            {(['SEMENTE', 'CRESCENDO', 'PROJETO', 'COLHIDA'] as const).map((status) => {
              const count = stats.byStatus[status] ?? 0;
              const pct = stats.totalSeeds > 0 ? Math.round((count / stats.totalSeeds) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-xs text-text-dim">
                    <span className="capitalize">{status.toLowerCase()}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-seed-green-2 to-seed-green" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-text-faint">
            {stats.contributions} contribuições (edições e evoluções registradas no histórico)
          </div>
        </div>
      )}

      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-dim">Seeds públicas</h3>
      {profile.seeds.length === 0 && <p className="text-sm text-text-faint">Nenhuma Seed pública ainda.</p>}
      {profile.seeds.map((s) => (
        <SeedCard key={s.id} seed={{ ...s, owner: { id: profile.id, username: profile.username, name: profile.name, avatar: profile.avatar } } as Seed} />
      ))}
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-seed border border-border bg-card p-4 text-center">
      <div className="mb-1.5 flex justify-center text-seed-green">{icon}</div>
      <div className="text-xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-text-faint">{label}</div>
    </div>
  );
}
