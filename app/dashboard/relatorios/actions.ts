import 'server-only'

import { createServiceClient } from '@/lib/supabase/service'

export interface VotosBairro {
  bairro: string
  total: number
}

export interface VotosEscola {
  escola: string
  bairro: string
  total: number
}

export interface VotosCabo {
  cabo_id: string
  cabo_nome: string
  total_eleitores: number
  total_cabos: number
  total: number
}

export interface RelatoriosData {
  votosBairro: VotosBairro[]
  votosEscola: VotosEscola[]
  votosCabo: VotosCabo[]
  grandTotal: number
}

export async function getRelatoriosData(): Promise<RelatoriosData> {
  const service = createServiceClient()

  const [votesRes, cabosRes, profilesRes] = await Promise.all([
    service.from('voters_ledger').select('neighborhood, voting_location, quantity'),
    service.from('cabos_ledger').select('user_id, neighborhood, voting_location, quantity'),
    service.from('profiles').select('id, full_name').eq('role', 'lideranca'),
  ])

  const votes = votesRes.data || []
  const caboLedger = cabosRes.data || []
  const profiles = profilesRes.data || []

  // --- Votos por Bairro ---
  const bairroMap: Record<string, number> = {}
  for (const v of votes) {
    const b = v.neighborhood || 'Não informado'
    bairroMap[b] = (bairroMap[b] || 0) + (v.quantity || 1)
  }
  for (const v of caboLedger) {
    const b = v.neighborhood || 'Não informado'
    bairroMap[b] = (bairroMap[b] || 0) + (v.quantity || 1)
  }
  const votosBairro: VotosBairro[] = Object.entries(bairroMap)
    .map(([bairro, total]) => ({ bairro, total }))
    .sort((a, b) => b.total - a.total)

  // --- Votos por Escola ---
  const escolaMap: Record<string, { bairro: string; total: number }> = {}
  for (const v of votes) {
    const e = v.voting_location || 'Não informado'
    if (!escolaMap[e]) escolaMap[e] = { bairro: v.neighborhood || 'Não informado', total: 0 }
    escolaMap[e].total += v.quantity || 1
  }
  for (const v of caboLedger) {
    const e = v.voting_location || 'Não informado'
    if (!escolaMap[e]) escolaMap[e] = { bairro: v.neighborhood || 'Não informado', total: 0 }
    escolaMap[e].total += v.quantity || 1
  }
  const votosEscola: VotosEscola[] = Object.entries(escolaMap)
    .map(([escola, { bairro, total }]) => ({ escola, bairro, total }))
    .sort((a, b) => b.total - a.total)

  // --- Votos por Cabo Eleitoral (agrupa registros do cabos_ledger por user_id) ---
  const caboMap: Record<string, { total_eleitores: number; total_cabos: number }> = {}
  for (const v of caboLedger) {
    const id = v.user_id || 'sem_cabo'
    if (!caboMap[id]) caboMap[id] = { total_eleitores: 0, total_cabos: 0 }
    caboMap[id].total_cabos += v.quantity || 1
  }

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]))
  const votosCabo: VotosCabo[] = Object.entries(caboMap)
    .map(([cabo_id, { total_eleitores, total_cabos }]) => ({
      cabo_id,
      cabo_nome: profileMap[cabo_id] || 'Sem Cabo Vinculado',
      total_eleitores,
      total_cabos,
      total: total_eleitores + total_cabos,
    }))
    .sort((a, b) => b.total - a.total)

  const grandTotal =
    votes.reduce((acc, v) => acc + (v.quantity || 1), 0) +
    caboLedger.reduce((acc, v) => acc + (v.quantity || 1), 0)

  return { votosBairro, votosEscola, votosCabo, grandTotal }
}
