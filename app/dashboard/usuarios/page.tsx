import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound, redirect } from 'next/navigation'
import UserManagementClient from './UserManagementClient'

async function UsersData() {
  const supabase = await createClient()

  // 1. Verifica sessão
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  // 2. Busca perfil e lista de perfis simultaneamente com service client
  const [profileRes, profilesRes] = await Promise.all([
    service.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    service.from('profiles').select('*').order('created_at', { ascending: false }),
  ])

  if (profileRes.data?.role !== 'admin') notFound()

  const profiles = profilesRes.data || []
  const lideres = profiles.filter((p) => p.role !== 'liderado')

  return (
    <UserManagementClient 
      initialProfiles={profiles} 
      lideres={lideres}
    />
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200">
        <div>
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
        <div className="h-14 bg-slate-50 border-b border-slate-200"></div>
        <div className="p-6 space-y-4">
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Suspense fallback={<TableSkeleton />}>
        <UsersData />
      </Suspense>
    </div>
  )
}
