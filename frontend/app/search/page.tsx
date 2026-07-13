'use client';

import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { AuthGuard } from '@/components/layout/auth-guard';
import { SeedCard } from '@/components/seed/seed-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Seed } from '@/lib/types';

const EXAMPLES = [
  'ideias sobre um jogo',
  'checklists que estão paradas',
  'projetos favoritos',
  'algo que escrevi sobre livro',
];

export default function SearchPage() {
  return (
    <AuthGuard>
      <SearchContent />
    </AuthGuard>
  );
}

function SearchContent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Seed[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch(q: string) {
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    setQuery(term);
    try {
      const data = await api.get<Seed[]>(`/seeds/search?q=${encodeURIComponent(term)}`);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-1 text-xl font-bold tracking-tight">Pesquisa inteligente</h1>
      <p className="mb-5 text-sm text-text-dim">
        Não é apenas busca por texto — descreva o que procura com suas próprias palavras.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="mb-4 flex gap-2"
      >
        <div className="relative flex-1">
          <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex.: aquela ideia sobre programação de mês passado"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="primary" disabled={loading || !query.trim()}>
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </form>

      {results === null && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => runSearch(ex)}
              className="rounded-full border border-border bg-bg-2 px-3 py-1.5 text-xs font-medium text-text-dim hover:border-seed-green-2 hover:text-seed-green"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {results !== null && results.length === 0 && (
        <div className="py-16 text-center text-text-faint">
          <div className="mb-3.5 text-4xl">🔍</div>
          <div>Nenhuma Seed encontrada para "{query}".</div>
        </div>
      )}

      {results?.map((s) => <SeedCard key={s.id} seed={s} />)}
    </>
  );
}
