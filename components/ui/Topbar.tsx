'use client'

import { LogOut, Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNav } from './NavContext'

interface TopbarProps {
  userName?: string
  userRole?: string
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Painel Geral',
  '/dashboard/cabos': 'Gestão de Cabos Eleitorais',
  '/dashboard/eleitores': 'Gestão de Eleitores',
  '/dashboard/candidatos': 'Candidatos Apoiados',
  '/dashboard/unidades': 'Unidades Eleitorais',
  '/dashboard/usuarios': 'Gestão de Usuários',
}

export function Topbar({ userName = 'Usuário', userRole = 'admin' }: TopbarProps) {
  const { toggleMobile } = useNav()
  const pathname = usePathname()

  const currentTitle = routeTitles[pathname] || 'Painel de Controle'

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    lider: 'Líder',
    lideranca: 'Liderança',
    liderado: 'Liderado',
  }

  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs">
      {/* Esquerda: Botão Hambúrguer no Mobile + Título no Desktop */}
      <div className="flex items-center gap-3">
        {/* Botão Hambúrguer Mobile */}
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Abrir menu de navegação lateral"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo visível no Mobile quando sidebar fechada */}
        <Link href="/dashboard" className="flex items-center md:hidden">
          <Image
            src="/assets/lidersyslogo_h.png"
            alt="LiderSys"
            width={105}
            height={28}
            className="object-contain"
          />
        </Link>

        {/* Título de Página visível em telas maiores */}
        <div className="hidden md:block">
          <h1 className="text-lg font-black text-brand-dark tracking-tight">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Direita: Perfil do Usuário e Botão de Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Badge do Usuário */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 sm:px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary text-white text-xs font-black shadow-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-brand-dark truncate max-w-[130px] leading-tight">
              {userName}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 leading-tight">
              {roleLabels[userRole] || userRole}
            </p>
          </div>
        </div>

        {/* Botão de Logout */}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            title="Sair da plataforma"
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-brand-red hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </form>
      </div>
    </header>
  )
}
