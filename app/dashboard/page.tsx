import { Users, Target, TrendingUp, Calendar, UserCheck } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'

export default async function DashboardPage() {
  const supabase = createServiceClient()

  // Buscar totais de Cabos
  const { data: cabos } = await supabase.from('cabos_ledger').select('quantity')
  const totalCabos = cabos?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0

  // Buscar totais de Eleitores
  const { data: eleitores } = await supabase.from('voters_ledger').select('quantity')
  const totalEleitores = eleitores?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0

  // Buscar Candidatos (não vamos mostrar o número aqui em destaque, mas se precisar temos a query)
  // const { count: totalCandidatos } = await supabase.from('candidates').select('*', { count: 'exact', head: true })

  const currentDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Decoração de Fundo */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-brand-primary/20 to-brand-dark/5 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-brand-primary font-semibold mb-3 text-sm tracking-wide uppercase">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tight">Visão Geral da Campanha</h2>
          <p className="text-slate-500 text-lg font-medium max-w-2xl">Aqui está o resumo do seu progresso até agora. Acompanhe a evolução da sua base de eleitores e lideranças.</p>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: Cabos Eleitorais */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all">
              <UserCheck className="w-7 h-7" />
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              Ativo
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-5xl font-black text-brand-dark tracking-tight">{totalCabos}</h3>
            <p className="text-slate-500 font-semibold mt-2 text-lg">Cabos Eleitorais Ativos</p>
          </div>
        </div>

        {/* Card: Eleitores */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all">
              <Users className="w-7 h-7" />
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              Ativo
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-5xl font-black text-brand-dark tracking-tight">{totalEleitores}</h3>
            <p className="text-slate-500 font-semibold mt-2 text-lg">Eleitores na Base</p>
          </div>
        </div>

        {/* Card: Meta */}
        <div className="bg-gradient-to-br from-brand-primary to-brand-dark p-8 rounded-3xl shadow-lg text-white relative overflow-hidden group">
          {/* Decorações do card escuro */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-110"></div>
          
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/10">
              <Target className="w-7 h-7" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-end gap-2 mb-4">
              <h3 className="text-5xl font-black tracking-tight">{Math.min(100, Math.round((totalEleitores / 5000) * 100))}%</h3>
              <p className="text-blue-100 font-medium pb-1.5 text-lg">da meta</p>
            </div>
            
            <div className="w-full bg-black/30 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-blue-300 to-white h-full rounded-full relative" style={{ width: `${Math.min(100, Math.round((totalEleitores / 5000) * 100))}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 text-sm text-blue-100 font-medium">
              <span>Atual: {totalEleitores}</span>
              <span>Alvo: 5.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
