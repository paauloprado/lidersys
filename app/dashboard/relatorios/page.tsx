import { getSessionUser, getSessionProfile } from '@/lib/supabase/authCache'
import { redirect, notFound } from 'next/navigation'
import { getRelatoriosData } from './actions'
import RelatoriosClient from './RelatoriosClient'

export const metadata = {
  title: 'Relatório de Votos | LiderSys',
  description: 'Análise quantitativa de votos por bairro, escola e cabo eleitoral.',
}

export default async function RelatoriosPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getSessionProfile(user.id)
  const modules = profile?.access_modules ?? []

  // Apenas admin sempre tem acesso; outros precisam do módulo 'relatorios'
  if (profile?.role !== 'admin' && !modules.includes('relatorios')) {
    notFound()
  }

  const data = await getRelatoriosData()

  return (
    <div className="w-full max-w-7xl mx-auto">
      <RelatoriosClient data={data} />
    </div>
  )
}
