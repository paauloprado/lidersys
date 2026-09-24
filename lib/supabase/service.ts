import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cria um cliente Supabase com a service role key.
 * Use APENAS em Server Actions e Route Handlers que já foram
 * protegidos por authorizeModule() ou authorizeAdmin().
 * Este cliente ignora o RLS — a segurança é feita pela camada de autorização do Next.js.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
