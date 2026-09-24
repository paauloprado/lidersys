import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import CandidatosClient from './CandidatosClient'

async function CandidatosData() {
  const supabase = await createClient()

  // 1. Verifica sessão via cookie (auth client)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  // 2. Busca perfil e dados simultaneamente com Promise.all
  const [profileRes, candidatesRes, cabosRes, locationsRes] = await Promise.all([
    service.from('profiles').select('role').eq('id', user.id).single(),
    service.from('candidates').select('*').order('created_at', { ascending: false }),
    service.from('cabos_ledger').select('quantity, candidate_id, neighborhood, voting_location'),
    service.from('voting_locations').select('*').order('name', { ascending: true }),
  ])

  const isAdmin = profileRes.data?.role === 'admin'

  return (
    <CandidatosClient
      initialCandidates={candidatesRes.data || []}
      cabosData={cabosRes.data || []}
      votingLocations={locationsRes.data || []}
      isAdmin={isAdmin}
    />
  )
}

function CandidatosSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200">
        <div>
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-10 w-36 bg-brand-primary/20 rounded-xl"></div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[400px]"></div>
    </div>
  )
}

export default function CandidatosPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Suspense fallback={<CandidatosSkeleton />}>
        <CandidatosData />
      </Suspense>
    </div>
  )
}
