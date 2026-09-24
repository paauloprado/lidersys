import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Users, UserCheck, Shield, Award, MapPin } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let accessModules: string[] = []
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role, access_modules').eq('id', user.id).maybeSingle()
    if (profile?.access_modules) {
      accessModules = profile.access_modules
    }
    if (profile?.role === 'admin') accessModules = ['dashboard', 'cabos', 'eleitores', 'candidatos', 'unidades', 'usuarios']
  }

  const allLinks = [
    { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'cabos', name: 'Cabo Eleitoral', href: '/dashboard/cabos', icon: UserCheck },
    { id: 'eleitores', name: 'Eleitores', href: '/dashboard/eleitores', icon: Users },
    { id: 'candidatos', name: 'Candidatos', href: '/dashboard/candidatos', icon: Award },
    { id: 'unidades', name: 'Unidades', href: '/dashboard/unidades', icon: MapPin },
    { id: 'usuarios', name: 'Usuários', href: '/dashboard/usuarios', icon: Shield },
  ]

  // Se o usuário não tiver nada definido, deixamos acessar o dashboard por segurança ou tudo dependendo da role
  // Aqui, só exibe o link se access_modules contiver o id do módulo. Admin costuma ter tudo.
  const links = allLinks.filter(link => accessModules.includes(link.id))

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50 md:flex">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <Image src="/assets/lidersyslogo_h.png" alt="LiderSys" width={130} height={36} className="object-contain" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {links.map(({ id, name, href, icon: Icon }) => <Link key={id} href={href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 hover:text-brand-primary"><Icon className="h-5 w-5 opacity-70" />{name}</Link>)}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs font-medium text-slate-400">LiderSys &copy; {new Date().getFullYear()}</div>
      </aside>
      <nav aria-label="Navegação principal" className="flex w-full shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
        {links.map(({ id, name, href, icon: Icon }) => <Link key={id} href={href} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Icon className="h-4 w-4" />{name}</Link>)}
      </nav>
    </>
  )
}
