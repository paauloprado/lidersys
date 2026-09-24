'use client'

import { useEffect } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  title?: string
  description?: string
  itemName?: string | null
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({
  isOpen,
  title = 'Confirmar Exclusão',
  description = 'Tem certeza que deseja excluir este registro permanentemente? Esta ação não pode ser desfeita.',
  itemName,
  isLoading = false,
  confirmText = 'Sim, Excluir',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isLoading, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel()
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="confirm-delete-title" className="text-xl font-bold text-brand-dark tracking-tight">
              {title}
            </h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Ação Irreversível
            </p>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
          {description}
        </p>

        {itemName && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 break-words flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <span className="truncate">{itemName}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
