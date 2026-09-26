import { createServiceClient } from '@/lib/supabase/service'
import { getSessionUser } from '@/lib/supabase/authCache'
import { getCachedVotingLocations, getCachedNeighborhoods } from '@/lib/supabase/cachedQueries'
import { redirect } from 'next/navigation'
import EleitoresClient from './EleitoresClient'

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

export default async function EleitoresPage() {
  // 1. Sessão rápida deduplicada via React.cache()
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  // 2. Busca lista de eleitores e recupera bairros e locais do cache em paralelo
  const [votersRes, locations, bairrosDb] = await Promise.all([
    service.from('voters_ledger').select('*').order('created_at', { ascending: false }),
    getCachedVotingLocations(),
    getCachedNeighborhoods(),
  ])

  const combinedBairros = Array.from(new Set([...BAIRROS_PARNAIBA, ...bairrosDb])).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  )

  return (
    <div className="w-full max-w-7xl mx-auto">
      <EleitoresClient
        initialVoters={votersRes.data || []}
        votingLocations={locations}
        bairros={combinedBairros}
      />
    </div>
  )
}
