import { Suspense } from 'react'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CabosClient from './CabosClient'

async function CabosData() {
  const supabase = await createClient()

  // 1. Verifica sessão
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  // 2. Busca perfil primeiro para saber se é admin
  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = profile?.role === 'admin'

  // 3. Executa queries de dados em paralelo para carregamento ultra-rápido
  const cabosQuery = service
    .from('cabos_ledger')
    .select('*, candidates(name)')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    cabosQuery.eq('user_id', user.id)
  }

  const [cabosRes, profilesRes, locationsRes] = await Promise.all([
    cabosQuery,
    service
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'lideranca')
      .order('full_name', { ascending: true }),
    service
      .from('voting_locations')
      .select('*')
      .order('name', { ascending: true }),
  ])

  if (cabosRes.error) {
    console.error('Erro ao buscar cabos_ledger:', cabosRes.error)
  }

  return (
    <CabosClient
      initialCabos={cabosRes.data || []}
      cabosProfiles={profilesRes.data || []}
      votingLocations={locationsRes.data || []}
      currentUserId={user.id}
    />
  )
}

function CabosSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200">
        <div>
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-36 bg-brand-primary/20 rounded-xl"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 h-28"></div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 h-28"></div>
      </div>
    </div>
  )
}

export default function CabosPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Suspense fallback={<CabosSkeleton />}>
        <CabosData />
      </Suspense>
    </div>
  )
}
