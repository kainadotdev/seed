'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Bookmark, MessageCircle } from 'lucide-react';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { Seed, SeedType, AIMessage, Comment } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const TYPES: SeedType[] = [
  'PENSAMENTO', 'PROJETO', 'DOCUMENTO', 'OBJETIVO', 'CHECKLIST', 'DIARIO', 'ARTIGO', 'LIVRO', 'PLANEJAMENTO',
];

export default function SeedDetailPage() {
  return (
    <AuthGuard>
      <SeedDetailContent />
    </AuthGuard>
  );
}

function SeedDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [seed, setSeed] = useState<Seed | null>(null);
  const [related, setRelated] = useState<Seed[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    api
      .get<Seed>(`/seeds/${params.id}`)
      .then(setSeed)
      .catch(() => setNotFound(true));
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!seed?.isOwner) return;
    api.get<Seed[]>(`/seeds/${params.id}/related`).then(setRelated).catch(() => setRelated([]));
  }, [seed?.isOwner, params.id]);

  async function patch(data: Partial<Seed>) {
    if (!seed?.isOwner) return;
    const updated = await api.put<Seed>(`/seeds/${seed.id}`, data);
    setSeed({ ...seed, ...updated });
  }

  async function transform(type: SeedType) {
    if (!seed?.isOwner) return;
    const updated = await api.post<Seed>(`/seeds/${seed.id}/transform`, { type });
    setSeed({ ...seed, ...updated });
  }

  if (notFound) {
    return (
      <div className="py-16 text-center text-text-faint">
        <div className="mb-3.5 text-4xl">🔒</div>
        <div className="mb-1.5 font-semibold text-text">Esta Seed não está disponível</div>
        <div>Ela pode ser privada ou não existir mais.</div>
      </div>
    );
  }

  if (!seed) return <p className="text-sm text-text-faint">Carregando Seed...</p>;

  const isOwner = seed.isOwner ?? seed.ownerId === user?.id;

  return (
    <div className="relative">
      <button onClick={() => router.back()} className="mb-[18px] inline-flex items-center gap-1.5 text-sm font-semibold text-text-dim hover:text-seed-green">
        <ArrowLeft size={15} /> Voltar
      </button>

      {!isOwner && seed.owner && (
        <Link href={`/profile/${seed.owner.username}`} className="mb-3 flex items-center gap-2 text-sm text-text-dim hover:text-seed-green">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-seed-green-2 to-seed-green text-xs font-bold text-white">
            {seed.owner.name[0]?.toUpperCase()}
          </div>
          por <b>{seed.owner.name}</b>
        </Link>
      )}

      <input
        defaultValue={seed.title}
        onBlur={(e) => patch({ title: e.target.value })}
        readOnly={!isOwner}
        className="mb-1 w-full bg-transparent text-2xl font-bold tracking-tight outline-none"
      />
      <div className="mb-5 flex flex-wrap gap-3.5 text-xs text-text-faint">
        <span>🕐 Criada {timeAgo(seed.createdAt)} atrás</span>
        <span>📌 {seed.status}</span>
        <span>{seed.visibility === 'PUBLIC' ? '🌐 pública' : '🔒 privada'}</span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            disabled={!isOwner}
            onClick={() => transform(t)}
            title="Transformar Seed (histórico preservado)"
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold lowercase disabled:cursor-default ${
              seed.type === t ? 'border-transparent bg-seed-green-light text-seed-green' : 'border-border bg-bg-2 text-text-dim'
            }`}
          >
            {t.toLowerCase()}
          </button>
        ))}
      </div>

      <Textarea
        defaultValue={seed.content}
        readOnly={!isOwner}
        onBlur={(e) => patch({ content: e.target.value })}
        className="min-h-[200px] rounded-seed border border-border bg-card p-[18px] text-[15.5px] leading-relaxed focus:border-seed-green-2 focus:ring-4 focus:ring-[var(--green-glow)]"
      />

      <div className="my-[18px] flex flex-wrap gap-2.5">
        {isOwner ? (
          <>
            <Button variant="ghost" onClick={() => patch({ favorite: !seed.favorite })}>
              {seed.favorite ? '⭐ Favorito' : '☆ Favoritar'}
            </Button>
            <Button variant="ghost" onClick={() => patch({ visibility: seed.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC' })}>
              {seed.visibility === 'PUBLIC' ? '🌐 Público' : '🔒 Tornar público'}
            </Button>
            <Button variant="ghost" onClick={() => patch({ archived: !seed.archived })}>
              {seed.archived ? '📦 Arquivada' : '📦 Arquivar'}
            </Button>
            <Button variant="primary" onClick={() => setAiOpen(true)}>
              <Sparkles size={15} /> Desenvolver com IA
            </Button>
          </>
        ) : (
          <SaveButton seedId={seed.id} />
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-8">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-dim">Seeds relacionadas</h4>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/seed/${r.id}`}
                className="rounded-seed border border-border bg-card px-3.5 py-2.5 text-sm hover:border-seed-green-2"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-dim">Histórico de evolução</h4>
        {(seed.versions ?? []).map((v) => (
          <div key={v.id} className="flex gap-3 border-b border-border py-3 text-sm">
            <div className="mt-1.5 h-2 w-2 flex-none rounded-full bg-seed-green-2" />
            <div>
              {v.note ?? 'Atualização'}
              <span className="mt-0.5 block text-xs text-text-faint">{new Date(v.createdAt).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        ))}
      </div>

      {seed.visibility === 'PUBLIC' && <CommentsSection seedId={seed.id} />}

      {aiOpen && <AIDrawer seedId={seed.id} onClose={() => setAiOpen(false)} onSeedChanged={load} />}
    </div>
  );
}

