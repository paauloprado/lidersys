'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogIn, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { loginAction } from '@/app/login/actions'

interface LoginFormProps {
  initialError?: string
  initialMessage?: string
}

export function LoginForm({ initialError, initialMessage }: LoginFormProps = {}) {
  const [error, setError] = useState<string | null>(initialError || null)
  const [message, setMessage] = useState<string | null>(initialMessage || null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await loginAction(formData)
      
      // Se o loginAction retornar um erro (e não redirecionar)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch (err: unknown) {
      console.error('Erro ao submeter login:', err)
      const rawMsg = err instanceof Error ? err.message : String(err)
      if (rawMsg.includes('fetch failed')) {
        setError('Erro de conexão com o banco de dados (fetch failed). Verifique se o projeto no Supabase está ativo e as variáveis de ambiente na Vercel.')
      } else {
        setError(`Ocorreu um erro inesperado: ${rawMsg}`)
      }
      setIsLoading(false)
    }
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-bold text-brand-dark">
            E-mail
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
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white shadow-sm hover:border-slate-300"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-bold text-brand-dark">
              Senha
            </label>
            <Link href="/recuperar-senha" className="text-sm font-bold text-brand-primary hover:text-brand-primary-hover hover:underline transition-colors">
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-brand-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white shadow-sm hover:border-slate-300"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-brand-primary/20 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all active:scale-[0.98] disabled:opacity-70"
        >
          <LogIn className="w-5 h-5" />
          {isLoading ? 'Entrando...' : 'Entrar na plataforma'}
        </button>
      </form>

      {message && (
        <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium flex items-start gap-3 relative overflow-hidden">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Sucesso</span>
            <span>{message}</span>
          </div>
        </div>
      )}

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
