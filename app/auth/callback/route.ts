import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure profile role is set (handles email-confirmation flow)
      const role = data.user.user_metadata?.role as UserRole | undefined
      if (role && (role === 'CANDIDATO' || role === 'EMPRESA')) {
        const admin = createAdminClient()
        await admin.from('profiles').update({ role }).eq('id', data.user.id)

        if (role === 'CANDIDATO') {
          await admin
            .from('candidates')
            .upsert({ profile_id: data.user.id }, { onConflict: 'profile_id' })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
