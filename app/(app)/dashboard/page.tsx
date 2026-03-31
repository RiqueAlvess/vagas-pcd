import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Profile missing — create it as safety net (e.g. race condition after email confirmation)
  if (!profile) {
    const supabaseAdmin = createAdminClient()
    await supabaseAdmin.from('profiles').insert({
      id: user.id,
      email: user.email!,
      role: 'CANDIDATO',
      status: 'ATIVO',
    })
    redirect('/candidato/laudo')
  }

  // Redirect by role — no loading state, instant
  switch (profile.role) {
    case 'CANDIDATO': redirect('/candidato/vagas')
    case 'EMPRESA':   redirect('/empresa/vagas')
    case 'MEDICO':    redirect('/medico/laudos')
    case 'ADMIN':     redirect('/admin')
    default:          redirect('/candidato/vagas')
  }
}
