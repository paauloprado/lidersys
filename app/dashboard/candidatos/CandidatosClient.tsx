'use client'

import { useState } from 'react'
import { createCandidate, deleteCandidate, updateCandidate } from './actions'
import { Plus, Trash2, User, Hash, Pencil, ChevronDown, ChevronUp, MapPin, Building2, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CandidateRecord, CaboRecord, VotingLocation } from '@/lib/types'

export default function CandidatosClient({ 
  initialCandidates, 
  cabosData,
  isAdmin,
  votingLocations = []
}: { 
  initialCandidates: CandidateRecord[], 
  cabosData: Pick<CaboRecord, 'candidate_id' | 'quantity' | 'neighborhood' | 'voting_location'>[],
  isAdmin: boolean,
  votingLocations?: VotingLocation[]
}) {
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
  const ESCOLAS_POR_BAIRRO: Record<string, string[]> = {}
  BAIRROS_PARNAIBA.forEach(b => ESCOLAS_POR_BAIRRO[b] = [])
  votingLocations.forEach(vl => {
    if (ESCOLAS_POR_BAIRRO[vl.neighborhood]) {
      ESCOLAS_POR_BAIRRO[vl.neighborhood].push(vl.name)
    }
  })
  
  Object.keys(ESCOLAS_POR_BAIRRO).forEach(b => {
    ESCOLAS_POR_BAIRRO[b].sort()
  })
  const [candidates, setCandidates] = useState(initialCandidates)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<CandidateRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados de Expansão (Accordion)
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null)
  const [expandedBairro, setExpandedBairro] = useState<string | null>(null)

  // Helpers para cálculo de votos
  const getTotalVotes = (candidateId: string) => {
    return cabosData.filter(c => c.candidate_id === candidateId).reduce((acc, curr) => acc + (curr.quantity || 1), 0)
  }

  const getVotesByBairro = (candidateId: string, bairro: string) => {
    return cabosData.filter(c => c.candidate_id === candidateId && c.neighborhood === bairro).reduce((acc, curr) => acc + (curr.quantity || 1), 0)
  }

  const getVotesByEscola = (candidateId: string, bairro: string, escola: string) => {
    return cabosData.filter(c => c.candidate_id === candidateId && c.neighborhood === bairro && c.voting_location === escola).reduce((acc, curr) => acc + (curr.quantity || 1), 0)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    let res;
    if (editingCandidate) {
      formData.append('id', editingCandidate.id);
      res = await updateCandidate(formData);
    } else {
      res = await createCandidate(formData);
    }
    
    setIsSubmitting(false)
    
    if (res.error) {
      toast.error('Erro ao salvar candidato: ' + res.error)
    } else {
      toast.success('Candidato salvo com sucesso!')
      setIsModalOpen(false)
      window.location.reload()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este candidato?')) return
    
    const res = await deleteCandidate(id)
    if (res.error) {
      toast.error('Erro ao excluir: ' + res.error)
    } else {
      toast.success('Candidato excluído com sucesso!')
      setCandidates(candidates.filter(c => c.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Candidatos Apoiados</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie os candidatos da sua campanha e analise a distribuição de votos.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingCandidate(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Novo Candidato
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {candidates.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Nenhum candidato cadastrado</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              Adicione candidatos para vinculá-los às lideranças e acompanhar os votos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {candidates.map((c) => {
              const totalVotosGeral = getTotalVotes(c.id)
              const isExpanded = expandedCandidateId === c.id

              return (
                <div key={c.id} className="group">
                  {/* Linha do Candidato */}
                  <div 
                    onClick={() => {
                      setExpandedCandidateId(isExpanded ? null : c.id)
                      setExpandedBairro(null) // Reseta o bairro ao trocar de candidato
                    }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-brand-dark">{c.name}</h3>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">{c.party || '-'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium mt-1">
                          <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> {c.number}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{c.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 w-full sm:w-auto">
                      <div className="text-right">
                        <div className="text-2xl font-black text-brand-primary">{totalVotosGeral}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Votos Totais</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <div className="flex items-center gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => { setEditingCandidate(c); setIsModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar Candidato"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(c.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir Candidato"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="text-slate-400 p-2">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalhamento do Candidato */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-100 p-6 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2 mb-4 text-brand-dark font-bold text-lg">
                        <BarChart2 className="w-5 h-5 text-brand-primary" />
                        Desempenho por Bairro
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-slate-100">
                          {BAIRROS_PARNAIBA.map(bairro => {
                            const votosBairro = getVotesByBairro(c.id, bairro)
                            const isBairroExpanded = expandedBairro === bairro

                            return (
                              <div key={bairro}>
                                {/* Cabeçalho do Bairro */}
                                <div 
                                  onClick={() => setExpandedBairro(isBairroExpanded ? null : bairro)}
                                  className={`flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isBairroExpanded ? 'bg-slate-50' : ''}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <MapPin className={`w-5 h-5 ${votosBairro > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                                    <span className="font-bold text-brand-dark">{bairro}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className={`font-black ${votosBairro > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                      {votosBairro} votos
                                    </span>
                                    <div className="text-slate-400">
                                      {isBairroExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                  </div>
                                </div>

                                {/* Lista de Escolas (Unidades) dentro do Bairro */}
                                {isBairroExpanded && (
                                  <div className="bg-slate-50/50 p-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-top-1 duration-200">
                                    {(ESCOLAS_POR_BAIRRO[bairro] || []).length === 0 ? (
                                      <div className="col-span-1 md:col-span-2 p-3 text-center text-sm font-bold text-slate-400">
                                        Nenhuma escola mapeada neste bairro.
                                      </div>
                                    ) : (
                                      (ESCOLAS_POR_BAIRRO[bairro] || []).map(escola => {
                                        const votosEscola = getVotesByEscola(c.id, bairro, escola)
                                        return (
                                        <div key={escola} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                          <div className="flex items-start gap-2 max-w-[70%]">
                                            <Building2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${votosEscola > 0 ? 'text-brand-primary' : 'text-slate-300'}`} />
                                            <span className="text-xs font-bold text-slate-600 line-clamp-2" title={escola}>{escola}</span>
                                          </div>
                                          <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${votosEscola > 0 ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 text-slate-400'}`}>
                                            {votosEscola} {votosEscola === 1 ? 'voto' : 'votos'}
                                          </div>
                                        </div>
                                      )
                                    }))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">
                {editingCandidate ? 'Editar Candidato' : 'Novo Candidato'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1.5">Nome de Urna</label>
                <input name="name" required defaultValue={editingCandidate?.name} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" placeholder="Ex: Dr. João" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brand-dark mb-1.5">Número</label>
                  <input name="number" required defaultValue={editingCandidate?.number} type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" placeholder="Ex: 12345" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-dark mb-1.5">Partido (Sigla)</label>
                  <input name="party" required defaultValue={editingCandidate?.party ?? ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" placeholder="Ex: MDB" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1.5">Cargo</label>
                <select name="role" required defaultValue={editingCandidate?.role || 'Vereador'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark">
                  <option value="Vereador">Vereador</option>
                  <option value="Prefeito">Prefeito</option>
                  <option value="Deputado Estadual">Deputado Estadual</option>
                  <option value="Deputado Federal">Deputado Federal</option>
                  <option value="Senador">Senador</option>
                  <option value="Presidente">Presidente</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
