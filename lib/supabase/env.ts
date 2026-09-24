/**
 * Utilitário centralizado para limpeza e validação de variáveis de ambiente do Supabase.
 * Previne falhas comuns no Vercel:
 * - Espaços em branco e aspas acidentais
 * - Nomes de variáveis colados junto ao valor (ex: KEY=valor)
 * - Barras finais e ausência de protocolo https://
 * - Suporta tanto a nomenclatura padrão (NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)
 *   quanto a nova nomenclatura do Supabase (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY).
 */

function cleanVal(c: string | undefined): string {
  if (!c) return ''
  let cleaned = c.trim().replace(/^["']|["']$/g, '')
  if (cleaned.includes('=') && !cleaned.startsWith('http')) {
    cleaned = cleaned.slice(cleaned.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')
  }
  return cleaned
}

function findValidKey(...candidates: (string | undefined)[]): string {
  // Prioriza chaves com formato oficial do Supabase (sb_publishable_, sb_secret_ ou eyJ)
  for (const c of candidates) {
    const cleaned = cleanVal(c)
    if (cleaned.startsWith('sb_publishable_') || cleaned.startsWith('sb_secret_') || cleaned.startsWith('eyJ')) {
      return cleaned
    }
  }
  // Fallback para qualquer candidato não vazio e não placeholder
  for (const c of candidates) {
    const cleaned = cleanVal(c)
    if (cleaned && !cleaned.includes('your-anon-key') && !cleaned.includes('your-project')) {
      return cleaned
    }
  }
  return ''
}

function findValidUrl(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    let cleaned = cleanVal(c)
    if (cleaned) {
      cleaned = cleaned.replace(/\/+$/, '')
      if (!cleaned.includes('your-project')) {
        if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
          cleaned = `https://${cleaned}`
        }
        return cleaned
      }
    }
  }
  return ''
}

export function getCleanEnv(key: string): string {
  if (key === 'NEXT_PUBLIC_SUPABASE_URL' || key === 'SUPABASE_URL') {
    return findValidUrl(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_URL
    )
  }

  if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' || key === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
    return findValidKey(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      process.env.SUPABASE_ANON_KEY,
      process.env.SUPABASE_PUBLISHABLE_KEY
    )
  }

  if (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'SUPABASE_SECRET_KEY') {
    const secret = findValidKey(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_SECRET_KEY
    )
    if (secret) return secret
    return findValidKey(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
  }

  return cleanVal(process.env[key])
}

export function getSupabaseEnv() {
  const url = getCleanEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getCleanEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const serviceKey = getCleanEnv('SUPABASE_SERVICE_ROLE_KEY') || anonKey
  return { url, anonKey, serviceKey }
}
