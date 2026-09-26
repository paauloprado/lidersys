import 'server-only'
import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

export interface VotingLocation {
  id: string
  name: string
  neighborhood: string
  created_at: string
}

export interface Candidate {
  id: string
  name: string
  number: string
  role: string
  party: string | null
  created_at: string
}

/**
 * Cache dos bairros cadastrados no banco de dados.
 * Revalida a cada 1 hora ou quando a tag 'neighborhoods' for invalidada.
 */
export const getCachedNeighborhoods = unstable_cache(
  async (): Promise<string[]> => {
    const service = createServiceClient()
    const { data } = await service
      .from('neighborhoods')
      .select('name')
      .order('name', { ascending: true })

    return (data || []).map((b: { name: string }) => b.name)
  },
  ['neighborhoods-list-cache'],
  { revalidate: 3600, tags: ['neighborhoods'] }
)

/**
 * Cache dos locais de votação (unidades eleitorais).
 * Revalida a cada 120 segundos ou quando a tag 'voting_locations' for invalidada.
 */
export const getCachedVotingLocations = unstable_cache(
  async (): Promise<VotingLocation[]> => {
    const service = createServiceClient()
    const { data } = await service
      .from('voting_locations')
      .select('*')
      .order('name', { ascending: true })

    return (data || []) as VotingLocation[]
  },
  ['voting-locations-list-cache'],
  { revalidate: 120, tags: ['voting_locations'] }
)

/**
 * Cache da lista de candidatos cadastrados.
 * Revalida a cada 120 segundos ou quando a tag 'candidates' for invalidada.
 */
export const getCachedCandidates = unstable_cache(
  async (): Promise<Candidate[]> => {
    const service = createServiceClient()
    const { data } = await service
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })

    return (data || []) as Candidate[]
  },
  ['candidates-list-cache'],
  { revalidate: 120, tags: ['candidates'] }
)

/**
 * Cache do totalizador de eleitores e contagem de cabos eleitorais ativos.
 * - totalCabos: número de USUÁRIOS com role='lideranca' (cabos eleitorais cadastrados no sistema)
 * - totalEleitores: soma das fichas/lotes da voters_ledger
 * Revalida a cada 30 segundos ou quando as tags 'cabos', 'eleitores' ou 'profiles' forem invalidadas.
 */
export const getCachedDashboardMetrics = unstable_cache(
  async (): Promise<{ totalCabos: number; totalEleitores: number }> => {
    const service = createServiceClient()
    const [cabosRes, eleitoresRes] = await Promise.all([
      // Conta usuários com role 'lideranca' (cabos eleitorais ativos no sistema)
      service.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'lideranca'),
      // Soma quantitativo de fichas/lotes de eleitores
      service.from('voters_ledger').select('quantity'),
    ])

    const totalCabos = cabosRes.count ?? 0
    const totalEleitores = eleitoresRes.data?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0

    return { totalCabos, totalEleitores }
  },
  ['dashboard-metrics-summary-cache'],
  { revalidate: 30, tags: ['dashboard_metrics', 'cabos', 'eleitores', 'profiles'] }
)

/**
 * Busca a meta de eleitores configurada na tabela campaign_settings.
 * Retorna 5000 como fallback caso a tabela não exista ou esteja vazia.
 */
export const getCachedMetaEleitores = unstable_cache(
  async (): Promise<number> => {
    const service = createServiceClient()
    const { data } = await service
      .from('campaign_settings')
      .select('value')
      .eq('key', 'meta_eleitores')
      .maybeSingle()
    return data?.value ? parseInt(data.value, 10) || 5000 : 5000
  },
  ['campaign-meta-eleitores-cache'],
  { revalidate: 60, tags: ['campaign_settings'] }
)
