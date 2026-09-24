'use server'

import { createClient } from '@/lib/supabase/server'
import { getCleanEnv } from '@/lib/supabase/env'
import { headers } from 'next/headers'

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim()

  if (!email) {
    return { error: 'Por favor, informe seu e-mail cadastrado.' }
  }

  // Validação simples de formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Por favor, informe um endereço de e-mail válido.' }
  }

  const supabaseUrl = getCleanEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getCleanEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: 'Variáveis de ambiente do Supabase não configuradas na Vercel.'
    }
  }

  try {
    const supabase = await createClient()
    const headerList = await headers()
    const host = headerList.get('x-forwarded-host') || headerList.get('host')
    const protocol = headerList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
    const origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || '')

    const redirectUrl = `${origin}/auth/callback?next=/redefinir-senha`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      console.error('Erro ao enviar e-mail de recuperação:', error)

      if (error.message.includes('rate limit') || error.message.includes('security purposes')) {
        return {
          error: 'Por segurança, aguarde alguns instantes antes de solicitar um novo link de recuperação.'
        }
      }

      return { error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('Erro interno na recuperação de senha:', err)
    const rawMsg = err instanceof Error ? err.message : String(err)
    if (rawMsg.includes('fetch failed')) {
      return {
        error: 'Erro de conexão com o banco de dados (fetch failed). Verifique se o projeto no Supabase está ativo.'
      }
    }
    return { error: `Erro ao solicitar recuperação: ${rawMsg}` }
  }
}

