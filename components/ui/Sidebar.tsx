'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  Award,
  MapPin,
  BarChart3,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useNav } from './NavContext'

interface SidebarProps {
  accessModules?: string[]
  userName?: string
  userRole?: string
}

const allLinks = [
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'cabos', name: 'Cabo Eleitoral', href: '/dashboard/cabos', icon: UserCheck },
  { id: 'eleitores', name: 'Eleitores', href: '/dashboard/eleitores', icon: Users },
  { id: 'candidatos', name: 'Candidatos', href: '/dashboard/candidatos', icon: Award },
  { id: 'unidades', name: 'Unidades', href: '/dashboard/unidades', icon: MapPin },
  { id: 'relatorios', name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { id: 'usuarios', name: 'Usuários', href: '/dashboard/usuarios', icon: Shield },
]

export function Sidebar({
  accessModules = ['dashboard', 'cabos', 'eleitores', 'candidatos', 'unidades', 'usuarios'],
  userName = 'Usuário',
  userRole = 'admin',
}: SidebarProps) {
  const pathname = usePathname()
  const { isMobileOpen, closeMobile } = useNav()

  const links = allLinks.filter((link) => accessModules.includes(link.id))

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    lider: 'Líder',
    lideranca: 'Cabo / Liderança',
    liderado: 'Liderado',
  }

  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-red-50 text-red-700 border-red-200',
    lider: 'bg-blue-50 text-blue-700 border-blue-200',
    lideranca: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    liderado: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <>
      {/* ============================================================== */}
      {/* 1. SIDEBAR DESKTOP (Fixa na lateral para telas md+)             */}
      {/* ============================================================== */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/assets/lidersyslogo_h.png"
              alt="LiderSys"
              width={130}
              height={36}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Links de Navegação Desktop */}
        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5 overflow-y-auto">
          {links.map(({ id, name, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={id}
                href={href}
                prefetch={true}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-brand-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-75" />}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé Desktop */}
        <div className="border-t border-slate-200 p-4 text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>LiderSys &copy; {new Date().getFullYear()}</span>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">v1.2</span>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MENU HAMBÚRGUER LATERAL MOBILE (Slide-over Drawer)          */}
      {/* ============================================================== */}
      {/* Backdrop com blur escurecido */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer Deslizante Lateral */}
      <aside
        aria-label="Menu lateral de navegação"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Topo do Drawer: Logo + Botão Fechar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 bg-slate-50/50">
          <Link href="/dashboard" onClick={closeMobile} className="flex items-center">
            <Image
              src="/assets/lidersyslogo_h.png"
              alt="LiderSys"
              width={120}
              height={32}
              className="object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Fechar menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Card do Usuário Logado */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white font-black text-lg shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-brand-dark">{userName}</p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 text-[11px] font-bold rounded-md border ${
                  roleBadgeColors[userRole] || roleBadgeColors.liderado
                }`}
              >
                {roleLabels[userRole] || userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Links de Navegação Mobile */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
            Navegação
          </div>
          {links.map(({ id, name, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={id}
                href={href}
                prefetch={true}
                onClick={closeMobile}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                    : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-80" />}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé Mobile com Botão de Sair */}
        <div className="border-t border-slate-200 p-4 bg-slate-50/50 space-y-3">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-brand-red px-4 py-3 text-sm font-bold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair da Plataforma
            </button>
          </form>
          <p className="text-center text-[11px] font-medium text-slate-400">
            LiderSys &copy; {new Date().getFullYear()} &bull; Painel Eleitoral
          </p>
        </div>
      </aside>
    </>
  )
}
