'use client'

import { useState } from 'react'
import { createUnidade, deleteUnidade, updateUnidade } from './actions'
import { Plus, Trash2, Search, Pencil, MapPin, Building2 } from 'lucide-react'
import { toast } from 'sonner'
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
  const [unidades, setUnidades] = useState(initialUnidades)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnidade, setEditingUnidade] = useState<VotingLocation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUnidades = unidades.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    let res;
    if (editingUnidade) {
      formData.append('id', editingUnidade.id);
      res = await updateUnidade(formData);
    } else {
      res = await createUnidade(formData);
    }
    
    setIsSubmitting(false)
    
    if (res?.error) {
      toast.error('Erro ao salvar unidade: ' + res.error)
    } else {
      toast.success('Unidade salva com sucesso!')
      setIsModalOpen(false)
      // Idealmente recarregamos os dados ou usamos Router Refresh
      window.location.reload()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta unidade? Isso não altera registros passados de eleitores, mas ela deixará de aparecer para novas vinculações.')) return
    
    const res = await deleteUnidade(id)
    if (res?.error) {
      toast.error('Erro ao excluir: ' + res.error)
    } else {
      toast.success('Unidade excluída com sucesso!')
      setUnidades(unidades.filter(u => u.id !== id))
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Unidades Eleitorais</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie as escolas e locais de votação de Parnaíba.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingUnidade(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nova Unidade
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar unidade por nome ou bairro..." 
          className="w-full bg-transparent border-none outline-none text-brand-dark font-medium placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredUnidades.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Nenhuma unidade encontrada</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
              Tente buscar com outros termos ou adicione uma nova unidade.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUnidades.map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark leading-tight">{u.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mt-1.5">
                      <MapPin className="w-4 h-4 text-brand-primary" />
                      {u.neighborhood}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-0 justify-end">
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => { setEditingUnidade(u); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Unidade"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Unidade"
                      >
                        <Trash2 className="w-5 h-5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">
                {editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1.5">Nome da Escola/Unidade</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingUnidade?.name} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" 
                  placeholder="Ex: ESCOLA MUNICIPAL..." 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1.5">Bairro</label>
                <select 
                  name="neighborhood" 
                  required 
                  defaultValue={editingUnidade?.neighborhood || bairros[0]} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark"
                >
                  {bairros.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
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
