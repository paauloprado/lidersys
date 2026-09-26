import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getCleanEnv } from '@/lib/supabase/env'

function parseCookies(header: string | null | undefined): { name: string; value: string }[] {
  if (!header) return []
  return header
    .split(';')
    .map(c => c.trim())
    .filter(Boolean)
    .map(c => {
      const idx = c.indexOf('=')
      return {
        name: idx === -1 ? c : c.slice(0, idx),
        value: idx === -1 ? '' : decodeURIComponent(c.slice(idx + 1)),
      }
    })
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabaseUrl = getCleanEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getCleanEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const url = request.nextUrl ? request.nextUrl.clone() : new URL(request.url)
  const path = url.pathname

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            try {
              if (request?.cookies && typeof request.cookies.getAll === 'function') {
                return request.cookies.getAll()
              }
            } catch {}
            const cookieHeader = request?.headers?.get ? request.headers.get('cookie') : ''
            return parseCookies(cookieHeader)
          },
          setAll(cookiesToSet) {
            try {
              if (request?.cookies && typeof request.cookies.set === 'function') {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              }
            } catch {}
            try {
              cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
            } catch {}
          },
        },
      },
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      if (error) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      }
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', path)
      const redirectResponse = NextResponse.redirect(redirectUrl)

      // Propagate any cookies set or cleared by Supabase to the redirect response
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })

      if (error) {
        const reqCookies = request?.cookies && typeof request.cookies.getAll === 'function'
          ? request.cookies.getAll()
          : parseCookies(request?.headers?.get ? request.headers.get('cookie') : '')

        reqCookies.forEach(cookie => {
          if (cookie.name.includes('-auth-token')) {
            redirectResponse.cookies.set(cookie.name, '', { maxAge: 0, path: '/' })
          }
        })
        redirectResponse.cookies.set('lidersys_auth_meta', '', { maxAge: 0, path: '/' })
      }

      return redirectResponse
    }

    let userRole = ''
    let modules: string[] = []

    // 1. Tenta recuperar perfil do cookie rápido para evitar query ao banco no middleware
    const authMetaCookie = request.cookies.get('lidersys_auth_meta')?.value
    if (authMetaCookie) {
      try {
        const parsed = JSON.parse(Buffer.from(authMetaCookie, 'base64').toString('utf-8'))
        if (parsed.id === user.id && parsed.exp > Date.now()) {
          userRole = parsed.role
          modules = parsed.modules || []
        }
      } catch {}
    }

    // 2. Se não estiver no cache, busca no banco de dados e salva no cookie por 5 minutos
    if (!userRole) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, access_modules')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }

      userRole = profile.role
      modules = userRole === 'admin'
        ? ['dashboard', 'cabos', 'eleitores', 'candidatos', 'unidades', 'relatorios', 'usuarios']
        : profile.access_modules ?? []

      const metaPayload = Buffer.from(
        JSON.stringify({
          id: user.id,
          role: userRole,
          modules,
          exp: Date.now() + 5 * 60 * 1000,
        })
      ).toString('base64')

      response.cookies.set('lidersys_auth_meta', metaPayload, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 300,
      })
    }

    const requiredModule = path === '/dashboard' ? 'dashboard'
      : path.startsWith('/dashboard/cabos') ? 'cabos'
      : path.startsWith('/dashboard/eleitores') ? 'eleitores'
      : path.startsWith('/dashboard/candidatos') ? 'candidatos'
      : path.startsWith('/dashboard/unidades') ? 'unidades'
      : path.startsWith('/dashboard/relatorios') ? 'relatorios'
      : path.startsWith('/dashboard/usuarios') ? 'usuarios'
      : null

    if (!requiredModule || !modules.includes(requiredModule)) {
      return new NextResponse('Acesso não autorizado', { status: 403 })
    }
  } catch (err) {
    console.error('Middleware execution error:', err)
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', path)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    const reqCookies = request?.cookies && typeof request.cookies.getAll === 'function'
      ? request.cookies.getAll()
      : parseCookies(request?.headers?.get ? request.headers.get('cookie') : '')

    reqCookies.forEach(cookie => {
      if (cookie.name.includes('-auth-token')) {
        redirectResponse.cookies.set(cookie.name, '', { maxAge: 0, path: '/' })
      }
    })
    return redirectResponse
  }

  return response
}

export default middleware
export const config = { matcher: ['/dashboard/:path*'] }
