-- =============================================================================
-- PwD Job Platform — Initial Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all tables, indexes, RLS policies, functions, triggers,
--              and views for the People with Disabilities job marketplace.
-- =============================================================================


-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. profiles — extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email        text,
    full_name    text,
    avatar_url   text,
    role         text NOT NULL DEFAULT 'CANDIDATO'
                     CHECK (role IN ('CANDIDATO', 'EMPRESA', 'MEDICO', 'ADMIN')),
    status       text NOT NULL DEFAULT 'ATIVO'
                     CHECK (status IN ('ATIVO', 'INATIVO', 'SUSPENSO')),
    created_at   timestamp with time zone DEFAULT now(),
    updated_at   timestamp with time zone DEFAULT now()
);

-- 2. candidates — one-to-one with profiles
CREATE TABLE IF NOT EXISTS public.candidates (
    id                      uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio                     text,
    phone                   text,
    city                    text,
    state                   text,
    deficiency_types        jsonb NOT NULL DEFAULT '[]',
    deficiency_description  text,
    medical_status          text NOT NULL DEFAULT 'PENDENTE'
                                CHECK (medical_status IN ('PENDENTE', 'APROVADO', 'REJEITADO')),
    medical_report_url      text,
    medical_notes           text,
    medical_reviewed_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    medical_reviewed_at     timestamp with time zone,
    skills                  jsonb,
    years_experience        integer CHECK (years_experience >= 0),
    created_at              timestamp with time zone DEFAULT now(),
    updated_at              timestamp with time zone DEFAULT now()
);

-- 3. companies — one-to-one with profiles
CREATE TABLE IF NOT EXISTS public.companies (
    id               uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name     text NOT NULL,
    cnpj             text UNIQUE,
    website          text,
    description      text,
    logo_url         text,
    city             text,
    state            text,
    total_employees  integer CHECK (total_employees >= 0),
    pcds_hired       integer NOT NULL DEFAULT 0 CHECK (pcds_hired >= 0),
    verified         boolean NOT NULL DEFAULT false,
    created_at       timestamp with time zone DEFAULT now(),
    updated_at       timestamp with time zone DEFAULT now()
);

-- 4. jobs
CREATE TABLE IF NOT EXISTS public.jobs (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id               uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title                    text NOT NULL,
    description              text NOT NULL,
    accepted_deficiencies    jsonb NOT NULL,
    adaptations_description  text,
    city                     text,
    state                    text,
    is_remote                boolean NOT NULL DEFAULT false,
    salary_min               integer CHECK (salary_min >= 0),
    salary_max               integer CHECK (salary_max >= 0),
    contract_type            text,
    status                   text NOT NULL DEFAULT 'DRAFT'
                                 CHECK (status IN ('DRAFT', 'ATIVA', 'PAUSADA', 'FECHADA')),
    medical_approval         text NOT NULL DEFAULT 'PENDENTE'
                                 CHECK (medical_approval IN ('PENDENTE', 'APROVADO', 'REJEITADO')),
    medical_approved_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    medical_notes            text,
    published_at             timestamp with time zone,
    created_at               timestamp with time zone DEFAULT now(),
    updated_at               timestamp with time zone DEFAULT now()
);

-- 5. applications
CREATE TABLE IF NOT EXISTS public.applications (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id        uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    status              text NOT NULL DEFAULT 'ENVIADA'
                            CHECK (status IN ('ENVIADA', 'VISUALIZADA', 'ENTREVISTA', 'REJEITADA', 'CONTRATADA')),
    compatibility_score integer CHECK (compatibility_score BETWEEN 0 AND 100),
    applied_at          timestamp with time zone DEFAULT now(),
    updated_at          timestamp with time zone DEFAULT now(),
    UNIQUE (job_id, candidate_id)
);

-- 6. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action       text NOT NULL,
    entity_type  text,
    entity_id    uuid,
    metadata     jsonb,
    created_at   timestamp with time zone DEFAULT now()
);


-- =============================================================================
-- INDEXES
-- =============================================================================

-- candidates
CREATE INDEX IF NOT EXISTS idx_candidates_medical_status
    ON public.candidates (medical_status);

-- jobs
CREATE INDEX IF NOT EXISTS idx_jobs_company_id
    ON public.jobs (company_id);

CREATE INDEX IF NOT EXISTS idx_jobs_status
    ON public.jobs (status);

CREATE INDEX IF NOT EXISTS idx_jobs_medical_approval
    ON public.jobs (medical_approval);

