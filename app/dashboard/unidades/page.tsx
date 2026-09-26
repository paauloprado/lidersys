import { getSessionUser, getSessionProfile } from '@/lib/supabase/authCache'
import { getCachedVotingLocations, getCachedNeighborhoods } from '@/lib/supabase/cachedQueries'
import { redirect } from 'next/navigation'
import UnidadesClient from './UnidadesClient'

const BAIRROS_PARNAIBA = [
  'Alto Santa Maria', 'Bebedouro', 'Boa Esperanca', 'Broderville', 'Campestre', 
  'Canta Galo', 'Carmo', 'Catanduvas', 'Ceara', 'Centro', 'Conselheiro Alberto Silva', 
  'Dirceu Arcoverde', 'Do Carmo', 'Dom Rufino', 'Do Planalto', 'Floriopolis', 'Frei Higino', 
  'Guarita', 'Igaraçu', 'Ilha Grande De Santa Isabel', 'Joao Xxiii', 'Nossa Senhora de Fatima', 
  'Nossa Senhora do Carmo', 'Nova Parnaiba', 'Piauí', 'Planalto de Monteserra The', 'Primavera', 
  'Rodoviaria', 'Rosapolis', 'Santa Luzia', 'São Benedito', 'São Francisco da Guarita', 
  'Sao Jose', 'São Judas Tadeu', 'Sao Pedro', 'Sao Vicente de Paula'
]

export default async function UnidadesPage() {
  // 1. Obtém sessão e perfil em memória via React.cache()
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getSessionProfile(user.id)
  const isAdmin = profile?.role === 'admin'

  // 2. Busca unidades e bairros diretamente do cache de alta velocidade
  const [unidades, bairrosDb] = await Promise.all([
    getCachedVotingLocations(),
    getCachedNeighborhoods(),
  ])

  const combinedBairros = Array.from(new Set([...BAIRROS_PARNAIBA, ...bairrosDb])).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  )

  return (
    <div className="w-full max-w-7xl mx-auto">
      <UnidadesClient 
        initialUnidades={unidades}
        bairros={combinedBairros}
        isAdmin={isAdmin}
      />
    </div>
  )
}
