import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as UserRole | undefined

  if (role === 'CANDIDATO') redirect('/candidato/vagas')
  if (role === 'EMPRESA') redirect('/empresa/vagas')
  if (role === 'MEDICO') redirect('/medico/laudos')
  if (role === 'ADMIN') redirect('/admin')

  // Profile not configured yet (e.g. still being set up after email confirmation)
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-slate-600">Configurando sua conta…</p>
        <p className="text-sm text-slate-400">
          Se isso demorar, tente{' '}
          <a href="/login" className="text-[#2563EB] hover:underline">
            entrar novamente
          </a>
          .
        </p>
      </div>
    </div>
  )
}
