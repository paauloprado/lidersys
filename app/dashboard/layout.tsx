import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { NavProvider } from '@/components/ui/NavContext'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Busca dados de perfil usando serviceClient para maior velocidade e sem bloqueio RLS
  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('id, full_name, role, access_modules')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || 'lideranca'
  let accessModules = profile?.access_modules || []
  if (role === 'admin') {
    accessModules = ['dashboard', 'cabos', 'eleitores', 'candidatos', 'unidades', 'usuarios']
  }

  const userName = profile?.full_name || user.email || 'Usuário'

  return (
    <NavProvider>
      <div className="flex min-h-dvh w-full flex-col overflow-hidden bg-slate-50 md:h-dvh md:flex-row">
        <Sidebar accessModules={accessModules} userName={userName} userRole={role} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar userName={userName} userRole={role} />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </NavProvider>
  )
}
