import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from '@/lib/supabase/env'

/**
 * Cria um cliente Supabase com a service role key.
 * Use APENAS em Server Actions e Route Handlers que já foram
 * protegidos por authorizeModule() ou authorizeAdmin().
 * Este cliente ignora o RLS — a segurança é feita pela camada de autorização do Next.js.
 */
export function createServiceClient() {
  const { url, serviceKey } = getSupabaseEnv()
  return createClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
