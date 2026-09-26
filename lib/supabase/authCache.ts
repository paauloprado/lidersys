import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export interface UserProfile {
  id: string
  full_name: string | null
  role: 'admin' | 'lider' | 'lideranca' | 'liderado'
  access_modules: string[] | null
  cpf?: string | null
  phone?: string | null
}

/**
 * Retorna o usuário autenticado da sessão atual.
 * Utiliza React.cache() para deduplicar chamadas durante a mesma renderização (Layout + Page).
 */
export const getSessionUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Retorna os dados do perfil do usuário autenticado.
 * Utiliza service client para velocidade máxima (sem overhead de RLS em leitura de perfil)
 * e React.cache() para executar apenas UMA vez por ciclo de renderização na requisição.
 */
export const getSessionProfile = cache(async (userId?: string): Promise<UserProfile | null> => {
  let targetId = userId
  if (!targetId) {
    const user = await getSessionUser()
    if (!user) return null
    targetId = user.id
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('id, full_name, role, access_modules, cpf, phone')
    .eq('id', targetId)
    .maybeSingle()

  return profile as UserProfile | null
})
