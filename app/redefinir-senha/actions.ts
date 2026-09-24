'use server'

import { createClient } from '@/lib/supabase/server'
import { getCleanEnv } from '@/lib/supabase/env'

export async function resetPasswordAction(formData: FormData) {
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirmPassword') || '')

  if (!password || !confirmPassword) {
    return { error: 'Por favor, preencha todos os campos.' }
  }

  if (password.length < 6) {
    return { error: 'A nova senha deve ter no mínimo 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas informadas não coincidem.' }
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

    // Atualiza a senha do usuário com a sessão ativa
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error('Erro ao atualizar senha no Supabase:', error)
      return { error: `Não foi possível atualizar a senha: ${error.message}` }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('Erro inesperado na redefinição de senha:', err)
    const rawMsg = err instanceof Error ? err.message : String(err)
    if (rawMsg.includes('fetch failed')) {
      return {
        error: 'Erro de conexão com o banco de dados (fetch failed). Verifique se o projeto no Supabase está ativo.'
      }
    }
    return { error: `Erro ao redefinir senha: ${rawMsg}` }
  }
}
