import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', path)
      return NextResponse.redirect(redirectUrl)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, access_modules')
      .eq('id', user.id)
      .maybeSingle()

    const modules: string[] = profile?.role === 'admin'
      ? ['dashboard', 'cabos', 'eleitores', 'candidatos', 'unidades', 'usuarios']
      : profile?.access_modules ?? []

    const requiredModule = path === '/dashboard' ? 'dashboard'
      : path.startsWith('/dashboard/cabos') ? 'cabos'
      : path.startsWith('/dashboard/eleitores') ? 'eleitores'
      : path.startsWith('/dashboard/candidatos') ? 'candidatos'
      : path.startsWith('/dashboard/unidades') ? 'unidades'
      : path.startsWith('/dashboard/usuarios') ? 'usuarios'
      : null

    if (!profile || !requiredModule || !modules.includes(requiredModule)) {
      return new NextResponse('Acesso não autorizado', { status: 403 })
    }
  } catch (err) {
    console.error('Middleware execution error:', err)
  }

  return response
}

export default middleware
export const config = { matcher: ['/dashboard/:path*'] }
