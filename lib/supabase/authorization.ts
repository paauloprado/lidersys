import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function authorizeModule(module: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado: Faça login para continuar.')

  // Usa service client para ler o perfil do usuário autenticado de forma confiável
  const service = createServiceClient()
  const { data: profile, error } = await service
    .from('profiles')
    .select('id, full_name, role, access_modules')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile) {
    throw new Error('Perfil de usuário não encontrado.')
  }

  const isAdmin = profile.role === 'admin'
  const hasModule = (profile.access_modules ?? []).includes(module)

  if (!isAdmin && !hasModule) {
    throw new Error(`Acesso negado: Você não possui permissão para o módulo "${module}".`)
  }

  return { supabase, user, profile }
}

export async function authorizeAdmin() {
  const result = await authorizeModule('usuarios')
  if (result.profile.role !== 'admin') {
    throw new Error('Acesso negado: Apenas administradores podem executar esta ação.')
  }
  return result
}
