'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export default function SignupPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), username: username.trim().toLowerCase(), password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--green-glow), transparent 60%)' }}
      />
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-[400px] rounded-seed-lg border border-border bg-card p-9 px-8 shadow-seed"
      >
        <div className="mb-6 flex items-center justify-center gap-2 font-bold">
          <Sprout size={22} className="text-seed-green" /> Seed
        </div>
        <h2 className="mb-1.5 text-center text-xl tracking-tight">Plante sua conta</h2>
        <p className="mb-6 text-center text-sm text-text-dim">
          Sem email. Sem login do Google. Só você e suas ideias.
        </p>

        {error && (
          <div className="mb-3.5 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-500">{error}</div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">Nome</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">Usuário</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seu.usuario" required />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">Senha</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">Confirmar senha</label>
          <Input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="••••••••" required />
        </div>
        <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
          {loading ? 'Criando...' : 'Criar conta'}
        </Button>
        <div className="mt-5 text-center text-sm text-text-dim">
          Já tem conta? <Link href="/login" className="font-semibold text-seed-green">Entrar</Link>
        </div>
      </form>
    </div>
  );
}
