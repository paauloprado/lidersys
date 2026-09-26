'use client'

import { useState, useTransition } from 'react'
import { Target, Pencil, Check, X, AlertCircle } from 'lucide-react'
import { updateMetaEleitores } from './actions'
import { toast } from 'sonner'

interface MetaCardProps {
  totalEleitores: number
  meta: number
  isAdmin: boolean
}

export default function MetaCard({ totalEleitores, meta: initialMeta, isAdmin }: MetaCardProps) {
  const [meta, setMeta] = useState(initialMeta)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(String(initialMeta))
  const [isPending, startTransition] = useTransition()

  const pct = Math.min(100, Math.round((totalEleitores / meta) * 100))

  function handleEdit() {
    setInputValue(String(meta))
    setIsEditing(true)
  }

  function handleCancel() {
    setIsEditing(false)
    setInputValue(String(meta))
  }

  function handleSave() {
    const newMeta = parseInt(inputValue, 10)
    if (!newMeta || newMeta < 1) {
      toast.error('Digite um valor válido para a meta (mínimo: 1)')
      return
    }

    const fd = new FormData()
    fd.append('meta', String(newMeta))

    startTransition(async () => {
      const res = await updateMetaEleitores(fd)
      if (res?.error) {
        toast.error('Erro ao salvar meta: ' + res.error)
      } else {
        setMeta(newMeta)
        setIsEditing(false)
        toast.success('Meta atualizada com sucesso!')
      }
    })
  }

  return (
    <div className="bg-gradient-to-br from-brand-primary to-brand-dark p-6 sm:p-8 rounded-3xl shadow-md text-white relative overflow-hidden group sm:col-span-2 md:col-span-1">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-110"></div>
      
      <div className="flex items-start justify-between mb-5 sm:mb-6 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/10">
          <Target className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        {isAdmin && !isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-all"
            title="Definir meta"
          >
            <Pencil className="w-3.5 h-3.5" />
            Definir Meta
          </button>
        )}
      </div>

      <div className="relative z-10">
        {isEditing ? (
          /* Modo edição da meta */
          <div className="space-y-3">
            <p className="text-blue-100 font-bold text-sm">Nova meta de eleitores:</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
                className="flex-1 px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 font-black text-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50"
                placeholder="Ex: 5000"
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={isPending}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all disabled:opacity-50"
                title="Salvar"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/50 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Enter para salvar · Esc para cancelar
            </p>
          </div>
        ) : (
          /* Modo visualização */
          <>
            <div className="flex items-end gap-2 mb-3 sm:mb-4">
              <h3 className="text-4xl sm:text-5xl font-black tracking-tight">{pct}%</h3>
              <p className="text-blue-100 font-bold pb-1 text-sm sm:text-base">da meta</p>
            </div>
            
            <div className="w-full bg-black/30 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-blue-300 to-white h-full rounded-full relative transition-all duration-700"
                style={{ width: `${pct}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs sm:text-sm text-blue-100 font-medium">
              <span>Atual: {totalEleitores.toLocaleString('pt-BR')}</span>
              <span>Alvo: {meta.toLocaleString('pt-BR')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
