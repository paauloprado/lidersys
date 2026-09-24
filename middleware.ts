import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server.js'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      },
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname
    const isPublicRoute = path === '/' || path === '/login' || path === '/auth/login'

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }

    if (user && (path === '/login' || path.startsWith('/dashboard'))) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, access_modules')
        .eq('id', user.id)
        .maybeSingle()

      const modules: string[] = profile?.role === 'admin' ? ['dashboard', 'cabos', 'eleitores', 'candidatos', 'unidades', 'usuarios'] : profile?.access_modules ?? []
      if (path === '/login') {
        const firstModule = modules.includes('dashboard') ? 'dashboard' : modules[0]
        if (!firstModule) return new NextResponse('Acesso não autorizado', { status: 403 })
        const url = request.nextUrl.clone()
        url.pathname = firstModule === 'dashboard' ? '/dashboard' : `/dashboard/${firstModule}`
        return NextResponse.redirect(url)
      }

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
    }
  } catch (err) {
    console.error('Middleware execution error:', err)
  }

  return response
}

export default middleware
export const config = { matcher: ['/dashboard/:path*', '/login'] }