function SaveButton({ seedId }: { seedId: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    api.get<Seed[]>('/seeds/saved').then((data) => setSaved(data.some((s) => s.id === seedId)));
  }, [seedId]);

  async function toggle() {
    setSaved((s) => !s);
    if (saved) await api.delete(`/seeds/${seedId}/save`);
    else await api.post(`/seeds/${seedId}/save`);
  }

  return (
    <Button variant={saved ? 'primary' : 'ghost'} onClick={toggle}>
      <Bookmark size={15} /> {saved ? 'Salva' : 'Salvar'}
    </Button>
  );
}

function CommentsSection({ seedId }: { seedId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    api.get<Comment[]>(`/seeds/${seedId}/comments`).then(setComments).catch(() => setComments([]));
  }, [seedId]);

  useEffect(() => { load(); }, [load]);

  async function send() {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await api.post(`/seeds/${seedId}/comments`, { content });
      setText('');
      load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-8">
      <h4 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-text-dim">
        <MessageCircle size={15} /> Comentários ({comments.length})
      </h4>
      <div className="mb-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Deixe um comentário..."
          className="flex-1 rounded-lg border border-border bg-bg-2 px-3.5 py-2.5 text-sm outline-none focus:border-seed-green-2"
        />
        <Button variant="primary" onClick={send} disabled={sending || !text.trim()}>Enviar</Button>
      </div>
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3 border-b border-border py-3 text-sm">
          <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-seed-green-2 to-seed-green text-xs font-bold text-white">
            {c.author.name[0]?.toUpperCase()}
          </div>
          <div>
            <b>{c.author.name}</b> <span className="text-xs text-text-faint">{timeAgo(c.createdAt)}</span>
            <p className="mt-0.5 text-text-dim">{c.content}</p>
          </div>
        </div>
      ))}
      {comments.length === 0 && <p className="text-sm text-text-faint">Seja o primeiro a comentar.</p>}
    </div>
  );
}

function AIDrawer({ seedId, onClose, onSeedChanged }: { seedId: string; onClose: () => void; onSeedChanged: () => void }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get<AIMessage[]>(`/ai/history?seedId=${seedId}`).then(setMessages).catch(() => setMessages([]));
  }, [seedId]);

  async function send(preset?: string) {
    const text = preset ?? input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    setMessages((prev) => [...prev, { id: 'tmp', role: 'USER', message: text, createdAt: new Date().toISOString() }]);
    try {
      const reply = await api.post<AIMessage>('/ai/message', { message: text, seedId });
      setMessages((prev) => [...prev, reply]);
      onSeedChanged();
    } finally {
      setSending(false);
    }
  }

  const suggestions = ['Transforme isso em projeto', 'Crie um checklist', 'Melhore essa ideia', 'Resuma essa Seed', 'Essa ideia está parada?'];

  return (
    <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[380px] flex-col border-l border-border bg-card shadow-[-8px_0_30px_rgba(0,0,0,.12)]">
      <div className="flex items-center justify-between border-b border-border p-[18px]">
        <b className="flex items-center gap-2 text-sm">🧠 IA desta Seed</b>
        <Button variant="icon" onClick={onClose}>✕</Button>
      </div>
      <div className="flex-1 space-y-3.5 overflow-y-auto p-[18px]">
        {messages.length === 0 && (
          <div className="rounded-2xl rounded-bl-sm bg-bg-2 p-3 text-sm">
            Oi! Sou a IA desta Seed. Posso ajudar a transformá-la em projeto, criar checklist, resumir ou fazer perguntas para desenvolver a ideia — a decisão final é sempre sua.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={m.id + i}
            className={`max-w-[88%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${
              m.role === 'USER'
                ? 'ml-auto rounded-br-sm bg-gradient-to-br from-seed-green-2 to-seed-green text-white'
                : 'rounded-bl-sm bg-bg-2'
            }`}
          >
            {m.message}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 px-[18px] pb-3">
        {suggestions.map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full bg-seed-green-light px-2.5 py-1.5 text-xs font-semibold text-seed-green">
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-2 border-t border-border p-[14px]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Pergunte algo à IA..."
          className="flex-1 rounded-lg border border-border bg-bg-2 px-3.5 py-2.5 text-sm outline-none focus:border-seed-green-2"
        />
        <Button variant="primary" size="icon" onClick={() => send()} disabled={sending}>➤</Button>
      </div>
    </div>
  );
}
