'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { resetPasswordAction } from '@/app/redefinir-senha/actions'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não conferem.')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.set('password', password)
      formData.set('confirmPassword', confirmPassword)

      // Tenta via Server Action primeiro
      const result = await resetPasswordAction(formData)

      if (result?.error) {
        // Fallback: se o Server Action acusou erro de sessão, tenta via client do Supabase (para casos com tokens no hash do navegador)
        const supabase = createClient()
        const { error: clientError } = await supabase.auth.updateUser({ password })

        if (clientError) {
          setError(result.error)
        } else {
          setSuccess(true)
        }
      } else if (result?.success) {
        setSuccess(true)
      }
    } catch (err: unknown) {
      console.error('Erro ao redefinir senha:', err)
      const rawMsg = err instanceof Error ? err.message : String(err)
      if (rawMsg.includes('fetch failed')) {
        setError('Erro de conexão com o banco de dados (fetch failed). Verifique se o projeto no Supabase está ativo.')
      } else {
        setError(`Erro inesperado ao salvar nova senha: ${rawMsg}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Senha atualizada com sucesso!</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sua nova senha já está valendo. Você pode acessar o painel agora mesmo com suas novas credenciais.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover transition-all shadow-md shadow-brand-primary/20"
          >
            <span>Ir para o painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/login"
            className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="block text-sm font-bold text-brand-dark">
            Nova senha
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="new-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white shadow-sm hover:border-slate-300"
              placeholder="Mínimo de 6 caracteres"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-sm font-bold text-brand-dark">
            Confirme a nova senha
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white shadow-sm hover:border-slate-300"
              placeholder="Digite a mesma senha"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-brand-primary/20 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Salvando nova senha...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Salvar nova senha</span>
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/recuperar-senha"
            className="text-xs font-semibold text-slate-500 hover:text-brand-primary transition-colors"
          >
            Link expirou? Solicitar outro link
          </Link>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex items-start gap-3 relative overflow-hidden">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Atenção</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </>
  )
}
