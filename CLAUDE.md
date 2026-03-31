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
6. Supabase redirect: configure /auth/callback in Supabase dashboard → Auth → URL Configuration. Without this, the auth code lands on homepage instead of being exchanged for a session.
7. Performance: middleware must NEVER query the DB. Role checks go in layout.tsx server components only.
8. Supabase SSR: always return `supabaseResponse` from middleware, never `NextResponse.next()`. Failing to do this breaks cookie forwarding and causes redirect loops. Also must set cookies on `request.cookies` AND recreate `NextResponse.next({ request })` inside `setAll`.
9. Supabase SSR: use `getUser()` not `getSession()` in middleware. `getSession()` does not validate the token server-side and does not refresh expired tokens.
10. Next.js 15: `searchParams` and `params` are Promises — always type them as `Promise<{...}>` and `await` them before accessing properties.
11. Redirect loops: never use `redirect()` inside a page based on business logic (e.g. missing candidates row). Use conditional rendering instead. Only redirect on missing auth.
12. Profile setup: when creating a new user profile, always create BOTH `profiles` AND `candidates` rows together (in `/auth/setup`). Creating only `profiles` and redirecting to `/candidato/laudo` causes a loop because that page needs the `candidates` row.

## Design Patterns
- Server Components fetch data directly via supabase server client
- Client Components handle interactions (forms, buttons)
- API routes (/api/*) handle mutations and use supabaseAdmin for service role ops
- Middleware handles auth redirect only (session check via JWT — no DB query); role enforcement is done in layout.tsx server components
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
