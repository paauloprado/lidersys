import { Users, Target, TrendingUp, Calendar, UserCheck } from 'lucide-react'
import { getCachedDashboardMetrics, getCachedMetaEleitores } from '@/lib/supabase/cachedQueries'
import { getSessionProfile, getSessionUser } from '@/lib/supabase/authCache'
import MetaCard from './MetaCard'

export default async function DashboardPage() {
  const [{ totalCabos, totalEleitores }, meta, user] = await Promise.all([
    getCachedDashboardMetrics(),
    getCachedMetaEleitores(),
    getSessionUser(),
  ])

  const profile = user ? await getSessionProfile(user.id) : null
  const isAdmin = profile?.role === 'admin'

  const currentDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        {/* Decoração de Fundo */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-brand-primary/15 to-brand-dark/5 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-brand-primary font-bold mb-2 text-xs sm:text-sm tracking-wide uppercase">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-dark tracking-tight">Visão Geral da Campanha</h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg font-medium max-w-2xl">
            Acompanhe em tempo real a evolução da sua base eleitoral, fichas e articulações de campo.
          </p>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Card: Cabos Eleitorais — agora conta usuários com role='lideranca' */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow group relative overflow-hidden">
          <div className="flex items-start justify-between mb-5 sm:mb-6 relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-primary/15 transition-all">
              <UserCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" />
              Ativo
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl sm:text-5xl font-black text-brand-dark tracking-tight">{totalCabos}</h3>
            <p className="text-slate-500 font-bold mt-1 text-sm sm:text-base">Cabos Eleitorais Ativos no Sistema</p>
          </div>
        </div>

        {/* Card: Eleitores */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow group relative overflow-hidden">
          <div className="flex items-start justify-between mb-5 sm:mb-6 relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-primary/15 transition-all">
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" />
              Ativo
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl sm:text-5xl font-black text-brand-dark tracking-tight">{totalEleitores}</h3>
            <p className="text-slate-500 font-bold mt-1 text-sm sm:text-base">Eleitores Ativos</p>
          </div>
        </div>

        {/* Card: Meta — editável pelo admin */}
        <MetaCard
          totalEleitores={totalEleitores}
          meta={meta}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