-- applications
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id
    ON public.applications (candidate_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
    ON public.applications (job_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
    ON public.applications (status);

-- Full-text search on jobs (Portuguese)
CREATE INDEX IF NOT EXISTS idx_jobs_fts
    ON public.jobs USING GIN (to_tsvector('portuguese', title || ' ' || description));


-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function: set updated_at to now() on UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Function: auto-create profile on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, status)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        'CANDIDATO',
        'ATIVO'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;


-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger: create profile when a new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers: keep updated_at current
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_candidates_updated_at ON public.candidates;
CREATE TRIGGER set_candidates_updated_at
    BEFORE UPDATE ON public.candidates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_companies_updated_at ON public.companies;
CREATE TRIGGER set_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.jobs;
CREATE TRIGGER set_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs  ENABLE ROW LEVEL SECURITY;

-- Helper: get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- profiles policies
-- ---------------------------------------------------------------------------

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles: user reads own" ON public.profiles;
CREATE POLICY "profiles: user reads own"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

-- MEDICO and ADMIN can read all profiles
DROP POLICY IF EXISTS "profiles: medico/admin reads all" ON public.profiles;
CREATE POLICY "profiles: medico/admin reads all"
    ON public.profiles FOR SELECT
    USING (public.current_user_role() IN ('MEDICO', 'ADMIN'));

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles: user updates own" ON public.profiles;
CREATE POLICY "profiles: user updates own"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- candidates policies
-- ---------------------------------------------------------------------------

-- Candidate reads/updates own record
DROP POLICY IF EXISTS "candidates: owner reads own" ON public.candidates;
CREATE POLICY "candidates: owner reads own"
    ON public.candidates FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "candidates: owner updates own" ON public.candidates;
CREATE POLICY "candidates: owner updates own"
    ON public.candidates FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "candidates: owner inserts own" ON public.candidates;
CREATE POLICY "candidates: owner inserts own"
    ON public.candidates FOR INSERT
    WITH CHECK (id = auth.uid());

-- EMPRESA reads only APROVADO candidates
DROP POLICY IF EXISTS "candidates: empresa reads aprovado" ON public.candidates;
CREATE POLICY "candidates: empresa reads aprovado"
    ON public.candidates FOR SELECT
    USING (
        public.current_user_role() = 'EMPRESA'
        AND medical_status = 'APROVADO'
    );

-- MEDICO and ADMIN read all candidates
DROP POLICY IF EXISTS "candidates: medico/admin reads all" ON public.candidates;
CREATE POLICY "candidates: medico/admin reads all"
    ON public.candidates FOR SELECT
    USING (public.current_user_role() IN ('MEDICO', 'ADMIN'));

-- ---------------------------------------------------------------------------
-- companies policies
-- ---------------------------------------------------------------------------

-- Company reads/updates own record
DROP POLICY IF EXISTS "companies: owner reads own" ON public.companies;
CREATE POLICY "companies: owner reads own"
    ON public.companies FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "companies: owner updates own" ON public.companies;
CREATE POLICY "companies: owner updates own"
    ON public.companies FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "companies: owner inserts own" ON public.companies;
CREATE POLICY "companies: owner inserts own"
    ON public.companies FOR INSERT
    WITH CHECK (id = auth.uid());

-- CANDIDATO reads only verified companies
DROP POLICY IF EXISTS "companies: candidato reads verified" ON public.companies;
CREATE POLICY "companies: candidato reads verified"
    ON public.companies FOR SELECT
    USING (
        public.current_user_role() = 'CANDIDATO'
        AND verified = true
    );

-- MEDICO and ADMIN read all companies
DROP POLICY IF EXISTS "companies: medico/admin reads all" ON public.companies;
CREATE POLICY "companies: medico/admin reads all"
    ON public.companies FOR SELECT
    USING (public.current_user_role() IN ('MEDICO', 'ADMIN'));

-- ---------------------------------------------------------------------------
-- jobs policies
-- ---------------------------------------------------------------------------

-- Anyone (authenticated) reads ATIVA + APROVADO jobs
DROP POLICY IF EXISTS "jobs: public reads active/approved" ON public.jobs;
CREATE POLICY "jobs: public reads active/approved"
    ON public.jobs FOR SELECT
    USING (
        status = 'ATIVA'
        AND medical_approval = 'APROVADO'
    );

-- Company reads/writes their own jobs
DROP POLICY IF EXISTS "jobs: company reads own" ON public.jobs;
CREATE POLICY "jobs: company reads own"
    ON public.jobs FOR SELECT
    USING (
        public.current_user_role() = 'EMPRESA'
        AND company_id = auth.uid()
    );

DROP POLICY IF EXISTS "jobs: company inserts own" ON public.jobs;
CREATE POLICY "jobs: company inserts own"
    ON public.jobs FOR INSERT
    WITH CHECK (
        public.current_user_role() = 'EMPRESA'
        AND company_id = auth.uid()
    );

DROP POLICY IF EXISTS "jobs: company updates own" ON public.jobs;
CREATE POLICY "jobs: company updates own"
    ON public.jobs FOR UPDATE
    USING (
        public.current_user_role() = 'EMPRESA'
        AND company_id = auth.uid()
    )
    WITH CHECK (
        public.current_user_role() = 'EMPRESA'
        AND company_id = auth.uid()
    );

DROP POLICY IF EXISTS "jobs: company deletes own" ON public.jobs;
CREATE POLICY "jobs: company deletes own"
    ON public.jobs FOR DELETE
    USING (
        public.current_user_role() = 'EMPRESA'
        AND company_id = auth.uid()
    );

-- MEDICO reads jobs pending medical approval
DROP POLICY IF EXISTS "jobs: medico reads pendente" ON public.jobs;
CREATE POLICY "jobs: medico reads pendente"
    ON public.jobs FOR SELECT
    USING (
        public.current_user_role() = 'MEDICO'
        AND medical_approval = 'PENDENTE'
    );

-- MEDICO updates medical approval fields
DROP POLICY IF EXISTS "jobs: medico updates approval" ON public.jobs;
CREATE POLICY "jobs: medico updates approval"
    ON public.jobs FOR UPDATE
    USING (public.current_user_role() = 'MEDICO')
    WITH CHECK (public.current_user_role() = 'MEDICO');

-- ADMIN reads all jobs
DROP POLICY IF EXISTS "jobs: admin reads all" ON public.jobs;
CREATE POLICY "jobs: admin reads all"
    ON public.jobs FOR SELECT
    USING (public.current_user_role() = 'ADMIN');

-- ADMIN can do anything on jobs
DROP POLICY IF EXISTS "jobs: admin full access" ON public.jobs;
CREATE POLICY "jobs: admin full access"
    ON public.jobs FOR ALL
    USING (public.current_user_role() = 'ADMIN')
    WITH CHECK (public.current_user_role() = 'ADMIN');

-- ---------------------------------------------------------------------------
-- applications policies
-- ---------------------------------------------------------------------------

-- Candidate reads their own applications
DROP POLICY IF EXISTS "applications: candidate reads own" ON public.applications;
CREATE POLICY "applications: candidate reads own"
    ON public.applications FOR SELECT
    USING (candidate_id = auth.uid());

-- Candidate inserts their own application
DROP POLICY IF EXISTS "applications: candidate inserts own" ON public.applications;
CREATE POLICY "applications: candidate inserts own"
    ON public.applications FOR INSERT
    WITH CHECK (candidate_id = auth.uid());

-- Company reads applications for their own jobs
DROP POLICY IF EXISTS "applications: company reads for own jobs" ON public.applications;
CREATE POLICY "applications: company reads for own jobs"
    ON public.applications FOR SELECT
    USING (
        public.current_user_role() = 'EMPRESA'
        AND job_id IN (
            SELECT id FROM public.jobs WHERE company_id = auth.uid()
        )
    );

-- Company updates application status for their jobs
DROP POLICY IF EXISTS "applications: company updates status" ON public.applications;
CREATE POLICY "applications: company updates status"
    ON public.applications FOR UPDATE
    USING (
        public.current_user_role() = 'EMPRESA'
        AND job_id IN (
            SELECT id FROM public.jobs WHERE company_id = auth.uid()
        )
    )
    WITH CHECK (
        public.current_user_role() = 'EMPRESA'
        AND job_id IN (
            SELECT id FROM public.jobs WHERE company_id = auth.uid()
        )
    );

-- MEDICO and ADMIN read all applications
DROP POLICY IF EXISTS "applications: medico/admin reads all" ON public.applications;
CREATE POLICY "applications: medico/admin reads all"
    ON public.applications FOR SELECT
    USING (public.current_user_role() IN ('MEDICO', 'ADMIN'));

-- ---------------------------------------------------------------------------
-- audit_logs policies
-- ---------------------------------------------------------------------------

-- ADMIN reads all audit logs; no other role can read
DROP POLICY IF EXISTS "audit_logs: admin reads all" ON public.audit_logs;
CREATE POLICY "audit_logs: admin reads all"
    ON public.audit_logs FOR SELECT
    USING (public.current_user_role() = 'ADMIN');

-- Service role inserts audit logs (via API routes using service key)
DROP POLICY IF EXISTS "audit_logs: service role inserts" ON public.audit_logs;
CREATE POLICY "audit_logs: service role inserts"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);


