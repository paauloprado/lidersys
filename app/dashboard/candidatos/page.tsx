import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import CandidatosClient from './CandidatosClient'

async function CandidatosData() {
  const supabase = await createClient()

  // 1. Verifica sessão via cookie (auth client)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Usa service client para leituras
  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // 3. Busca os candidatos
  const { data: candidates } = await service
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })

  // 4. Busca todos os registros de cabos para calcular votos e agrupamentos
  const { data: cabos } = await service
    .from('cabos_ledger')
    .select('quantity, candidate_id, neighborhood, voting_location')

  // 5. Busca as unidades eleitorais mapeadas
  const { data: voting_locations } = await service
    .from('voting_locations')
    .select('*')
    .order('name', { ascending: true })

  return (
    <CandidatosClient 
      initialCandidates={candidates || []}
      cabosData={cabos || []}
      votingLocations={voting_locations || []}
      isAdmin={isAdmin}
    />
  )
}

function CandidatosSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-10 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-5 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-12 w-40 bg-brand-primary/20 rounded-xl"></div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
      </div>
    </div>
  )
}

export default function CandidatosPage() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <Suspense fallback={<CandidatosSkeleton />}>
        <CandidatosData />
      </Suspense>
    </div>
  )
}
