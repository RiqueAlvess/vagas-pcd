import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import MedicalReportUpload from '@/components/MedicalReportUpload'
import type { Candidate } from '@/lib/types'

export default async function CandidatoLaudoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: candidate } = await supabase
    .from('candidates')
    .select(
      'medical_status, medical_report_url, medical_notes'
    )
    .eq('id', user.id)
    .single<Pick<Candidate, 'medical_status' | 'medical_report_url' | 'medical_notes'>>()

  if (!candidate) redirect('/dashboard')

  const { medical_status, medical_report_url, medical_notes } = candidate

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Meu Laudo Médico</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Envie seu laudo médico para que um médico possa validar sua deficiência e
        liberar o acesso às vagas.
      </p>

      {/* PENDENTE — no report uploaded yet */}
      {medical_status === 'PENDENTE' && !medical_report_url && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-yellow-500 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Laudo não enviado</p>
              <p className="text-sm text-muted-foreground">
                Faça o upload do seu laudo médico em PDF para iniciar a análise.
              </p>
            </div>
          </div>
          <MedicalReportUpload />
        </div>
      )}

      {/* PENDENTE — report uploaded, awaiting review */}
      {medical_status === 'PENDENTE' && medical_report_url && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-yellow-600 shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900">Em análise</p>
              <p className="text-sm text-yellow-800">
                Aguardando análise médica. Você será notificado quando houver uma
                decisão.
              </p>
            </div>
            <span className="ml-auto inline-flex items-center rounded-full bg-yellow-200 px-2.5 py-0.5 text-xs font-medium text-yellow-900 shrink-0">
              Pendente
            </span>
          </div>
          <a
            href={`/api/candidates/medical/download?path=${encodeURIComponent(medical_report_url)}`}
            className="inline-flex items-center text-sm text-yellow-700 underline underline-offset-2 hover:text-yellow-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver PDF enviado
          </a>
        </div>
      )}

      {/* APROVADO */}
      {medical_status === 'APROVADO' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Laudo aprovado</p>
              <p className="text-sm text-green-800">
                Seu laudo foi validado — você pode se candidatar a vagas.
              </p>
            </div>
            <span className="ml-auto inline-flex items-center rounded-full bg-green-200 px-2.5 py-0.5 text-xs font-medium text-green-900 shrink-0">
              Aprovado
            </span>
          </div>
        </div>
      )}

      {/* REJEITADO */}
      {medical_status === 'REJEITADO' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <XCircle className="size-5 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Laudo rejeitado</p>
              <p className="text-sm text-red-800">
                Seu laudo não foi aprovado. Envie um novo documento corrigido.
              </p>
            </div>
            <span className="ml-auto inline-flex items-center rounded-full bg-red-200 px-2.5 py-0.5 text-xs font-medium text-red-900 shrink-0">
              Rejeitado
            </span>
          </div>
          {medical_notes && (
            <div className="rounded-md bg-red-100 px-4 py-3">
              <p className="text-xs font-medium text-red-900 mb-1">
                Observações do médico:
              </p>
              <p className="text-sm text-red-800 whitespace-pre-wrap">
                {medical_notes}
              </p>
            </div>
          )}
          <div className="pt-2">
            <MedicalReportUpload />
          </div>
        </div>
      )}
    </div>
  )
}
