/**
 * Utilitário centralizado para limpeza e validação de variáveis de ambiente do Supabase.
 * Previne falhas comuns no Vercel:
 * - Espaços em branco e aspas acidentais
 * - Barras finais e ausência de protocolo https://
 * - Suporta tanto a nomenclatura padrão (NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)
 *   quanto a nova nomenclatura do Supabase (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY).
 */

export function getCleanEnv(key: string): string {
  let val: string | undefined

  if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
    val = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
    val =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY
  } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
    val =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  } else {
    val = process.env[key]
  }

  if (!val) return ''
  val = val.trim().replace(/^["']|["']$/g, '')

  if ((key === 'NEXT_PUBLIC_SUPABASE_URL' || key === 'SUPABASE_URL') && val) {
    val = val.replace(/\/+$/, '')
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      val = `https://${val}`
    }
  }

  return val
}

export function getSupabaseEnv() {
  const url = getCleanEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getCleanEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const serviceKey = getCleanEnv('SUPABASE_SERVICE_ROLE_KEY') || anonKey
  return { url, anonKey, serviceKey }
}
