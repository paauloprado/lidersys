'use server'

import { createClient } from '@/lib/supabase/server'
import { getCleanEnv } from '@/lib/supabase/env'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Por favor, informe seu e-mail e sua senha.' }
  }

  const supabaseUrl = getCleanEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getCleanEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: 'Variáveis de ambiente do Supabase não configuradas na Vercel (NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes).'
    }
  }

  if (supabaseUrl.includes('your-project') || !supabaseUrl.startsWith('http')) {
    return {
      error: 'A URL do Supabase na Vercel está com valor de exemplo ou inválida. Configure a URL real do projeto.'
    }
  }

  if (supabaseAnonKey.includes('your-anon-key')) {
    return {
      error: 'A chave anon do Supabase (NEXT_PUBLIC_SUPABASE_ANON_KEY) na Vercel está com valor de exemplo. Configure a chave real do projeto.'
    }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'E-mail ou senha incorretos.' }
      }
      return { error: error.message }
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: unknown }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err
    }

    console.error('Erro de login no Supabase:', err)
    const message = err instanceof Error ? err.message : String(err)

    if (message.includes('fetch failed')) {
      return {
        error: 'Erro de conexão com o banco de dados (fetch failed). Verifique se o seu projeto no Supabase está ativo (não pausado) e se NEXT_PUBLIC_SUPABASE_URL está correta na Vercel.'
      }
    }

    return { error: `Erro ao realizar login: ${message}` }
  }

  // Sucesso
  redirect('/dashboard')
}
