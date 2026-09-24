'use client'

import { useState } from 'react'
import { createEleitor, deleteEleitor, updateEleitor } from './actions'
import { Trash2, Users, FileText, MapPin, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import type { VoterRecord, VotingLocation } from '@/lib/types'

export default function EleitoresClient({ 
  initialVoters, 
  votingLocations = []
}: { 
  initialVoters: VoterRecord[], 
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
  const ESCOLAS_PARNAIBA = Array.from(new Set(votingLocations.map(v => v.name))).sort()
  const [voters, setVoters] = useState(initialVoters)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'lote' | 'individual'>('individual')
  const [editingVoter, setEditingVoter] = useState<VoterRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Totais
  const totalEleitores = voters.reduce((acc, curr) => acc + (curr.quantity || 1), 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append('type', modalType)
    if (editingVoter) {
      formData.append('id', editingVoter.id)
    }
    
    const res = editingVoter ? await updateEleitor(formData) : await createEleitor(formData)
    setIsSubmitting(false)
    
    if (res.error) {
      toast.error('Erro ao salvar cadastro: ' + res.error)
    } else {
      toast.success('Cadastro salvo com sucesso!')
      setIsModalOpen(false)
      setEditingVoter(null)
      window.location.reload() // Recarrega para buscar do servidor atualizado
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return
    
    const res = await deleteEleitor(id)
    if (res.error) {
      toast.error('Erro ao excluir: ' + res.error)
    } else {
      toast.success('Registro excluído com sucesso!')
      setVoters(voters.filter(v => v.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Gestão de Eleitores</h1>
          <p className="text-slate-500 font-medium mt-1">Total acumulado: <strong className="text-brand-primary">{totalEleitores} votos/eleitores</strong> sob sua rede.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setEditingVoter(null); setModalType('lote'); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-brand-dark px-4 py-2.5 rounded-xl font-bold transition-all"
          >
            <Users className="w-5 h-5" />
            Adicionar Lote
          </button>
          <button 
            onClick={() => { setEditingVoter(null); setModalType('individual'); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5"
          >
            <FileText className="w-5 h-5" />
            Cadastrar Ficha
          </button>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-brand-dark text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-primary" /> 
            Registros Recentes
          </h2>
        </div>
        
        {voters.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-1">Nenhum registro encontrado</h3>
            <p className="text-slate-500">Comece adicionando eleitores individualmente ou em lote.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="font-semibold p-4 pl-6 border-b border-slate-100">Tipo</th>
                  <th className="font-semibold p-4 border-b border-slate-100">Nome / Qtd</th>
                  <th className="font-semibold p-4 border-b border-slate-100">Bairro</th>
                  <th className="font-semibold p-4 border-b border-slate-100">Local de Votação</th>
                  <th className="font-semibold p-4 border-b border-slate-100">Data</th>
                  <th className="font-semibold p-4 pr-6 border-b border-slate-100 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors group border-b border-slate-50">
                    <td className="p-4 pl-6">
                      {v.type === 'lote' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
                          <Users className="w-3 h-3" /> Lote
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                          <FileText className="w-3 h-3" /> Ficha
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {v.type === 'lote' ? (
                        <div className="font-bold text-brand-dark">+{v.quantity} Votos Estimados</div>
                      ) : (
                        <div className="font-bold text-brand-dark">{v.name}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {v.neighborhood ? (
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {v.neighborhood}</div>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {v.voting_location ? (
                        <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> {v.voting_location}</div>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-slate-500 text-sm font-medium">
                      {new Date(v.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingVoter(v); setModalType(v.type); setIsModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar Registro"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                {modalType === 'lote' ? <Users className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">
                {editingVoter ? 'Editar Registro' : (modalType === 'lote' ? 'Registro Rápido em Lote' : 'Nova Ficha de Eleitor')}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {modalType === 'lote' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1.5">Quantidade Estimada</label>
                    <input type="number" name="quantity" min="1" required defaultValue={editingVoter?.quantity || 10} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-lg font-bold" />
                    {!editingVoter && <p className="text-xs text-slate-500 mt-2">Use esta opção para contabilizar uma base prometida sem a necessidade de preencher dados individuais.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1.5">Bairro / Região Predominante (Opcional)</label>
                    <select name="neighborhood" defaultValue={editingVoter?.neighborhood || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark">
                      <option value="">Selecione um bairro...</option>
                      {BAIRROS_PARNAIBA.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1.5">Local de Votação Predominante (Escola)</label>
                    <select name="voting_location" defaultValue={editingVoter?.voting_location || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark">
                      <option value="">Selecione a escola...</option>
                      {ESCOLAS_PARNAIBA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1.5">Nome Completo</label>
                    <input name="name" required defaultValue={editingVoter?.name || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" placeholder="Nome do eleitor" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-brand-dark mb-1.5">Telefone / WhatsApp</label>
                      <input name="phone" defaultValue={editingVoter?.phone || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-brand-dark mb-1.5">Bairro</label>
                      <select name="neighborhood" required defaultValue={editingVoter?.neighborhood || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark">
                        <option value="">Selecione...</option>
                        {BAIRROS_PARNAIBA.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1.5">Local de Votação (Escola/Unidade)</label>
                    <select name="voting_location" defaultValue={editingVoter?.voting_location || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark">
                      <option value="">Selecione a escola...</option>
                      {ESCOLAS_PARNAIBA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </>
              )}

              

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingVoter(null); }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
