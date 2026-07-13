'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const stages = [
  { label: 'SEED', text: '"Quero criar um jogo."' },
  {
    label: 'IA AJUDA A DESENVOLVER',
    text: 'Objetivo, público, tecnologias e etapas definidos com a Seed AI.',
  },
  {
    label: 'PROJETO',
    text: 'Checklist, cronograma, documentação e colaboradores.',
    tags: ['Checklist', 'Documentação', 'Colaboradores'],
  },
];

const steps = [
  { n: 1, title: 'Capture qualquer coisa', desc: 'Uma frase, uma ideia, um objetivo. Sem categorias, sem fricção.' },
  { n: 2, title: 'A IA ajuda a desenvolver', desc: 'Perguntas certas, sugestões e estrutura para fazer a ideia crescer.' },
  { n: 3, title: 'Transforme em projetos', desc: 'Checklist, cronograma, documentação — tudo gerado a partir da Seed.' },
  { n: 4, title: 'Colabore e compartilhe', desc: 'Convide pessoas, comente, e publique quando estiver pronto.' },
];

const benefits = [
  { ic: '🌱', title: 'Nunca perder ideias', desc: 'Tudo fica guardado, com histórico completo de evolução.' },
  { ic: '🧠', title: 'Desenvolver pensamentos', desc: 'A IA pergunta o que falta e ajuda a lapidar cada Seed.' },
  { ic: '🚀', title: 'Criar projetos reais', desc: 'Do rascunho ao produto: checklists, prazos e arquivos.' },
  { ic: '💾', title: 'Memória inteligente', desc: 'Encontre qualquer ideia antiga com busca por contexto.' },
  { ic: '🤝', title: 'Trabalhar com outras pessoas', desc: 'Colaboradores, comentários e permissões, como no Figma.' },
  { ic: '🌐', title: 'Publicar quando quiser', desc: 'Tudo nasce privado. Você escolhe o que compartilhar.' },
];

const faqs = [
  { q: 'O que é Seed?', a: 'Seed é uma plataforma para capturar qualquer pensamento ou ideia em segundos e deixá-la evoluir com ajuda de inteligência artificial.' },
  { q: 'A IA lê minhas informações?', a: 'A IA analisa apenas as Seeds que você escolhe desenvolver com ela. Você controla o que compartilhar.' },
  { q: 'Posso compartilhar ideias?', a: 'Sim. Toda Seed nasce privada. Você decide quais tornar públicas para a comunidade.' },
  { q: 'Posso trabalhar com outras pessoas?', a: 'Sim, é possível convidar colaboradores e acompanhar o histórico de alterações.' },
  { q: 'Existe modo privado?', a: 'Sim, esse é o padrão. Nada é publicado automaticamente.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border py-5">
      <button
        className="flex w-full items-center justify-between text-left text-base font-semibold"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{q}</span>
        <ChevronRight
          size={18}
          className={`text-text-faint transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed text-text-dim">{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1100px] items-center justify-between px-6">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <Sprout className="text-seed-green" size={26} /> Seed
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link href="/login"><Button variant="ghost">Entrar</Button></Link>
            <Link href="/signup"><Button variant="primary">Criar conta</Button></Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pb-16 pt-28 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-[-200px] h-[500px] w-[900px] -translate-x-1/2 opacity-70"
          style={{ background: 'radial-gradient(ellipse at center, var(--green-glow), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-[1100px]">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-seed-green-light px-3.5 py-1.5 text-sm font-semibold text-seed-green">
            🌱 Uma nova categoria de produto
          </span>
          <h1 className="mx-auto max-w-3xl text-[clamp(34px,6vw,64px)] font-bold leading-[1.08] tracking-tight">
            Toda grande ideia começou como{' '}
            <span className="bg-gradient-to-br from-seed-green-2 to-seed-green bg-clip-text text-transparent">
              uma pequena semente.
            </span>
          </h1>
          <p className="mx-auto mb-9 mt-5 max-w-xl text-lg text-text-dim">
            Capture pensamentos, desenvolva ideias com inteligência artificial e transforme
            pequenas sementes em grandes projetos.
          </p>
          <div className="mb-16 flex flex-wrap justify-center gap-3.5">
            <Link href="/signup"><Button variant="primary" size="lg">Criar conta grátis</Button></Link>
            <Link href="/login"><Button variant="ghost" size="lg">Entrar</Button></Link>
          </div>

          <div className="mx-auto max-w-[640px] rounded-seed-lg border border-border bg-card p-7 text-left shadow-seed">
            {stages.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.4, duration: 0.6 }}
                className="flex items-start gap-3.5 py-3.5"
              >
                <div className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-seed-green-2 shadow-[0_0_0_4px_var(--green-light)]" />
                <div>
                  <b className="block text-xs font-semibold text-text-faint">{s.label}</b>
                  <span className="text-[15.5px]">{s.text}</span>
                  {s.tags && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.tags.map((t) => (
                        <span key={t} className="rounded-full bg-seed-green-light px-2.5 py-1 text-xs font-semibold text-seed-green">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-seed-green">Como funciona</div>
            <h2 className="text-3xl font-bold tracking-tight">Capture primeiro. Organize depois. Desenvolva sempre.</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-seed border border-border bg-card p-6 transition-transform hover:-translate-y-1 hover:shadow-seed">
                <div className="mb-4 flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-seed-green-light font-bold text-seed-green">{s.n}</div>
                <h3 className="mb-2 font-semibold">{s.title}</h3>
                <p className="text-sm text-text-dim">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-2 px-6 py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-seed-green">Benefícios</div>
            <h2 className="text-3xl font-bold tracking-tight">Uma memória inteligente para suas ideias</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-seed border border-border bg-card p-6 transition-transform hover:-translate-y-1 hover:shadow-seed">
                <div className="mb-3.5 text-2xl">{b.ic}</div>
                <h3 className="mb-2 font-semibold">{b.title}</h3>
                <p className="text-sm text-text-dim">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-[720px]">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-seed-green">FAQ</div>
            <h2 className="text-3xl font-bold tracking-tight">Perguntas frequentes</h2>
          </div>
          {faqs.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-2 font-bold"><Sprout size={20} className="text-seed-green" /> Seed</div>
          <div className="flex flex-wrap gap-7 text-sm text-text-dim">
            <a href="#">Sobre</a><a href="#">Termos</a><a href="#">Privacidade</a><a href="#">Contato</a><a href="#">Redes sociais</a>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-[1100px] text-center text-xs text-text-faint">
          © 2026 Seed. Ideias nunca morrem — elas crescem.
        </div>
      </footer>
    </div>
  );
}
