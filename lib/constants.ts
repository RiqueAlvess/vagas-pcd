import type { DeficiencyType, MedicalStatus, JobStatus, ApplicationStatus } from './types'

export const DEFICIENCY_TYPES: DeficiencyType[] = [
  'VISUAL',
  'AUDITIVA',
  'FISICA',
  'MENTAL',
  'MULTIPLA',
]

export const MEDICAL_STATUS: Record<MedicalStatus, MedicalStatus> = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  REJEITADO: 'REJEITADO',
}

export const JOB_STATUS: Record<JobStatus, JobStatus> = {
  DRAFT: 'DRAFT',
  ATIVA: 'ATIVA',
  PAUSADA: 'PAUSADA',
  FECHADA: 'FECHADA',
}

export const APPLICATION_STATUS: Record<ApplicationStatus, ApplicationStatus> = {
  ENVIADA: 'ENVIADA',
  VISUALIZADA: 'VISUALIZADA',
  ENTREVISTA: 'ENTREVISTA',
  REJEITADA: 'REJEITADA',
  CONTRATADA: 'CONTRATADA',
}
