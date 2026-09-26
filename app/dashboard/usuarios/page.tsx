import { createServiceClient } from '@/lib/supabase/service'
import { getSessionUser, getSessionProfile } from '@/lib/supabase/authCache'
import { notFound, redirect } from 'next/navigation'
import UserManagementClient from './UserManagementClient'

export default async function UsersPage() {
  // 1. Obtém sessão e perfil em memória via React.cache()
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getSessionProfile(user.id)
  if (profile?.role !== 'admin') notFound()

  // 2. Busca lista de perfis
  const service = createServiceClient()
  const { data: profiles } = await service
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const profilesList = profiles || []
  const lideres = profilesList.filter((p) => p.role !== 'liderado')

  return (
    <div className="w-full max-w-7xl mx-auto">
      <UserManagementClient 
        initialProfiles={profilesList} 
        lideres={lideres}
      />
    </div>
  )
}
