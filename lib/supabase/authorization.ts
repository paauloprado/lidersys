import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function authorizeModule(module: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { data: profile } = await supabase.from('profiles').select('role, access_modules').eq('id', user.id).maybeSingle()
  if (!profile || (profile.role !== 'admin' && !(profile.access_modules ?? []).includes(module))) {
    throw new Error('Acesso negado')
  }
  return { supabase, user, profile }
}

export async function authorizeAdmin() {
  const result = await authorizeModule('usuarios')
  if (result.profile.role !== 'admin') throw new Error('Acesso negado: apenas administradores')
  return result
}
