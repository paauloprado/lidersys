import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/redefinir-senha'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Se o Supabase retornou um erro diretamente na URL do callback
  if (error || errorDescription) {
    console.error('Erro retornado pelo Supabase no callback de autenticação:', error, errorDescription)
    const errorMsg = errorDescription || error || 'Link de recuperação inválido ou expirado.'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`, { status: 303 })
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (!exchangeError) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        const targetUrl = isLocalEnv
          ? `${origin}${next}`
          : forwardedHost
            ? `https://${forwardedHost}${next}`
            : `${origin}${next}`

        return NextResponse.redirect(targetUrl, { status: 303 })
      }

      console.error('Erro ao trocar código por sessão:', exchangeError)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Link de recuperação expirado ou já utilizado. Por favor, solicite um novo.')}`,
        { status: 303 }
      )
    } catch (err) {
      console.error('Erro inesperado no callback de autenticação:', err)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Erro ao processar autenticação. Tente novamente.')}`,
        { status: 303 }
      )
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Código de autenticação ausente ou inválido.')}`,
    { status: 303 }
  )
}
