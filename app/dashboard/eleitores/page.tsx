import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import EleitoresClient from './EleitoresClient'

// Componente assíncrono que busca os dados
async function EleitoresData() {
  const supabase = await createClient()

  // 1. Verifica sessão via cookie (auth client)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Usa service client para leituras (evita bloqueio por RLS)
  const service = createServiceClient()

  const { data: voters } = await service
    .from('voters_ledger')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: voting_locations } = await service
    .from('voting_locations')
    .select('*')
    .order('name', { ascending: true })

  return (
    <EleitoresClient 
      initialVoters={voters || []} 
      votingLocations={voting_locations || []}
    />
  )
}

// Skeleton para carregamento rápido
function EleitoresSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-10 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-5 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-40 bg-slate-200 rounded-xl"></div>
          <div className="h-12 w-40 bg-brand-primary/20 rounded-xl"></div>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[400px]">
        <div className="h-16 bg-slate-50 border-b border-slate-100"></div>
        <div className="p-6 space-y-4">
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

// Exporta apenas o componente com Suspense
export default function EleitoresPage() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <Suspense fallback={<EleitoresSkeleton />}>
        <EleitoresData />
      </Suspense>
    </div>
  )
}
