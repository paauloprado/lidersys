'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCabo, deleteCabo, updateCabo } from './actions'
import { Plus, Trash2, Users, FileText, MapPin, Building2, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal'
import bairroEscolasMapRaw from '../../../bairro_escolas_map.json'
import type { CaboRecord, VotingLocation, UserProfile } from '@/lib/types'

const bairroEscolasMap: Record<string, string[]> = bairroEscolasMapRaw as Record<string, string[]>

export default function CabosClient({ 
  initialCabos, 
  cabosProfiles = [],
  currentUserId,
  votingLocations = []
}: { 
  initialCabos: CaboRecord[], 
  cabosProfiles?: Pick<UserProfile, 'id' | 'full_name' | 'role'>[],
  currentUserId: string,
  votingLocations?: VotingLocation[]
}) {
  const router = useRouter()
  const BAIRROS_PARNAIBA = Object.keys(bairroEscolasMap).sort()
  const ESCOLAS_PARNAIBA = Array.from(new Set(votingLocations.map(v => v.name))).sort()
  
  const [cabos, setCabos] = useState(initialCabos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'lote' | 'individual'>('individual')
  const [editingCabo, setEditingCabo] = useState<CaboRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)
  
  // Confirmação de exclusão
  const [deletingRecord, setDeletingRecord] = useState<CaboRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Para individual
  const [selectedBairro, setSelectedBairro] = useState('')
  
  // Para lote
  const [loteRows, setLoteRows] = useState([{ id: Date.now(), neighborhood: '', voting_location: '', quantity: 10 }])

  const handleAddLoteRow = () => {
    setLoteRows([...loteRows, { id: Date.now(), neighborhood: '', voting_location: '', quantity: 10 }])
  }
  
  const handleRemoveLoteRow = (id: number) => {
    setLoteRows(loteRows.filter(r => r.id !== id))
  }
  
  const updateLoteRow = (id: number, field: 'neighborhood' | 'voting_location' | 'quantity', value: string | number) => {
    setLoteRows(loteRows.map(r => r.id === id ? { ...r, [field]: value } : r))
  }
  
  // Totais
  const totalCabos = cabos.reduce((acc, curr) => acc + (curr.quantity || 1), 0)

  // Agrupar fichas/lotes por Cabo Eleitoral (user_id)
  const cabosPorPerfil: Record<string, typeof cabos> = {}
  cabosPorPerfil['Sem Cabo Vinculado'] = []
  
  cabosProfiles.forEach(p => {
    cabosPorPerfil[p.id] = []
  })

  cabos.forEach(cabo => {
    if (cabo.user_id && cabosPorPerfil[cabo.user_id]) {
      cabosPorPerfil[cabo.user_id].push(cabo)
    } else {
      cabosPorPerfil['Sem Cabo Vinculado'].push(cabo)
    }
  })

  const getProfileTotal = (cList: CaboRecord[]) => {
    return cList.reduce((acc, curr) => acc + (curr.quantity || 1), 0)
  }

  // Lista de seções a exibir (todos os cabos perfil com fichas ou todos os cabos)
  const sections = cabosProfiles.map(p => ({
    id: p.id,
    name: p.full_name,
    role: 'Cabo Eleitoral',
    list: cabosPorPerfil[p.id] || []
  }))
  if (cabosPorPerfil['Sem Cabo Vinculado'].length > 0) {
    sections.push({
      id: 'Sem Cabo Vinculado',
      name: 'Sem Cabo Vinculado / Você',
      role: '-',
      list: cabosPorPerfil['Sem Cabo Vinculado']
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      formData.append('type', modalType)
      if (editingCabo) {
        formData.append('id', editingCabo.id)
      }
      if (modalType === 'lote' && !editingCabo) {
        formData.append('lote_data', JSON.stringify(loteRows))
      }
      
      const res = editingCabo ? await updateCabo(formData) : await createCabo(formData)
      
      if (res?.error) {
        toast.error('Erro ao salvar: ' + res.error)
      } else {
        toast.success(editingCabo ? 'Registro atualizado com sucesso!' : 'Cadastro salvo com sucesso!')
        setIsModalOpen(false)
        setEditingCabo(null)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao submeter cabo:', err)
      toast.error('Erro de conexão ao salvar registro.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function requestDelete(cabo: CaboRecord, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingRecord(cabo)
  }

  async function confirmDelete() {
    if (!deletingRecord) return
    setIsDeleting(true)
    try {
      const res = await deleteCabo(deletingRecord.id)
      if (res?.error) {
        toast.error('Erro ao excluir: ' + res.error)
      } else {
        toast.success('Registro excluído com sucesso!')
        setCabos(prev => prev.filter(v => v.id !== deletingRecord.id))
        setDeletingRecord(null)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao excluir cabo:', err)
      toast.error('Erro de conexão ao excluir o registro.')
    } finally {
      setIsDeleting(false)
    }
  }

  function openCreateModal(type: 'lote' | 'individual') {
    setEditingCabo(null)
    setModalType(type)
    setSelectedBairro('')
    setLoteRows([{ id: Date.now(), neighborhood: '', voting_location: '', quantity: 10 }])
    setIsModalOpen(true)
  }

  function openEditModal(cabo: CaboRecord, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    setEditingCabo(cabo)
    setModalType(cabo.type)
    setSelectedBairro(cabo.neighborhood || '')
    if (cabo.type === 'lote') {
      setLoteRows([{ id: Date.now(), neighborhood: cabo.neighborhood || '', voting_location: cabo.voting_location || '', quantity: cabo.quantity || 1 }])
    }
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">Gestão de Cabos Eleitorais</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
            Total acumulado: <strong className="text-brand-primary font-bold">{totalCabos} votos/cabos</strong> sob sua rede.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2.5">
          <button 
            type="button"
            onClick={() => openCreateModal('lote')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-brand-dark px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Users className="w-4 h-4" />
            Adicionar Lote
          </button>
          <button 
            type="button"
            onClick={() => openCreateModal('individual')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="w-4 h-4" />
            Cadastrar Ficha
          </button>
        </div>
      </div>

      {/* List / Table Grouped by Cabo Eleitoral */}
      <div className="space-y-4">
        {sections.map(section => {
          const total = getProfileTotal(section.list)
          const isExpanded = expandedCandidate === section.id

          return (
            <div key={section.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:shadow-sm">
              <div 
                className="p-5 sm:p-6 cursor-pointer flex justify-between items-center bg-slate-50/40 hover:bg-slate-50 transition-colors select-none"
                onClick={() => setExpandedCandidate(isExpanded ? null : section.id)}
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-lg sm:text-xl shrink-0">
                    {section.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-black text-brand-dark truncate">{section.name}</h2>
                    <p className="text-xs sm:text-sm font-semibold text-slate-400">{section.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-black text-brand-primary leading-tight">{total}</p>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Fichas/Lotes</p>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                  {section.list.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-bold text-sm">
                      Nenhum registro para este Cabo Eleitoral.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="font-bold p-3.5 pl-5 border-b border-slate-100">Tipo</th>
                            <th className="font-bold p-3.5 border-b border-slate-100">Nome / Qtd</th>
                            <th className="font-bold p-3.5 border-b border-slate-100">Bairro</th>
                            <th className="font-bold p-3.5 border-b border-slate-100">Local de Votação</th>
                            <th className="font-bold p-3.5 border-b border-slate-100">Data</th>
                            <th className="font-bold p-3.5 pr-5 border-b border-slate-100 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {section.list.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="p-3.5 pl-5">
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
                                  <div className="font-bold text-brand-dark text-sm">{v.name || 'Sem nome'}</div>
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
                              <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button 
                                    type="button"
                                    onClick={(e) => openEditModal(v, e)}
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
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3.5 shrink-0 bg-slate-50/50">
              <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                {modalType === 'lote' ? <Users className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-brand-dark tracking-tight">
                {editingCabo ? 'Editar Registro' : (modalType === 'lote' ? 'Registro Rápido em Lote' : 'Nova Ficha de Cabo Eleitoral')}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Vincular a um Cabo Eleitoral</label>
                <select name="cabo_id" defaultValue={editingCabo?.user_id || currentUserId} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm">
                  <option value={currentUserId}>Mim mesmo (Vínculo Direto)</option>
                  {cabosProfiles.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} (Cabo Eleitoral)</option>
                  ))}
                </select>
              </div>

              {modalType === 'lote' ? (
                <div className="space-y-4">
                  {!editingCabo && <p className="text-xs sm:text-sm text-slate-500 font-medium">Você pode adicionar múltiplas linhas de lotes de uma vez só.</p>}
                  
                  {loteRows.map((row) => {
                    const rowEscolas = row.neighborhood ? bairroEscolasMap[row.neighborhood] || ESCOLAS_PARNAIBA : ESCOLAS_PARNAIBA
                    return (
                      <div key={row.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 relative group">
                        {loteRows.length > 1 && !editingCabo && (
                          <button type="button" onClick={() => handleRemoveLoteRow(row.id)} className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors shadow-xs z-10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-brand-dark mb-1">Bairro / Região</label>
                              <select 
                                value={row.neighborhood} 
                                onChange={(e) => updateLoteRow(row.id, 'neighborhood', e.target.value)}
                                name={editingCabo ? "neighborhood" : undefined}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm"
                              >
                                <option value="">Selecione...</option>
                                {BAIRROS_PARNAIBA.map(b => <option key={b} value={b}>{b}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-brand-dark mb-1">Qtd Votos Estimados</label>
                              <input 
                                type="number" 
                                min="1" 
                                required 
                                value={row.quantity}
                                onChange={(e) => updateLoteRow(row.id, 'quantity', parseInt(e.target.value) || 1)}
                                name={editingCabo ? "quantity" : undefined}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark font-bold text-sm" 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-brand-dark mb-1">Local de Votação (Unidade Escolar)</label>
                            <select 
                              value={row.voting_location} 
                              onChange={(e) => updateLoteRow(row.id, 'voting_location', e.target.value)}
                              name={editingCabo ? "voting_location" : undefined}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm"
                            >
                              <option value="">Selecione a unidade...</option>
                              {rowEscolas.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {!editingCabo && (
                    <button 
                      type="button" 
                      onClick={handleAddLoteRow}
                      className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-brand-primary/50 hover:bg-brand-primary/5 text-brand-primary font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Adicionar Outra Linha
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Nome Completo</label>
                    <input name="name" required defaultValue={editingCabo?.name || ''} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm" placeholder="Nome do cabo" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Telefone / WhatsApp</label>
                      <input name="phone" defaultValue={editingCabo?.phone || ''} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm" placeholder="(00) 00000-0000" />
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
                        {BAIRROS_PARNAIBA.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Local de Votação (Escola/Unidade)</label>
                    <select name="voting_location" defaultValue={editingCabo?.voting_location || ''} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm">
                      <option value="">Selecione a escola...</option>
                      {(selectedBairro ? (bairroEscolasMap[selectedBairro] || ESCOLAS_PARNAIBA) : ESCOLAS_PARNAIBA).map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingCabo(null); }}
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
        isOpen={Boolean(deletingRecord)}
        title="Excluir Registro de Cabo"
        description="Tem certeza que deseja excluir este registro de cabo eleitoral? O número de votos e as vinculações correspondentes serão removidos."
        itemName={deletingRecord ? (deletingRecord.type === 'lote' ? `Lote com +${deletingRecord.quantity} votos (${deletingRecord.neighborhood || 'Bairro'})` : `${deletingRecord.name || 'Ficha'} (${deletingRecord.neighborhood || 'Bairro'})`) : null}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingRecord(null)}
      />
    </div>
  )
}
