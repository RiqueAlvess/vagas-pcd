import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  if (!profile) {
    // Profile not created yet — delegate to setup page which creates both
    // profile and candidates records atomically (do NOT create here and
    // redirect to /candidato/laudo — that causes a loop if candidates row is missing)
    redirect('/auth/setup')
  }

  // Redirect by role — no loading state, instant
  switch (profile.role) {
    case 'CANDIDATO': redirect('/candidato/laudo')
    case 'EMPRESA':   redirect('/empresa/vagas')
    case 'MEDICO':    redirect('/medico/laudos')
    case 'ADMIN':     redirect('/admin')
    default:          redirect('/candidato/laudo')
  }
}
