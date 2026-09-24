import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = String(formData.get('email'))
    const password = String(formData.get('password'))

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Erro de login no Supabase:', error.message)
      const url = new URL(request.url)
      url.pathname = '/login'
      // Passa a mensagem de erro real para a URL
      url.searchParams.set('error', error.message)
      return NextResponse.redirect(url, { status: 303 })
    }

    const url = new URL(request.url)
    url.pathname = '/dashboard'
    return NextResponse.redirect(url, { status: 303 })
  } catch (err) {
    console.error('Erro interno na rota de login:', err)
    const url = new URL(request.url)
    url.pathname = '/login'
    url.searchParams.set('error', 'Erro interno no servidor')
    return NextResponse.redirect(url, { status: 303 })
  }
}
