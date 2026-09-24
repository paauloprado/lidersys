'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCandidate, deleteCandidate, updateCandidate } from './actions'
import { Plus, Trash2, User, Hash, Pencil, ChevronDown, ChevronUp, MapPin, Building2, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal'
import type { Candidate, CaboRecord, VotingLocation } from '@/lib/types'

export default function CandidatosClient({ 
  initialCandidates, 
  cabosData = [],
  isAdmin = false
}: { 
  initialCandidates: Candidate[], 
  cabosData?: Pick<CaboRecord, 'quantity' | 'candidate_id' | 'neighborhood' | 'voting_location'>[],
  votingLocations?: VotingLocation[],
  isAdmin?: boolean
}) {
  const router = useRouter()
  const [candidates, setCandidates] = useState(initialCandidates)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)

  // Confirmação de exclusão
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Helpers para cálculo de votos
  const getTotalVotes = (candidateId: string) => {
    return cabosData.filter(c => c.candidate_id === candidateId).reduce((acc, curr) => acc + (curr.quantity || 1), 0)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      
      let res;
      if (editingCandidate) {
        formData.append('id', editingCandidate.id);
        res = await updateCandidate(formData);
      } else {
        res = await createCandidate(formData);
      }
      
      if (res?.error) {
        toast.error('Erro ao salvar candidato: ' + res.error)
      } else {
        toast.success(editingCandidate ? 'Candidato atualizado com sucesso!' : 'Candidato cadastrado com sucesso!')
        setIsModalOpen(false)
        setEditingCandidate(null)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao salvar candidato:', err)
      toast.error('Erro de conexão ao salvar candidato.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function requestDelete(candidate: Candidate, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingCandidate(candidate)
  }

  async function confirmDelete() {
    if (!deletingCandidate) return
    setIsDeleting(true)
    try {
      const res = await deleteCandidate(deletingCandidate.id)
      if (res?.error) {
        toast.error('Erro ao excluir: ' + res.error)
      } else {
        toast.success('Candidato excluído com sucesso!')
        setCandidates(prev => prev.filter(c => c.id !== deletingCandidate.id))
        setDeletingCandidate(null)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao excluir candidato:', err)
      toast.error('Erro de conexão ao excluir o candidato.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">Candidatos Apoiados</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
            Gerencie os candidatos da sua campanha e analise a distribuição de votos.
          </p>
        </div>
        {isAdmin && (
          <button 
            type="button"
            onClick={() => { setEditingCandidate(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Novo Candidato
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {candidates.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-1">Nenhum candidato cadastrado</h3>
            <p className="text-slate-500 text-sm">Cadastre os candidatos apoiados para rastrear seus votos por região.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {candidates.map((c) => {
              const isExpanded = expandedCandidate === c.id
              const totalVotosGeral = getTotalVotes(c.id)

              // Agrupamento de votos por Bairro
              const votosPorBairro: Record<string, { total: number, escolas: Record<string, number> }> = {}
              cabosData.filter(cb => cb.candidate_id === c.id).forEach(cb => {
                const b = cb.neighborhood || 'Não informado'
                const esc = cb.voting_location || 'Não informado'
                if (!votosPorBairro[b]) {
                  votosPorBairro[b] = { total: 0, escolas: {} }
                }
                const qtd = cb.quantity || 1
                votosPorBairro[b].total += qtd
                votosPorBairro[b].escolas[esc] = (votosPorBairro[b].escolas[esc] || 0) + qtd
              })

              return (
                <div key={c.id} className="transition-colors hover:bg-slate-50/50">
                  <div 
                    className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    onClick={() => setExpandedCandidate(isExpanded ? null : c.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-lg shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-brand-dark">{c.name}</h2>
                          {c.party && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">
                              {c.party}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1 font-mono font-bold text-brand-primary">
                            <Hash className="w-3.5 h-3.5" />
                            {c.number}
                          </span>
                          <span>&bull;</span>
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
                              type="button"
                              onClick={() => { setEditingCandidate(c); setIsModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar Candidato"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => requestDelete(c, e)}
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

                      {Object.keys(votosPorBairro).length === 0 ? (
                        <div className="text-sm text-slate-400 py-4 text-center">
                          Nenhum voto computado para este candidato nos lotes ou fichas ainda.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(votosPorBairro).map(([bairro, dados]) => (
                            <div key={bairro} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                <span className="font-bold text-brand-dark flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  {bairro}
                                </span>
                                <span className="font-black text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-lg text-sm">
                                  {dados.total} votos
                                </span>
                              </div>
                              <div className="space-y-2">
                                {Object.entries(dados.escolas).map(([esc, count]) => (
                                  <div key={esc} className="flex justify-between items-center text-xs">
                                    <span className="text-slate-600 flex items-center gap-1">
                                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                      {esc}
                                    </span>
                                    <span className="font-bold text-slate-700">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingCandidate)}
        title="Excluir Candidato"
        description="Tem certeza que deseja excluir este candidato? As vinculações a lotes e fichas serão removidas."
        itemName={deletingCandidate ? `${deletingCandidate.name} (${deletingCandidate.number})` : null}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingCandidate(null)}
      />
    </div>
  )
}
