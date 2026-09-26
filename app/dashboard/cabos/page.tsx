import { createServiceClient } from '@/lib/supabase/service'
import { getSessionUser, getSessionProfile } from '@/lib/supabase/authCache'
import { getCachedVotingLocations, getCachedNeighborhoods } from '@/lib/supabase/cachedQueries'
import { redirect } from 'next/navigation'
import CabosClient from './CabosClient'

const BAIRROS_PARNAIBA = [
  'Alto Santa Maria', 'Area Rural de Parnaiba', 'Bebedouro', 'Boa Esperanca', 'Campos', 
  'Cantagalo', 'Catanduvas', 'Ceara', 'Centro', 'Conselheiro Alberto Silva', 
  'Dirceu Arcoverde', 'Floriopolis', 'Frei Higino', 'Igaracu', 'João XXIII', 
  'Mendonca Clark', 'Nossa Senhora de Fatima', 'Nossa Senhora do Carmo', 'Nova Parnaíba', 
  'Piauí', 'Pindorama', 'Planalto', 'Planalto de Monteserra The', 'Primavera', 
  'Reis Veloso', 'Rodoviária', 'Sabiazal', 'Santa Isabel', 'Santa Luzia', 
  'São Benedito', 'São Francisco da Guarita', 'Sao Jose', 'São Judas Tadeu', 
  'Sao Pedro', 'Sao Vicente de Paula'
]

export default async function CabosPage() {
  // 1. Obtém sessão e perfil (deduplicados em memória via React.cache())
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getSessionProfile(user.id)
  const isAdmin = profile?.role === 'admin'

  const service = createServiceClient()

  // 2. Query de cabos filtrada por admin ou dono
  const cabosQuery = service
    .from('cabos_ledger')
    .select('*, candidates(name)')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    cabosQuery.eq('user_id', user.id)
  }

  // 3. Executa queries dinâmicas e consome caches estáticos em paralelo
  const [cabosRes, profilesRes, locations, bairrosDb] = await Promise.all([
    cabosQuery,
    service
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'lideranca')
      .order('full_name', { ascending: true }),
    getCachedVotingLocations(),
    getCachedNeighborhoods(),
  ])

  if (cabosRes.error) {
    console.error('Erro ao buscar cabos_ledger:', cabosRes.error)
  }

  const combinedBairros = Array.from(new Set([...BAIRROS_PARNAIBA, ...bairrosDb])).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  )

  return (
    <div className="w-full max-w-7xl mx-auto">
      <CabosClient
        initialCabos={cabosRes.data || []}
        cabosProfiles={profilesRes.data || []}
        votingLocations={locations}
        currentUserId={user.id}
        bairros={combinedBairros}
      />
    </div>
  )
}
