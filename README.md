# SeedAI

> "Toda grande ideia começou como uma pequena semente."

Seed é uma plataforma para capturar pensamentos, ideias e projetos ("seeds"),
desenvolvê-los com ajuda de IA e acompanhar sua evolução ao longo do tempo em
uma timeline pessoal e pública.

## Site
https://seedai-frontend.vercel.app/home

## Estrutura do projeto

```
seed-fullstack-v1/
├── README.md
├── docker-compose.yml
├── .gitignore
│
├── frontend/                  # Next.js + TypeScript + Tailwind + shadcn/ui + Framer Motion
│   ├── app/
│   │   ├── page.tsx                     # Landing
│   │   ├── login/page.tsx               # Login
│   │   ├── signup/page.tsx              # Cadastro
│   │   ├── home/page.tsx                # Home
│   │   ├── timeline/page.tsx            # Timeline
│   │   ├── profile/[username]/page.tsx  # Perfil
│   │   ├── seed/[id]/page.tsx           # Seed detalhada
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── auth-guard.tsx
│   │   ├── seed/
│   │   │   ├── seed-card.tsx
│   │   │   └── capture-box.tsx
│   │   ├── theme-toggle.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── textarea.tsx
│   ├── lib/
│   │   ├── auth-context.tsx    # AuthProvider / useAuth
│   │   ├── api.ts              # cliente HTTP da API (fetch wrapper)
│   │   ├── types.ts            # tipos compartilhados (Seed, User, etc.)
│   │   └── utils.ts            # cn(), timeAgo(), etc.
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── next.config.js
│   └── .env.local.example
│
├── backend/                   # NestJS + Prisma + PostgreSQL
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── auth/               # JWT + bcrypt + refresh token (cookie httpOnly)
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/jwt-auth.guard.ts
│   │   │   ├── strategies/jwt.strategy.ts
│   │   │   ├── decorators/current-user.decorator.ts
│   │   │   └── dto/{login,register}.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.service.ts
│   │   ├── seeds/
│   │   │   ├── seeds.module.ts
│   │   │   ├── seeds.controller.ts
│   │   │   ├── seeds.service.ts
│   │   │   └── dto/{create-seed,update-seed}.dto.ts
│   │   └── ai/                 # proxy para o ai-service (FastAPI)
│   │       ├── ai.module.ts
│   │       ├── ai.controller.ts
│   │       ├── ai.service.ts
│   │       └── dto/send-message.dto.ts
│   ├── prisma/schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
└── ai-service/                 # FastAPI + Python
    ├── app/
    │   ├── main.py
    │   ├── config.py
    │   ├── schemas.py
    │   └── routers/
    │       ├── chat.py          # endpoint de chat com a Seed AI
    │       ├── embeddings.py    # geração de embeddings
    │       └── search.py        # busca semântica
    └── requirements.txt
```

## Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, componentes
no padrão shadcn/ui, Framer Motion para animações, lucide-react para ícones.

**Backend:** NestJS, Prisma ORM, PostgreSQL, autenticação JWT (access token em
memória + refresh token em cookie httpOnly), bcrypt para hashing de senha,
validação via class-validator/class-transformer.

**AI Service:** FastAPI (Python), estrutura modular preparada para chat,
geração de embeddings, busca semântica e memória de longo prazo (roadmap).

## Módulos do backend

| Módulo | Responsabilidade |
|--------|-------------------|
| `Auth` | Registro, login, refresh e emissão de JWT |
| `Users`| Perfil público de usuário (`/users/:username`) |
| `Seeds`| CRUD de seeds (criação, atualização, listagem, timeline) |
| `AI`   | Proxy autenticado para o `ai-service` (chat com a Seed AI) |

## Páginas do frontend

| Rota | Página |
|------|--------|
| `/` | Landing |
| `/login` | Login |
| `/signup` | Cadastro |
| `/home` | Home (captura + feed de seeds) |
| `/timeline` | Timeline (filtros: recentes, favoritos, arquivados, crescendo) |
| `/profile/[username]` | Perfil público (estatísticas estilo GitHub) |
| `/seed/[id]` | Seed detalhada (histórico, relacionadas, transformação, IA, comentários) |
| `/search` | Pesquisa inteligente em linguagem natural |
| `/community` | Feed público da comunidade (comentar/salvar) |

## Funcionalidades do MVP

- **Captura rápida** — a home permite escrever e plantar uma Seed sem exigir
  categoria, pasta ou projeto. Tipo e status são definidos depois.
- **IA por Seed** (`ai-service/app/ai_engine.py`) — motor heurístico local
  (sem custo, sem chave de API) que entende intenção (checklist, plano,
  resumo, melhoria, transformação, perguntas) e responde usando o conteúdo
  real da Seed. Pronto para ser trocado por um LLM real no futuro sem mudar
  o contrato com o backend.
- **Memória** — o backend monta "pistas de memória" (Seeds parecidas
  antigas, Seeds paradas há muito tempo) e envia ao ai-service junto da
  mensagem, para respostas como *"você escreveu algo parecido há 3 meses"*.
- **Histórico de evolução** — cada Seed guarda `SeedVersion`s: criação,
  edições de conteúdo e transformações de tipo.
- **Relacionamento** — `GET /seeds/:id/related` sugere Seeds do mesmo usuário
  por sobreposição de tags, tipo e palavras-chave.
- **Pesquisa inteligente** (`GET /seeds/search?q=`) — busca em linguagem
  natural: tokeniza a consulta, remove stopwords e pontua por relevância no
  título/conteúdo/tags/tipo/status.
- **Transformação** (`POST /seeds/:id/transform`) — muda o tipo da Seed
  (Projeto, Documento, Artigo, Checklist, Livro, Planejamento, Objetivo)
  preservando todo o histórico.
- **Perfil estilo GitHub** — `GET /users/:username/stats` retorna total de
  Seeds, Seeds por estágio, dias ativos e contribuições (versões geradas).
- **Compartilhamento e Comunidade** — toda Seed nasce privada; ao tornar
  pública, outras pessoas podem comentar (`/seeds/:id/comments`) e salvar
  (`/seeds/:id/save`) — nunca editar. Sem sistema de curtidas: o foco é
  conhecimento. A aba **Comunidade** lista o feed público e a aba
  **Buscar** oferece pesquisa em linguagem natural sobre as próprias Seeds.

## AI Service — roadmap

A estrutura do `ai-service` já está organizada para suportar:

- **Chat** (`app/routers/chat.py` + `app/ai_engine.py`) — conversa
  contextual sobre uma seed, hoje com motor heurístico local.
- **Embeddings** (`app/routers/embeddings.py`) — geração de vetores para
  conteúdo das seeds (placeholder, pronto para um modelo real).
- **Busca semântica** (`app/routers/search.py`) — recuperação de seeds
  relacionadas por similaridade vetorial (placeholder; a busca por palavras
  hoje já funciona via `SeedsService.search` no backend).
- **LLM real** — basta configurar `OPENAI_API_KEY` e trocar
  `generate_reply()` em `ai_engine.py` por uma chamada ao modelo, sem alterar
  o contrato de API consumido pelo backend NestJS.
