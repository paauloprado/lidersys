/**
 * Utilitário centralizado para limpeza e validação de variáveis de ambiente do Supabase.
 * Previne falhas comuns no Vercel:
 * - O usuário colar o nome da variável no campo de valor (ex: Key: NEXT_PUBLIC_..., Value: NEXT_PUBLIC_...)
 * - Espaços invisíveis / non-breaking spaces (\u00A0, \u200B)
 * - Nomes de variáveis colados junto ao valor (ex: KEY=valor)
 * - Aspas, quebras de linha e barras finais
 * - Suporta tanto a nomenclatura padrão (NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)
 *   quanto a nova nomenclatura do Supabase (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY).
 */

function extractSupabaseKey(str: string | undefined): string {
  if (!str) return ''
  const cleaned = str.replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u1680\u2000-\u200A\u205F\u3000]/g, ' ').trim()
  
  // Extrai o padrão oficial de chaves do Supabase
  const match = cleaned.match(/(sb_publishable_[A-Za-z0-9_-]+|sb_secret_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9._-]+)/)
  if (match) {
    return match[0]
  }

  // Se contiver apenas o nome da variável por engano, descarta
  if (cleaned.startsWith('NEXT_PUBLIC_') || cleaned.startsWith('SUPABASE_')) {
    let stripped = cleaned
    if (stripped.includes('=')) {
      stripped = stripped.slice(stripped.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')
      const subMatch = stripped.match(/(sb_publishable_[A-Za-z0-9_-]+|sb_secret_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9._-]+)/)
      if (subMatch) return subMatch[0]
    }
    // Se ainda for apenas nome de variável, retorna vazio para buscar nos outros candidatos
    if (stripped.startsWith('NEXT_PUBLIC_') || stripped.startsWith('SUPABASE_')) {
      return ''
    }
  }

  let fallback = cleaned.replace(/^["']|["']$/g, '')
  if (fallback.includes('=') && !fallback.startsWith('http')) {
    fallback = fallback.slice(fallback.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')
  }
  if (fallback.startsWith('NEXT_PUBLIC_') || fallback.startsWith('SUPABASE_')) {
    return ''
  }
  return fallback
}

function extractSupabaseUrl(str: string | undefined): string {
  if (!str) return ''
  const cleaned = str.replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u1680\u2000-\u200A\u205F\u3000]/g, ' ').trim()
  
  // Tenta extrair URL de projeto Supabase
  const match = cleaned.match(/https?:\/\/[a-z0-9.-]+\.supabase\.co/i)
  if (match) {
    return match[0].replace(/\/+$/, '')
  }

  let fallback = cleaned.replace(/^["']|["']$/g, '')
  if (fallback.includes('=')) {
    fallback = fallback.slice(fallback.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')
  }
  fallback = fallback.replace(/\/+$/, '')
  if (fallback.startsWith('NEXT_PUBLIC_') || fallback.startsWith('SUPABASE_')) {
    return ''
  }
  if (fallback && !fallback.startsWith('http://') && !fallback.startsWith('https://')) {
    fallback = `https://${fallback}`
  }
  return fallback
}

export function getCleanEnv(key: string): string {
  if (key === 'NEXT_PUBLIC_SUPABASE_URL' || key === 'SUPABASE_URL') {
    const candidates = [
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_URL
    ]
    for (const c of candidates) {
      const url = extractSupabaseUrl(c)
      if (url && !url.includes('your-project')) return url
    }
    return ''
  }

  if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' || key === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
    const candidates = [
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      process.env.SUPABASE_ANON_KEY,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_SECRET_KEY
    ]
    for (const c of candidates) {
      const k = extractSupabaseKey(c)
      if (k && !k.includes('your-anon-key')) return k
    }
    return ''
  }

  if (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'SUPABASE_SECRET_KEY') {
    const candidates = [
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_SECRET_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ]
    for (const c of candidates) {
      const k = extractSupabaseKey(c)
      if (k && !k.includes('your-anon-key') && !k.includes('your-service-role')) return k
    }
    return ''
  }

  const raw = process.env[key]
  if (!raw) return ''
  return raw.replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u1680\u2000-\u200A\u205F\u3000]/g, ' ').trim().replace(/^["']|["']$/g, '')
}

export function getSupabaseEnv() {
  const url = getCleanEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getCleanEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const serviceKey = getCleanEnv('SUPABASE_SERVICE_ROLE_KEY') || anonKey
  return { url, anonKey, serviceKey }
}
