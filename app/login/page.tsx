import { createClient } from '@/lib/supabase/server'
import { getCleanEnv } from '@/lib/supabase/env'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { LoginForm } from '@/components/modules/auth/LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined
  const errorParam = typeof searchParams?.error === 'string' ? searchParams.error : undefined
  const messageParam = typeof searchParams?.message === 'string' ? searchParams.message : undefined
  const supabaseUrl = getCleanEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getCleanEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        redirect('/dashboard')
      }
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'digest' in e &&
        typeof (e as { digest: unknown }).digest === 'string' &&
        (e as { digest: string }).digest.startsWith('NEXT_REDIRECT')
      ) {
        throw e
      }
      console.error('Session check error in login page:', e)
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      {/* Lado Esquerdo - Branding (Escondido em telas menores) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-dark p-12 text-white relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="mb-16 relative w-fit">
            {/* Glow branco animado para dar contraste na logo preta/azul no fundo escuro */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[160%] bg-white blur-[35px] rounded-full animate-pulse z-0 pointer-events-none"></div>
            <Image src="/assets/lidersyslogo_h.png" alt="LiderSys" width={200} height={60} className="object-contain relative z-10 drop-shadow-sm" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6 tracking-tight">
            Gestão inteligente para sua campanha eleitoral.
          </h1>
          <p className="text-white/80 text-lg max-w-md leading-relaxed font-medium">
            Organize suas lideranças, acompanhe metas em tempo real e consolide sua base de eleitores com segurança e eficiência.
          </p>
        </div>
        
        <div className="relative z-10 text-sm font-medium text-white/50">
          &copy; {new Date().getFullYear()} LiderSys. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        {/* Decoração sutil no fundo para mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 -z-10"></div>

        <div className="w-full max-w-md">
          {/* Logo para mobile */}
          <div className="flex lg:hidden justify-center mb-12">
            <Image src="/assets/lidersyslogo_h.png" alt="LiderSys" width={180} height={50} className="object-contain drop-shadow-md" />
          </div>

          <div className="mb-10 lg:text-left text-center">
            <h2 className="text-3xl font-black text-brand-dark tracking-tight mb-2">Bem-vindo de volta</h2>
            <p className="text-slate-500 font-medium">Insira suas credenciais para acessar o painel.</p>
          </div>

          <LoginForm initialError={errorParam} initialMessage={messageParam} />
        </div>
      </div>
    </div>
  )
}
