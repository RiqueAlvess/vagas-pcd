import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  // 1. Validate auth
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  // 2. Validate user role = CANDIDATO
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'CANDIDATO') {
    return NextResponse.json(
      { error: 'Apenas candidatos podem enviar laudos.' },
      { status: 403 }
    )
  }

  // 3. Parse and validate file
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: 'Requisição inválida.' },
      { status: 400 }
    )
  }

  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Nenhum arquivo enviado.' },
      { status: 400 }
    )
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'Apenas arquivos PDF são aceitos.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'O arquivo deve ter no máximo 5 MB.' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // 4. Upload to Supabase Storage: path = {userId}/{timestamp}.pdf
  const timestamp = Date.now()
  const storagePath = `${user.id}/${timestamp}.pdf`
  const fileBuffer = await file.arrayBuffer()

  const { error: uploadError } = await admin.storage
    .from('medical-reports')
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: 'Erro ao armazenar o arquivo. Tente novamente.' },
      { status: 500 }
    )
  }

  // 5. Update candidates table
  const { error: updateError } = await admin
    .from('candidates')
    .update({
      medical_report_url: storagePath,
      medical_status: 'PENDENTE',
    })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json(
      { error: 'Erro ao atualizar o registro. Tente novamente.' },
      { status: 500 }
    )
  }

  // 6. Insert audit log
  await admin.from('audit_logs').insert({
    user_id: user.id,
    action: 'UPLOAD_MEDICAL_REPORT',
    entity_type: 'candidate',
    entity_id: user.id,
    metadata: { storage_path: storagePath },
  })

  // 7. Send email notification to MEDICO
  const medicoEmail = process.env.MEDICO_NOTIFICATION_EMAIL
  if (medicoEmail) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'noreply@pcd.jobs',
        to: medicoEmail,
        subject: 'Novo laudo médico aguardando análise',
        html: `
          <p>Um candidato enviou um novo laudo médico e aguarda análise.</p>
          <p><strong>ID do candidato:</strong> ${user.id}</p>
          <p>Acesse a plataforma para revisar o documento.</p>
        `,
      })
    } catch {
      // Email failure must not block the upload response
    }
  }

  return NextResponse.json({ success: true })
}
