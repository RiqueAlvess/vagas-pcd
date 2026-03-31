import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  UserPlus,
  Search,
  CheckCircle,
  BarChart2,
  ShieldCheck,
  Award,
  ArrowRight,
  Accessibility,
} from 'lucide-react'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const params = await searchParams

  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`)
  }

  return (
    <>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      <div className="min-h-screen flex flex-col bg-white">
        {/* ── NAVBAR ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <nav
            className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
            aria-label="Navegação principal"
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0"
              aria-label="VagasPCD – Página inicial"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white">
                <Accessibility className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-xl font-bold text-blue-600 tracking-tight">
                VagasPCD
              </span>
            </Link>

            {/* Center nav */}
            <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
              {[
                { label: 'Para Candidatos', href: '/signup?type=candidato' },
                { label: 'Para Empresas', href: '/signup?type=empresa' },
                { label: 'Como Funciona', href: '#como-funciona' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right CTAs */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/signup?type=candidato"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Cadastrar Grátis
              </Link>
            </div>
          </nav>
        </header>

        <main id="main-content">
          {/* ── HERO ────────────────────────────────────────────────── */}
          <section aria-labelledby="hero-heading" className="relative overflow-hidden">
            {/* Two-tone background */}
            <div className="absolute inset-0 flex" aria-hidden="true">
              <div className="w-full md:w-3/5 bg-white" />
              <div className="hidden md:block w-2/5 bg-[#F0F7FF]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
              <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Left column */}
                <div className="flex-1 md:w-3/5 max-w-xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
                    <span aria-hidden="true">🏆</span>
                    <span>Plataforma líder em inclusão PcD no Brasil</span>
                  </div>

                  <h1
                    id="hero-heading"
                    className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4"
                  >
                    Encontre vagas feitas{' '}
                    <span className="text-blue-600">para você</span>
                  </h1>

                  <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                    Conectamos profissionais com deficiência a empresas que valorizam diversidade e
                    cumprem a Lei de Cotas.
                  </p>

                  {/* Search bar */}
                  <form
                    action="/signup"
                    method="get"
                    className="flex items-stretch shadow-md rounded-full overflow-hidden border border-gray-200 bg-white mb-4"
                    role="search"
                    aria-label="Buscar vagas"
                  >
                    <label htmlFor="search-input" className="sr-only">
                      Buscar vagas por cargo, cidade ou deficiência
                    </label>
                    <input
                      id="search-input"
                      type="text"
                      name="q"
                      placeholder="Buscar vagas por cargo, cidade ou deficiência..."
                      className="flex-1 px-5 py-3.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0"
                      aria-label="Buscar vagas"
                    >
                      Buscar
                    </button>
                  </form>

                  {/* Quick filter pills */}
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Filtros rápidos">
                    {[
                      { label: '🌐 Remoto', type: 'candidato' },
                      { label: '👁 Visual', type: 'candidato' },
                      { label: '👂 Auditiva', type: 'candidato' },
                      { label: '♿ Física', type: 'candidato' },
                      { label: '🧠 Mental', type: 'candidato' },
                    ].map((pill) => (
                      <Link
                        key={pill.label}
                        href={`/signup?type=${pill.type}`}
                        role="listitem"
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-full border border-gray-200 transition-colors"
                      >
                        {pill.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right column — decorative job cards */}
                <div
                  className="hidden md:flex md:w-2/5 items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="relative w-72 h-80">
                    {/* Blue gradient background shape */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl" />

                    {/* Job card — bottom */}
                    <div
                      className="absolute bottom-4 left-2 right-8 bg-white shadow-lg rounded-xl p-4"
                      style={{ zIndex: 1, transform: 'rotate(-2deg)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          AT
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">Atendente</p>
                          <p className="text-xs text-gray-500">Rio de Janeiro</p>
                        </div>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                          🟢 Compatível
                        </span>
                      </div>
                    </div>

                    {/* Job card — middle */}
                    <div
                      className="absolute left-4 right-4 bg-white shadow-lg rounded-xl p-4"
                      style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          DX
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">Designer UX</p>
                          <p className="text-xs text-gray-500">Remoto</p>
                        </div>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                          🟢 Compatível
                        </span>
                      </div>
                    </div>

                    {/* Job card — top */}
                    <div
                      className="absolute top-4 left-8 right-2 bg-white shadow-lg rounded-xl p-4"
                      style={{ zIndex: 3, transform: 'rotate(2deg)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          TI
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">Analista de TI</p>
                          <p className="text-xs text-gray-500">São Paulo</p>
                        </div>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                          🟢 Compatível
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── STATS BAR ───────────────────────────────────────────── */}
          <section className="bg-blue-600 py-8" aria-label="Estatísticas da plataforma">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { value: '12.400+', label: 'Vagas Ativas' },
                  { value: '3.200+', label: 'Empresas Parceiras' },
                  { value: '89.000+', label: 'Candidatos Cadastrados' },
                  { value: 'Lei de Cotas', label: '100% Compliance' },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <dt className="text-2xl font-extrabold text-white">{stat.value}</dt>
                    <dd className="text-sm text-blue-200">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* ── HOW IT WORKS ────────────────────────────────────────── */}
          <section
            id="como-funciona"
            className="bg-white py-20"
            aria-labelledby="how-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <h2 id="how-heading" className="text-3xl font-extrabold text-gray-900 mb-2">
                  Como funciona
                </h2>
                <p className="text-gray-500">Em 3 passos simples</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {[
                  {
                    step: '1',
                    icon: <UserPlus className="w-6 h-6 text-white" aria-hidden="true" />,
                    title: 'Crie sua conta',
                    desc: 'Cadastre-se gratuitamente e envie seu laudo médico para validação.',
                  },
                  {
                    step: '2',
                    icon: <Search className="w-6 h-6 text-white" aria-hidden="true" />,
                    title: 'Encontre vagas compatíveis',
                    desc: 'Filtramos automaticamente vagas compatíveis com sua deficiência.',
                  },
                  {
                    step: '3',
                    icon: <CheckCircle className="w-6 h-6 text-white" aria-hidden="true" />,
                    title: 'Candidate-se em 1 clique',
                    desc: 'Aplique para vagas inclusivas com candidatura simplificada.',
                  },
                ].map((item, i) => (
                  <div key={item.step} className="relative flex flex-col items-center text-center">
                    {/* Arrow connector desktop only */}
                    {i < 2 && (
                      <div
                        className="hidden md:flex absolute top-8 left-[calc(50%+3.5rem)]"
                        aria-hidden="true"
                      >
                        <ArrowRight className="w-6 h-6 text-blue-300" />
                      </div>
                    )}

                    {/* Icon circle */}
                    <div className="relative mb-5">
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                        {item.icon}
                      </div>
                      <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center border-2 border-white">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FOR COMPANIES ───────────────────────────────────────── */}
          <section className="bg-[#1E3A5F] py-20" aria-labelledby="companies-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                {/* Left text */}
                <div className="flex-1 max-w-lg">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-3">
                    Para Empresas
                  </p>
                  <h2
                    id="companies-heading"
                    className="text-3xl font-extrabold text-white mb-4 leading-tight"
                  >
                    Cumpra a Lei de Cotas com eficiência
                  </h2>
                  <p className="text-white/70 text-base leading-relaxed mb-8">
                    Acesse um banco de candidatos PcD verificados, com laudos validados por médicos.
                    Dashboard completo para gestão de cotas.
                  </p>

                  <ul className="space-y-3 mb-8" aria-label="Benefícios para empresas">
                    {[
                      'Candidatos com laudos médicos verificados',
                      'Dashboard de gestão da Lei de Cotas',
                      'Aprovação médica de vagas inclusivas',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-white">
                        <span className="mt-0.5 text-green-400 font-bold text-lg leading-none" aria-hidden="true">
                          ✓
                        </span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup?type=empresa"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1E3A5F] font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                    aria-label="Cadastrar minha empresa no VagasPCD"
                  >
                    Cadastrar minha empresa
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>

                {/* Right feature cards */}
                <div className="flex-1 grid grid-cols-1 gap-4 w-full max-w-sm md:max-w-none">
                  {[
                    {
                      icon: <BarChart2 className="w-5 h-5 text-blue-600" aria-hidden="true" />,
                      title: 'Painel de Cotas',
                      desc: 'Acompanhe seu % de cumprimento em tempo real',
                    },
                    {
                      icon: <ShieldCheck className="w-5 h-5 text-blue-600" aria-hidden="true" />,
                      title: 'Candidatos Verificados',
                      desc: 'Laudos validados por profissionais de saúde',
                    },
                    {
                      icon: <Award className="w-5 h-5 text-blue-600" aria-hidden="true" />,
                      title: 'Vaga Inclusiva Certificada',
                      desc: 'Vagas revisadas e aprovadas por médicos',
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{card.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ────────────────────────────────────────── */}
          <section className="bg-gray-50 py-20" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <h2
                  id="testimonials-heading"
                  className="text-3xl font-extrabold text-gray-900 mb-2"
                >
                  Quem já usa VagasPCD
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    quote:
                      'Encontrei meu emprego em 2 semanas. O processo foi completamente acessível e respeitoso.',
                    name: 'Maria S.',
                    role: 'Analista de Dados · Deficiência Visual',
                    initials: 'MS',
                    color: 'bg-violet-500',
                  },
                  {
                    quote:
                      'A plataforma entende nossas necessidades. As vagas são realmente adaptadas.',
                    name: 'Carlos R.',
                    role: 'Desenvolvedor Frontend · Deficiência Auditiva',
                    initials: 'CR',
                    color: 'bg-blue-500',
                  },
                  {
                    quote:
                      'Contratamos 8 profissionais PcD qualificados em 1 mês. Superou nossas expectativas.',
                    name: 'Ana Lima',
                    role: 'RH Manager · Empresa Parceira',
                    initials: 'AL',
                    color: 'bg-emerald-500',
                  },
                ].map((t) => (
                  <figure
                    key={t.name}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
                  >
                    <div className="flex gap-0.5 mb-4" aria-label="Avaliação: 5 estrelas">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-lg" aria-hidden="true">
                          ★
                        </span>
                      ))}
                    </div>
                    <blockquote className="flex-1 text-gray-600 text-sm italic leading-relaxed mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                        aria-hidden="true"
                      >
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA ───────────────────────────────────────────── */}
          <section
            className="py-20 text-center"
            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
            aria-labelledby="cta-heading"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="text-3xl sm:text-4xl font-extrabold text-white mb-4"
              >
                Pronto para começar?
              </h2>
              <p className="text-white/80 text-lg mb-10">
                Junte-se a 89.000 profissionais PcD e 3.200 empresas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/signup?type=candidato"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-base"
                >
                  Sou Candidato PcD
                </Link>
                <Link
                  href="/signup?type=empresa"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition-colors text-base"
                >
                  Sou uma Empresa
                </Link>
              </div>

              <p className="text-white/60 text-sm">
                ✓ Gratuito para candidatos &nbsp;·&nbsp; ✓ Sem cartão de crédito &nbsp;·&nbsp; ✓
                Laudos verificados
              </p>
            </div>
          </section>
        </main>

        {/* ── FOOTER ──────────────────────────────────────────────── */}
        <footer className="bg-gray-900" aria-label="Rodapé">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-8">
            {/* Top 4-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
              {/* Col 1 — Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white">
                    <Accessibility className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-white font-bold text-base">VagasPCD</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  Conectando talentos PcD com empresas inclusivas.
                </p>
                {/* Social icon placeholders */}
                <div className="flex gap-3" aria-label="Redes sociais">
                  {['IN', 'TW', 'IG', 'YT'].map((s) => (
                    <div
                      key={s}
                      className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-400 text-xs font-bold"
                      aria-label={s}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2 — Candidatos */}
              <nav aria-label="Links para candidatos">
                <h3 className="text-white text-sm font-semibold mb-4">Candidatos</h3>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Buscar Vagas', href: '/signup?type=candidato' },
                    { label: 'Meu Perfil', href: '/candidato/perfil' },
                    { label: 'Upload de Laudo', href: '/candidato/laudo' },
                    { label: 'Minhas Candidaturas', href: '/candidato/candidaturas' },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Col 3 — Empresas */}
              <nav aria-label="Links para empresas">
                <h3 className="text-white text-sm font-semibold mb-4">Empresas</h3>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Publicar Vaga', href: '/signup?type=empresa' },
                    { label: 'Painel de Cotas', href: '/empresa/cotas' },
                    { label: 'Candidatos', href: '/empresa/candidatos' },
                    { label: 'Preços', href: '/empresa/precos' },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Col 4 — Legal */}
              <nav aria-label="Links legais">
                <h3 className="text-white text-sm font-semibold mb-4">Legal</h3>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Termos de Uso', href: '/termos' },
                    { label: 'Privacidade', href: '/privacidade' },
                    { label: 'LGPD', href: '/lgpd' },
                    { label: 'Cookies', href: '/cookies' },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-gray-500 text-xs">
                © 2025 VagasPCD. Todos os direitos reservados.
              </p>
              <p className="text-gray-500 text-xs text-center sm:text-right">
                Plataforma em conformidade com a Lei nº 8.213/91 (Lei de Cotas)
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
