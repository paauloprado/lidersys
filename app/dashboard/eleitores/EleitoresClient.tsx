'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEleitor, deleteEleitor, updateEleitor } from './actions'
import { Trash2, Users, FileText, MapPin, Building2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal'
import type { VoterRecord, VotingLocation } from '@/lib/types'

export default function EleitoresClient({ 
  initialVoters, 
  votingLocations = []
}: { 
  initialVoters: VoterRecord[], 
  votingLocations?: VotingLocation[],
  bairros?: string[]
}) {
  const router = useRouter()
  const BAIRROS = bairros || []
  const [selectedBairro, setSelectedBairro] = useState('')
  
  // Update selectedBairro when editing a voter
  const handleEditVoter = (voter: VoterRecord) => {
    setEditingVoter(voter)
    setModalType(voter.type)
    setSelectedBairro(voter.neighborhood || '')
    setIsModalOpen(true)
  }

  // Calculate Escolas
  const ESCOLAS_PARNAIBA = Array.from(new Set(
    votingLocations
      .filter(v => !selectedBairro || v.neighborhood === selectedBairro)
      .map(v => v.name)
  )).sort()

  const [voters, setVoters] = useState(initialVoters)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'lote' | 'individual'>('individual')
  const [editingVoter, setEditingVoter] = useState<VoterRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Confirmação de exclusão
  const [deletingVoter, setDeletingVoter] = useState<VoterRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Totais
  const totalEleitores = voters.reduce((acc, curr) => acc + (curr.quantity || 1), 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      formData.append('type', modalType)
      if (editingVoter) {
        formData.append('id', editingVoter.id)
      }
      
      const res = editingVoter ? await updateEleitor(formData) : await createEleitor(formData)
      
      if (res?.error) {
        toast.error('Erro ao salvar: ' + res.error)
      } else {
        toast.success(editingVoter ? 'Eleitor atualizado com sucesso!' : 'Cadastro salvo com sucesso!')
        setIsModalOpen(false)
        setEditingVoter(null)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao submeter eleitor:', err)
      toast.error('Erro de conexão ao salvar eleitor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function requestDelete(voter: VoterRecord, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingVoter(voter)
  }

  async function confirmDelete() {
    if (!deletingVoter) return
    setIsDeleting(true)
    try {
      const res = await deleteEleitor(deletingVoter.id)
      if (res?.error) {
        toast.error('Erro ao excluir: ' + res.error)
      } else {
        toast.success('Eleitor excluído com sucesso!')
        setVoters(prev => prev.filter(v => v.id !== deletingVoter.id))
        setDeletingVoter(null)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao excluir eleitor:', err)
      toast.error('Erro de conexão ao excluir o eleitor.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">Gestão de Eleitores</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
            Total acumulado: <strong className="text-brand-primary font-bold">{totalEleitores} votos/eleitores</strong> sob sua rede.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2.5">
          <button 
            type="button"
            onClick={() => { setEditingVoter(null); setModalType('lote'); setSelectedBairro(''); setIsModalOpen(true); }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-brand-dark px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Users className="w-4 h-4" />
            Adicionar Lote
          </button>
          <button 
            type="button"
            onClick={() => { setEditingVoter(null); setModalType('individual'); setSelectedBairro(''); setIsModalOpen(true); }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            Cadastrar Ficha
          </button>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-brand-dark text-base sm:text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-primary" /> 
            Registros Recentes
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            {voters.length} {voters.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        
        {voters.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-1">Nenhum registro encontrado</h3>
            <p className="text-slate-500 text-sm">Comece adicionando eleitores individualmente ou em lote.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="font-bold p-3.5 pl-6 border-b border-slate-100">Tipo</th>
                  <th className="font-bold p-3.5 border-b border-slate-100">Nome / Qtd</th>
                  <th className="font-bold p-3.5 border-b border-slate-100">Bairro</th>
                  <th className="font-bold p-3.5 border-b border-slate-100">Local de Votação</th>
                  <th className="font-bold p-3.5 border-b border-slate-100">Data</th>
                  <th className="font-bold p-3.5 pr-6 border-b border-slate-100 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {voters.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-3.5 pl-6">
                      {v.type === 'lote' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                          <Users className="w-3 h-3" /> Lote
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                          <FileText className="w-3 h-3" /> Ficha
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {v.type === 'lote' ? (
                        <div className="font-bold text-brand-dark text-sm">+{v.quantity} Votos Estimados</div>
                      ) : (
                        <div>
                          <div className="font-bold text-brand-dark text-sm">{v.name}</div>
                          {v.phone && <div className="text-xs text-slate-400 font-medium">{v.phone}</div>}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 text-sm font-medium">
                      {v.neighborhood ? (
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{v.neighborhood}</span></div>
                      ) : '-'}
                    </td>
                    <td className="p-3.5 text-slate-600 text-sm font-medium">
                      {v.voting_location ? (
                        <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate max-w-[200px]">{v.voting_location}</span></div>
                      ) : '-'}
                    </td>
                    <td className="p-3.5 text-slate-500 text-xs font-medium whitespace-nowrap">
                      {new Date(v.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3.5 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          type="button"
                          onClick={() => handleEditVoter(v)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar Registro"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => requestDelete(v, e)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
              <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                {modalType === 'lote' ? <Users className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-brand-dark tracking-tight">
                {editingVoter ? 'Editar Registro' : (modalType === 'lote' ? 'Registro Rápido em Lote' : 'Nova Ficha de Eleitor')}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {modalType === 'lote' ? (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Quantidade Estimada</label>
                    <input type="number" name="quantity" min="1" required defaultValue={editingVoter?.quantity || 10} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-base font-bold" />
                    {!editingVoter && <p className="text-xs text-slate-500 mt-1.5">Use esta opção para contabilizar uma base prometida sem a necessidade de preencher dados individuais.</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Bairro / Região Predominante (Opcional)</label>
                    <select 
                      name="neighborhood" 
                      value={selectedBairro}
                      onChange={(e) => setSelectedBairro(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm"
                    >
                      <option value="">Selecione um bairro...</option>
                      {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Local de Votação Predominante (Escola)</label>
                    <select name="voting_location" defaultValue={editingVoter?.voting_location || ''} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm">
                      <option value="">Selecione a escola...</option>
                      {ESCOLAS_PARNAIBA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Nome Completo</label>
                    <input name="name" required defaultValue={editingVoter?.name || ''} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm" placeholder="Nome do eleitor" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Telefone / WhatsApp</label>
                      <input name="phone" defaultValue={editingVoter?.phone || ''} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Bairro</label>
                      <select 
                        name="neighborhood" 
                        required 
                        value={selectedBairro}
                        onChange={(e) => setSelectedBairro(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm"
                      >
                        <option value="">Selecione...</option>
                        {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Local de Votação (Escola/Unidade)</label>
                    <select name="voting_location" defaultValue={editingVoter?.voting_location || ''} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm">
                      <option value="">Selecione a escola...</option>
                      {ESCOLAS_PARNAIBA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingVoter(null); }}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/20 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingVoter)}
        title="Excluir Eleitor"
        description="Tem certeza que deseja excluir este registro de eleitor? Os votos correspondentes serão deduzidos da sua base."
        itemName={deletingVoter ? (deletingVoter.type === 'lote' ? `Lote de +${deletingVoter.quantity} votos` : deletingVoter.name) : null}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingVoter(null)}
      />
    </div>
  )
}
