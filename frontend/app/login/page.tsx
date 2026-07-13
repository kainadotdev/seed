'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username: username.trim().toLowerCase(), password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
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
        <h2 className="mb-1.5 text-center text-xl tracking-tight">Bem-vindo de volta</h2>
        <p className="mb-6 text-center text-sm text-text-dim">Entre para continuar cultivando suas ideias.</p>

        {error && (
          <div className="mb-3.5 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-500">{error}</div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">Usuário</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seu.usuario" required />
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-semibold text-text-dim">Senha</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
        <div className="mt-5 text-center text-sm text-text-dim">
          Não tem conta? <Link href="/signup" className="font-semibold text-seed-green">Criar conta</Link>
        </div>
      </form>
    </div>
  );
}
