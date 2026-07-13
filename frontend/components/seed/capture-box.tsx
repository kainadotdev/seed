'use client';

import { useState } from 'react';
import { Image as ImageIcon, Paperclip, Mic, Link2, Code2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Seed } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

const tools = [
  { icon: ImageIcon, label: 'Imagem' },
  { icon: Paperclip, label: 'Arquivo' },
  { icon: Mic, label: 'Áudio' },
  { icon: Link2, label: 'Link' },
  { icon: Code2, label: 'Código' },
];

export function CaptureBox({ onCreated }: { onCreated: (seed: Seed) => void }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  async function plant() {
    const content = text.trim();
    if (!content || saving) return;
    setSaving(true);
    try {
      const seed = await api.post<Seed>('/seeds', { content });
      onCreated(seed);
      setText('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-7 rounded-seed-lg border border-border bg-card p-5 shadow-seed transition-shadow focus-within:ring-4 focus-within:ring-[var(--green-glow)]">
      <div className="mb-4">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">
          {greeting}, {user?.name.split(' ')[0]}. 🌱
        </h2>
        <p className="text-[15px] text-text-dim">O que você quer plantar hoje?</p>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva uma ideia, pensamento, meta, link, código..."
        className="min-h-[64px] text-[16.5px] leading-relaxed"
      />
      <div className="mt-2.5 flex items-center justify-between border-t border-border pt-3">
        <div className="flex gap-1">
          {tools.map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              type="button"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-text-faint hover:bg-bg-2 hover:text-seed-green"
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={!text.trim() || saving}
          onClick={plant}
          className="disabled:opacity-50"
        >
          {saving ? 'Plantando...' : 'Plantar 🌱'}
        </Button>
      </div>
    </div>
  );
}
