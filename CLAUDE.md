# BarberSaaS — Contexto do Projeto

Importante: leia também o AGENTS.md deste projeto antes de escrever qualquer código. Este é Next.js 16, que tem breaking changes em relação a versões anteriores.

## Stack
- Next.js 16 (App Router, Turbopack default) + TypeScript
- Tailwind CSS v4 + shadcn/ui (componentes em `components/ui`)
- Prisma ORM + PostgreSQL (Neon)
- Auth.js v5 (email/senha + Google)
- Stripe (assinatura mensal, modo test)
- Resend (email)
- Zod + React Hook Form
- Deploy: Vercel

## Estrutura de pastas (SEM src/)
- `app/(marketing)/` — landing, preços
- `app/(auth)/` — entrar, cadastrar, onboarding
- `app/(dashboard)/` — painel protegido do dono
- `app/b/[slug]/` — página pública da barbearia
- `app/api/` — webhooks
- `components/ui/` — shadcn components
- `components/shared/` — componentes do projeto
- `lib/` — auth.ts, db.ts, stripe.ts, utils.ts
- `server/actions/` — Server Actions organizados por feature
- `types/` — tipos globais

## Arquitetura
- SaaS multi-tenant: cada User é dono de 1 Barbershop
- Toda query de dados sensíveis DEVE filtrar por `barbershopId`
- Proteção de rotas usa `proxy.ts` (Next 16 renomeou middleware.ts → proxy.ts)
- Rotas `/dashboard/*` exigem sessão + assinatura ativa
- Rotas `/b/[slug]/*` são públicas

## Convenções Next 16
- `params` e `searchParams` são Promise<>. Sempre `await` antes de usar.
- Em tipos: use `PageProps<'/rota'>`, `LayoutProps<'/rota'>` (gerados por `next typegen`)
- `cookies()`, `headers()`, `draftMode()` são async — sempre `await`
- Proteção de rotas: arquivo chama `proxy.ts` (não `middleware.ts`), função chama `proxy` (não `middleware`)

## Convenções de código
- Idioma: código em inglês, textos de UI em português brasileiro
- Server Actions em `server/actions/` organizadas por feature (ex: `appointments.ts`)
- Schemas Zod vivem junto da action que os usa
- Nunca use `any` — prefira `unknown` + validação Zod
- Tabelas Prisma: PascalCase singular (User, Barbershop, Appointment)
- Commits: Conventional Commits (feat:, fix:, chore:, docs:)

## Regras de negócio
- Assinatura expirada → dashboard bloqueado, página pública visível mas sem novos agendamentos
- Agendamento statuses: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
- Cliente final NÃO tem conta — preenche nome/telefone/email no fluxo de agendamento
- Slug da barbearia é único no sistema inteiro

## O que NÃO fazer
- Não usar código sincrônico pra params/searchParams/cookies/headers (Next 16 quebrou isso)
- Não usar `localStorage` pra dados sensíveis
- Não fazer queries sem filtro de tenant
- Não instalar Material UI, Chakra ou outras UI libs — já temos shadcn
- Não mexer em `.env` sem avisar
- Não criar `middleware.ts` — usar `proxy.ts`
