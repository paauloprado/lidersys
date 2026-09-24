import Image from 'next/image'
import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/modules/auth/ResetPasswordForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Redefinir Senha | LiderSys',
  description: 'Defina uma nova senha para sua conta na plataforma LiderSys.',
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      {/* Lado Esquerdo - Branding (Visível em desktop lg:flex) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-dark p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="mb-16 relative w-fit">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[160%] bg-white blur-[35px] rounded-full animate-pulse z-0 pointer-events-none"></div>
            <Image
              src="/assets/lidersyslogo_h.png"
              alt="LiderSys"
              width={200}
              height={60}
              className="object-contain relative z-10 drop-shadow-sm"
              priority
            />
          </div>

          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6 tracking-tight">
            Defina sua nova senha de acesso.
          </h1>
          <p className="text-white/80 text-lg max-w-md leading-relaxed font-medium">
            Escolha uma senha forte com no mínimo 6 caracteres para manter seus dados de campanha protegidos.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-white/50">
          &copy; {new Date().getFullYear()} LiderSys. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 -z-10"></div>

        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center mb-10">
            <Image
              src="/assets/lidersyslogo_h.png"
              alt="LiderSys"
              width={180}
              height={50}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>

          <div className="mb-8 lg:text-left text-center">
            <h2 className="text-3xl font-black text-brand-dark tracking-tight mb-2">Criar nova senha</h2>
            <p className="text-slate-500 font-medium">
              Digite e confirme sua nova senha abaixo.
            </p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
