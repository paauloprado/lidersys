/**
 * Utilitário centralizado para limpeza e validação de variáveis de ambiente do Supabase.
 * Previne falhas comuns no Vercel (espaços em branco, aspas acidentais, barras finais e falta de protocolo https://).
 */

export function getCleanEnv(key: string): string {
  let val = process.env[key]
  if (!val) return ''
  val = val.trim().replace(/^["']|["']$/g, '')
  if (key === 'NEXT_PUBLIC_SUPABASE_URL' && val) {
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
