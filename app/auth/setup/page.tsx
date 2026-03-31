import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function SetupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if profile already exists (race condition guard)
  const { data: existing } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (existing) {
    redirect('/dashboard')
  }

  // Create both profile and candidates records atomically
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin.from('profiles').insert({
    id: user.id,
    email: user.email!,
    role: 'CANDIDATO',
    status: 'ATIVO',
  })
  await supabaseAdmin.from('candidates').insert({
    id: user.id,
    deficiency_types: [],
    medical_status: 'PENDENTE',
  })

  redirect('/candidato/laudo')
}
