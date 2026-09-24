import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import UserManagementClient from './UserManagementClient'

// Componente assíncrono que busca os dados
async function UsersData() {
  const supabase = await createClient()

  // 1. Verifica sessão
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Verifica se é Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') notFound()



  // 3. Busca todos os perfis
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const lideres = profiles?.filter(p => p.role !== 'liderado') || []

  return (
    <UserManagementClient 
      initialProfiles={profiles || []} 
      lideres={lideres}
    />
  )
}

// Skeleton que aparece instantaneamente
function TableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
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

// A página principal exporta apenas a casca com o Suspense
export default function UsuariosPage() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <Suspense fallback={<TableSkeleton />}>
        <UsersData />
      </Suspense>
    </div>
  )
}
