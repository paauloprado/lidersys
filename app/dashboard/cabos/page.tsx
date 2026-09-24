import { Suspense } from 'react'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CabosClient from './CabosClient'

async function CabosData() {
  const supabase = await createClient()

  // 1. Verifica sessão
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Usa service client para leituras (garante que RLS não bloqueia Server Components)
  const service = createServiceClient()

  // 3. Busca perfil para saber se é admin
  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = profile?.role === 'admin'

  // 4. Busca registros: admin vê tudo, outros veem apenas os seus
  const cabosQuery = service
    .from('cabos_ledger')
    .select('*, candidates(name)')
    .order('created_at', { ascending: false })
  
  if (!isAdmin) {
    cabosQuery.eq('user_id', user.id)
  }

  const { data: cabos, error: cabosError } = await cabosQuery
  if (cabosError) {
    console.error('Erro ao buscar cabos_ledger:', cabosError)
  }

  // 5. Busca Cabos Eleitorais (role = lideranca) para o select e agrupamento
  const { data: cabosProfiles } = await service
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'lideranca')
    .order('full_name', { ascending: true })

  // 6. Busca unidades eleitorais para os selects
  const { data: voting_locations } = await service
    .from('voting_locations')
    .select('*')
    .order('name', { ascending: true })

  return (
    <CabosClient 
      initialCabos={cabos || []} 
      cabosProfiles={cabosProfiles || []}
      votingLocations={voting_locations || []}
      currentUserId={user.id}
    />
  )
}

function CabosSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-10 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-5 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-40 bg-slate-200 rounded-xl"></div>
          <div className="h-12 w-40 bg-brand-primary/20 rounded-xl"></div>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
        <div className="h-16 bg-slate-50 border-b border-slate-100"></div>
        <div className="p-6 space-y-4">
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

export default function CabosPage() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <Suspense fallback={<CabosSkeleton />}>
        <CabosData />
      </Suspense>
    </div>
  )
}