-- =============================================================================
-- VIEWS
-- =============================================================================

-- View: compatible_jobs — cross-join jobs × candidates where at least one
-- deficiency_type overlaps with accepted_deficiencies AND the job is ATIVA
-- and medically APROVADO.
-- Usage: SELECT * FROM compatible_jobs WHERE candidate_id = auth.uid();
CREATE OR REPLACE VIEW public.compatible_jobs AS
SELECT
    j.id                      AS job_id,
    j.title,
    j.description,
    j.accepted_deficiencies,
    j.adaptations_description,
    j.city,
    j.state,
    j.is_remote,
    j.salary_min,
    j.salary_max,
    j.contract_type,
    j.published_at,
    c.id                      AS candidate_id,
    c.deficiency_types,
    co.company_name,
    co.logo_url               AS company_logo_url,
    co.verified               AS company_verified
FROM public.jobs j
CROSS JOIN public.candidates c
JOIN public.companies co
    ON co.id = j.company_id
WHERE
    j.status           = 'ATIVA'
    AND j.medical_approval = 'APROVADO'
    -- jsonb array overlap: at least one deficiency type in common
    AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(c.deficiency_types)        AS cdt (val)
        JOIN jsonb_array_elements_text(j.accepted_deficiencies)   AS jad (val)
          ON cdt.val = jad.val
    );

-- Note: query the view filtering by candidate_id, e.g.:
--   SELECT * FROM compatible_jobs WHERE candidate_id = auth.uid();


-- =============================================================================
-- Run: supabase db push
-- =============================================================================
