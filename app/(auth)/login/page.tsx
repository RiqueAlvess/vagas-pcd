'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email ou senha inválidos. Verifique seus dados e tente novamente.')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
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
            A plataforma que conecta profissionais com deficiência a
            oportunidades de emprego em todo o Brasil.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm">Em conformidade com a Lei de Cotas — Lei 8.213/91</span>
          </div>
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

          <h2 className="text-2xl font-bold mb-1">Entrar</h2>
          <p className="text-sm text-slate-500 mb-8">
            Acesse sua conta para continuar
          </p>

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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-[#DC2626]">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#2563EB] hover:bg-[#1d4ed8] text-white border-0"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Não tem uma conta?{' '}
            <Link
              href="/signup"
              className="text-[#2563EB] font-medium hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
