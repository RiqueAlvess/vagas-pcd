import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BriefcaseBusiness, FileText, ClipboardList, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Candidate, MedicalStatus } from '@/lib/types'

function StatusBadge({ status }: { status: MedicalStatus }) {
  if (status === 'APROVADO') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        Aprovado
      </span>
    )
  }
  if (status === 'REJEITADO') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        Rejeitado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
      Pendente
    </span>
  )
}

export default async function CandidatoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'CANDIDATO') redirect('/dashboard')

  const { data: candidate } = await supabase
    .from('candidates')
    .select('medical_status')
    .eq('id', user.id)
    .single<Pick<Candidate, 'medical_status'>>()

  const medicalStatus = candidate?.medical_status ?? 'PENDENTE'
  const isAprovado = medicalStatus === 'APROVADO'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground truncate">
            {profile.full_name ?? user.email}
          </p>
          <div className="mt-1.5">
            <StatusBadge status={medicalStatus} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {/* Vagas — locked unless APROVADO */}
          {isAprovado ? (
            <Link
              href="/candidato/vagas"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <BriefcaseBusiness className="size-4 shrink-0" />
              Vagas
            </Link>
          ) : (
            <span
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed select-none"
              title="Aprovação médica necessária para visualizar vagas"
            >
              <BriefcaseBusiness className="size-4 shrink-0" />
              Vagas
              <Lock className="size-3 ml-auto shrink-0" />
            </span>
          )}

          <Link
            href="/candidato/laudo"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="size-4 shrink-0" />
            Meu Laudo
          </Link>

          <Link
            href="/candidato/aplicacoes"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ClipboardList className="size-4 shrink-0" />
            Minhas Candidaturas
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
