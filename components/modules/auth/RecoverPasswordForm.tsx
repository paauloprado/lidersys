'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { forgotPasswordAction } from '@/app/recuperar-senha/actions'

export function RecoverPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set('email', email)
      const result = await forgotPasswordAction(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    } catch (err: unknown) {
      console.error('Erro ao solicitar recuperação de senha:', err)
      const rawMsg = err instanceof Error ? err.message : String(err)
      if (rawMsg.includes('fetch failed')) {
        setError('Erro de conexão com o banco de dados (fetch failed). Verifique se o projeto no Supabase está ativo.')
      } else {
        setError(`Erro inesperado: ${rawMsg}`)
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
          <h3 className="text-lg font-bold text-slate-900">E-mail enviado com sucesso!</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Se o endereço <strong className="text-slate-900 font-semibold">{email}</strong> estiver cadastrado em nossa base, você receberá um link seguro para redefinir sua senha.
          </p>
          <p className="text-xs text-slate-500">
            Não se esqueça de checar sua pasta de <span className="font-semibold">Spam</span> ou <span className="font-semibold">Lixo Eletrônico</span>.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a tela de login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-bold text-brand-dark">
            E-mail cadastrado
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white shadow-sm hover:border-slate-300"
              placeholder="seu@email.com"
            />
          </div>
          <p className="text-xs text-slate-500">
            Enviaremos um link de confirmação para criação de uma nova senha.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-brand-primary/20 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Enviando link...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar link de recuperação</span>
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Lembrou a senha? Voltar para o login
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
