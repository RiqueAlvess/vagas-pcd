import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { role } = (await request.json()) as { role: UserRole }

  if (role !== 'CANDIDATO' && role !== 'EMPRESA') {
    return NextResponse.json({ error: 'Papel inválido.' }, { status: 400 })
  }

  // Verify caller is authenticated
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Update profile role (profile row is created by DB trigger on auth.users insert)
  const { error: profileError } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', user.id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Create candidate record for PcD users
  if (role === 'CANDIDATO') {
    const { error: candidateError } = await admin
      .from('candidates')
      .upsert({ profile_id: user.id }, { onConflict: 'profile_id' })

    if (candidateError) {
      return NextResponse.json({ error: candidateError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
