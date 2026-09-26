import { createServiceClient } from '@/lib/supabase/service'
import { getSessionUser, getSessionProfile } from '@/lib/supabase/authCache'
import { getCachedCandidates, getCachedVotingLocations } from '@/lib/supabase/cachedQueries'
import { redirect } from 'next/navigation'
import CandidatosClient from './CandidatosClient'

export default async function CandidatosPage() {
  // 1. Obtém sessão e perfil em memória via React.cache()
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getSessionProfile(user.id)
  const isAdmin = profile?.role === 'admin'

  const service = createServiceClient()

  // 2. Busca dados de cabos e consome candidatos e locais diretamente do cache
  const [candidates, locations, cabosRes] = await Promise.all([
    getCachedCandidates(),
    getCachedVotingLocations(),
    service.from('cabos_ledger').select('quantity, candidate_id, neighborhood, voting_location'),
  ])

  return (
    <div className="w-full max-w-7xl mx-auto">
      <CandidatosClient
        initialCandidates={candidates}
        cabosData={cabosRes.data || []}
        votingLocations={locations}
        isAdmin={isAdmin}
      />
    </div>
  )
}
