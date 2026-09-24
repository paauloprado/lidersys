import { createBrowserClient } from '@supabase/ssr'
import { getCleanEnv } from '@/lib/supabase/env'

export function createClient() {
  return createBrowserClient(
    getCleanEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getCleanEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}
