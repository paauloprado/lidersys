'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createUnidade, deleteUnidade, updateUnidade } from './actions'
import { Plus, Trash2, Search, Pencil, MapPin, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal'
import type { VotingLocation } from '@/lib/types'

export default function UnidadesClient({ 
  initialUnidades, 
  bairros,
  isAdmin 
}: { 
  initialUnidades: VotingLocation[], 
  bairros: string[],
  isAdmin: boolean 
}) {
  const router = useRouter()
  const [unidades, setUnidades] = useState<VotingLocation[]>(initialUnidades)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnidade, setEditingUnidade] = useState<VotingLocation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados controlados do formulário
  const [nameInput, setNameInput] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')

  // Confirmação de exclusão
  const [deletingUnidade, setDeletingUnidade] = useState<VotingLocation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sincroniza estado quando initialUnidades for atualizado pelo router.refresh()
  useEffect(() => {
    setUnidades(initialUnidades)
  }, [initialUnidades])

  const filteredUnidades = unidades.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function openCreateModal() {
    setEditingUnidade(null)
    setNameInput('')
    setSelectedNeighborhood(bairros[0] || 'Centro')
    setIsModalOpen(true)
  }

  function openEditModal(unidade: VotingLocation) {
    setEditingUnidade(unidade)
    setNameInput(unidade.name)
    setSelectedNeighborhood(unidade.neighborhood)
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', nameInput.trim())
      formData.append('neighborhood', selectedNeighborhood.trim())
      
      let res;
      if (editingUnidade) {
        formData.append('id', editingUnidade.id)
        res = await updateUnidade(formData)
      } else {
        res = await createUnidade(formData)
      }
      
      if (res?.error) {
        toast.error('Erro ao salvar unidade: ' + res.error)
      } else if (res?.data) {
        toast.success(editingUnidade ? 'Unidade atualizada com sucesso!' : 'Unidade cadastrada com sucesso!')
        const savedItem = res.data as VotingLocation
        if (editingUnidade) {
          setUnidades(prev => prev.map(u => u.id === savedItem.id ? savedItem : u))
        } else {
          setUnidades(prev => [savedItem, ...prev])
        }
        setIsModalOpen(false)
        setEditingUnidade(null)
        router.refresh()
      } else {
        setIsModalOpen(false)
        setEditingUnidade(null)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao salvar unidade:', err)
      toast.error('Erro de conexão ao salvar unidade.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function requestDelete(unidade: VotingLocation, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingUnidade(unidade)
  }

  async function confirmDelete() {
    if (!deletingUnidade) return
    setIsDeleting(true)
    try {
      const res = await deleteUnidade(deletingUnidade.id)
      if (res?.error) {
        toast.error('Erro ao excluir: ' + res.error)
      } else {
        toast.success('Unidade excluída com sucesso!')
        setUnidades(prev => prev.filter(u => u.id !== deletingUnidade.id))
        setDeletingUnidade(null)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao excluir unidade:', err)
      toast.error('Erro de conexão ao excluir a unidade.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">Unidades Eleitorais</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">Gerencie as escolas e locais de votação de Parnaíba.</p>
        </div>
        {isAdmin && (
          <button 
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Nova Unidade
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Buscar unidade por nome ou bairro..." 
          className="w-full bg-transparent border-none outline-none text-brand-dark font-medium placeholder:text-slate-400 text-sm sm:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredUnidades.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-700">Nenhuma unidade encontrada</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              Tente buscar com outros termos ou adicione uma nova unidade.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUnidades.map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 hover:bg-slate-50/60 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-brand-dark leading-tight">{u.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      {u.neighborhood}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3 sm:mt-0 justify-end">
                  {isAdmin && (
                    <>
                      <button 
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Unidade"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => requestDelete(u, e)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Unidade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
              <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-brand-dark tracking-tight">
                {editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Nome da Escola/Unidade</label>
                <input 
                  name="name" 
                  required 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm" 
                  placeholder="Ex: ESCOLA MUNICIPAL..." 
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-brand-dark mb-1.5">Bairro</label>
                <select 
                  name="neighborhood" 
                  required 
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark text-sm"
                >
                  {bairros.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/20 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
        isOpen={Boolean(deletingUnidade)}
        title="Excluir Unidade Eleitoral"
        description="Tem certeza que deseja excluir esta unidade? Ela deixará de aparecer para novas vinculações nos lotes e fichas."
        itemName={deletingUnidade ? `${deletingUnidade.name} (${deletingUnidade.neighborhood})` : null}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingUnidade(null)}
      />
    </div>
  )
}
