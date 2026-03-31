# PcD Jobs Platform — CLAUDE.md

## Overview
Job marketplace for People with Disabilities (PwD) complying with Brazilian Lei de Cotas.
Stack: Next.js 14 App Router, TypeScript, Supabase, Resend, Vercel.

## Roles
- CANDIDATO: uploads medical report, browses/applies to jobs
- EMPRESA: creates job listings, views candidates
- MEDICO: approves/rejects medical reports and job listings
- ADMIN: system oversight

## Critical Business Rules
1. A CANDIDATO can only view jobs if medical_status = 'APROVADO'
2. A job is only visible if status = 'ATIVA' AND medical_approval = 'APROVADO'
3. Medical reports (laudos) are stored in Supabase Storage bucket 'medical-reports'
4. Compatibility check: candidate's deficiency_types must overlap with job's accepted_deficiencies
5. A candidate cannot apply to the same job twice (unique constraint in DB)

## Deficiency Types (ENUM)
VISUAL, AUDITIVA, FISICA, MENTAL, MULTIPLA

## Status Values
- candidates.medical_status: PENDENTE | APROVADO | REJEITADO
- jobs.status: DRAFT | ATIVA | PAUSADA | FECHADA
- jobs.medical_approval: PENDENTE | APROVADO | REJEITADO
- applications.status: ENVIADA | VISUALIZADA | ENTREVISTA | REJEITADA | CONTRATADA

## Supabase Config
- URL: process.env.NEXT_PUBLIC_SUPABASE_URL
- Anon key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
- Service role: process.env.SUPABASE_SERVICE_ROLE_KEY (server-only, never expose)

## Common Hurdles
1. Supabase SSR requires @supabase/ssr, not @supabase/auth-helpers-nextjs
2. Server components use createServerClient from @supabase/ssr with cookies()
3. Client components use createBrowserClient from @supabase/ssr
4. RLS policies enforce authorization at DB level — always trust RLS, not app-level checks
5. Storage bucket 'medical-reports' must be created manually in Supabase dashboard

## Design Patterns
- Server Components fetch data directly via supabase server client
- Client Components handle interactions (forms, buttons)
- API routes (/api/*) handle mutations and use supabaseAdmin for service role ops
- Middleware handles auth redirect and role-based routing
- Never use 'any' type — define all types in lib/types.ts
- Auth pattern: always use createServerClient in server components, createBrowserClient in client components

## Storage Patterns
- Always prefix storage paths with `{userId}/{timestamp}.ext` to prevent collisions and path traversal
- Use the admin client (service role) for all storage uploads — never the anon client
- Bucket `medical-reports` must be created manually in the Supabase dashboard before uploads work

## Post-Implementation Checklist
- [ ] TypeScript compiles without errors (npm run build)
- [ ] ESLint passes (npm run lint)
- [ ] All env vars documented in .env.local.example
- [ ] CLAUDE.md updated with new patterns discovered
