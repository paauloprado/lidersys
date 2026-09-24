'use client'

import { useState } from 'react'
import { createUser, updateUser, deleteUser } from './actions'
import { Plus, Edit2, Trash2, ShieldAlert, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'

type Profile = {
  id: string
  full_name: string
  role: 'admin' | 'lider' | 'lideranca' | 'liderado'
  parent_id: string | null
  email?: string // Join from auth.users se possível, mas vamos simplificar
  access_modules?: string[]
}

export default function UserManagementClient({ 
  initialProfiles,
  lideres 
}: { 
  initialProfiles: Profile[]
  lideres: Profile[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [roleSelection, setRoleSelection] = useState('liderado')
  const [hasLogin, setHasLogin] = useState(true)

  function openCreateModal() {
    setEditingUser(null)
    setRoleSelection('liderado')
    setHasLogin(true)
    setIsModalOpen(true)
  }

  function openEditModal(user: Profile) {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      if (editingUser) {
        formData.append('id', editingUser.id)
        const res = await updateUser(formData)
        if (res.success) {
          toast.success('Usuário atualizado com sucesso!')
          setIsModalOpen(false)
        } else {
          toast.error(res.error || 'Erro ao atualizar')
        }
      } else {
        const res = await createUser(formData)
        if (res.success) {
          toast.success('Usuário criado com sucesso!')
          setIsModalOpen(false)
        } else {
          toast.error(res.error || 'Erro ao criar usuário')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário definitivamente?')) return
    
    const res = await deleteUser(id)
    if (res.success) {
      toast.success('Usuário excluído!')
    } else {
      toast.error(res.error || 'Erro ao excluir')
    }
  }

  const roleColors = {
    admin: 'bg-brand-red/10 text-brand-red border-brand-red/20',
    lider: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    lideranca: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    liderado: 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const roleLabels = {
    admin: 'Administrador',
    lider: 'Líder',
    lideranca: 'Cabo Eleitoral',
    liderado: 'Eleitor'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">Gestão de Usuários</h2>
          <p className="text-slate-500 font-medium mt-1">Gerencie acessos, permissões e a hierarquia do sistema.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-sm font-bold text-slate-600">
                <th className="py-4 px-6">Nome</th>
                <th className="py-4 px-6">Permissão</th>
                <th className="py-4 px-6">Líder Vinculado</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialProfiles.map(profile => (
                <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-dark">{profile.full_name}</p>
                        <p className="text-xs text-slate-400 font-medium">{profile.id.split('-')[0]}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleColors[profile.role]}`}>
                      {roleLabels[profile.role]}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {profile.parent_id ? (
                      <span className="text-sm font-medium text-slate-600">
                        {initialProfiles.find(p => p.id === profile.parent_id)?.full_name || 'Desconhecido'}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Nenhum</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(profile)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(profile.id)} className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialProfiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                    Nenhum perfil encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">
                {editingUser ? 'Editar Permissões' : 'Criar Novo Usuário'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1.5">Nível de Permissão</label>
                <select 
                  name="role" 
                  value={roleSelection} 
                  onChange={(e) => setRoleSelection(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark"
                >
                  <option value="admin">Administrador (Acesso Total)</option>
                  <option value="lider">Líder (Nível 1)</option>
                  <option value="lideranca">Cabo Eleitoral (Nível 2)</option>
                  <option value="liderado">Eleitor (Nível 3)</option>
                </select>
              </div>

              {!editingUser && (roleSelection === 'lideranca' || roleSelection === 'liderado') && (
                <div className="flex items-center gap-3 p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                  <input 
                    type="checkbox" 
                    id="hasLogin"
                    name="hasLogin" 
                    checked={hasLogin}
                    onChange={(e) => setHasLogin(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="hasLogin" className="text-sm font-bold text-brand-dark cursor-pointer">
                    Este usuário terá acesso ao sistema? (Login e Senha)
                  </label>
                </div>
              )}

              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1.5">Nome Completo</label>
                    <input name="fullName" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" />
                  </div>
                  {hasLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-brand-dark mb-1.5">E-mail</label>
                        <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-brand-dark mb-1.5">Senha</label>
                        <input name="password" type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark" placeholder="Defina a senha de acesso" />
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1.5">Vincular a um Líder (Opcional)</label>
                <select name="parentId" defaultValue={editingUser?.parent_id || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white text-brand-dark">
                  <option value="">Nenhum</option>
                  {lideres.filter(l => l.id !== editingUser?.id).map(l => (
                    <option key={l.id} value={l.id}>{l.full_name} ({roleLabels[l.role]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-dark mb-3">Módulos Permitidos</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'cabos', label: 'Cabos Eleitorais' },
                    { id: 'eleitores', label: 'Eleitores' },
                    { id: 'candidatos', label: 'Candidatos' },
                    { id: 'unidades', label: 'Unidades' },
                    { id: 'usuarios', label: 'Usuários' }
                  ].map(mod => (
                    <label key={mod.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="checkbox" 
                        name="modules" 
                        value={mod.id} 
                        defaultChecked={!editingUser ? true : (editingUser.access_modules || []).includes(mod.id)}
                        className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm font-bold text-slate-700">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-hover transition-colors disabled:opacity-50 shadow-md">
                  {isLoading ? 'Salvando...' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
