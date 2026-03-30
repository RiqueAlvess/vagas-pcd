'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserRole } from '@/lib/types'

type SignupRole = Extract<UserRole, 'CANDIDATO' | 'EMPRESA'>

const ROLE_OPTIONS: { value: SignupRole; label: string; description: string }[] = [
  {
    value: 'CANDIDATO',
    label: 'Sou Candidato PcD',
    description: 'Busco oportunidades de emprego inclusivas',
  },
  {
    value: 'EMPRESA',
    label: 'Represento uma Empresa',
    description: 'Quero contratar profissionais com deficiência',
  },
]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<SignupRole>('CANDIDATO')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      // Auto-confirmed: complete profile setup via API
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao configurar conta. Tente novamente.')
        setLoading(false)
        return
      }

      window.location.href = role === 'CANDIDATO' ? '/candidato/laudo' : '/empresa/onboarding'
      return
    }

    // Email confirmation required
    setMessage(
      'Cadastro realizado! Verifique seu email para confirmar a conta antes de entrar.'
    )
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0f172a] p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight">PcD Jobs</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Conectando talentos PcD com empresas inclusivas
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Crie sua conta gratuita e acesse centenas de vagas inclusivas em
            todo o Brasil.
          </p>
          <ul className="space-y-3">
            {[
              'Vagas validadas por profissionais de saúde',
              'Compatibilidade automática com seu perfil',
              'Empresas comprometidas com inclusão',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-slate-600 text-sm">
          © {new Date().getFullYear()} PcD Jobs. Todos os direitos reservados.
        </p>
      </div>

      {/* Form Panel */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="font-bold text-lg">PcD Jobs</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Criar conta</h2>
          <p className="text-sm text-slate-500 mb-8">
            Junte-se à plataforma de emprego inclusiva
          </p>

          {message ? (
            <div className="rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/20 p-4">
              <p className="text-sm text-[#16A34A] font-medium">{message}</p>
              <p className="text-sm text-slate-600 mt-2">
                Após confirmar,{' '}
                <Link href="/login" className="text-[#2563EB] hover:underline font-medium">
                  clique aqui para entrar
                </Link>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de conta</Label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={[
                        'w-full text-left rounded-lg border-2 p-3 transition-colors',
                        role === option.value
                          ? 'border-[#2563EB] bg-[#2563EB]/5'
                          : 'border-slate-200 hover:border-slate-300',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={[
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                          role === option.value ? 'border-[#2563EB]' : 'border-slate-300',
                        ].join(' ')}>
                          {role === option.value && (
                            <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{option.label}</p>
                          <p className="text-xs text-slate-500">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-[#DC2626]">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#2563EB] hover:bg-[#1d4ed8] text-white border-0"
              >
                {loading ? 'Criando conta…' : 'Criar conta'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-[#2563EB] font-medium hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
