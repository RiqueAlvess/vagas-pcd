export type UserRole = 'CANDIDATO' | 'EMPRESA' | 'MEDICO' | 'ADMIN'

export type DeficiencyType = 'VISUAL' | 'AUDITIVA' | 'FISICA' | 'MENTAL' | 'MULTIPLA'

export type MedicalStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO'

export type JobStatus = 'DRAFT' | 'ATIVA' | 'PAUSADA' | 'FECHADA'

export type MedicalApproval = 'PENDENTE' | 'APROVADO' | 'REJEITADO'

export type ApplicationStatus =
  | 'ENVIADA'
  | 'VISUALIZADA'
  | 'ENTREVISTA'
  | 'REJEITADA'
  | 'CONTRATADA'

export interface Profile {
  id: string
  email: string
  role: UserRole
  full_name: string
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  bio: string | null
  phone: string | null
  city: string | null
  state: string | null
  deficiency_types: DeficiencyType[]
  deficiency_description: string | null
  medical_status: MedicalStatus
  medical_report_url: string | null
  medical_notes: string | null
  medical_reviewed_by: string | null
  medical_reviewed_at: string | null
  skills: string[] | null
  years_experience: number | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  profile_id: string
  cnpj: string
  trade_name: string
  legal_name: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  company_id: string
  title: string
  description: string
  location: string
  modality: string
  accepted_deficiencies: DeficiencyType[]
  status: JobStatus
  medical_approval: MedicalApproval
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  job_id: string
  candidate_id: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
}
