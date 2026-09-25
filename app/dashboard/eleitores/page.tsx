import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import EleitoresClient from './EleitoresClient'

async function EleitoresData() {
  const supabase = await createClient()

  // 1. Verifica sessão via cookie
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  // 2. Executa queries em paralelo para carregamento instantâneo
  const [votersRes, locationsRes, bairrosRes] = await Promise.all([
    service.from('voters_ledger').select('*').order('created_at', { ascending: false }),
    service.from('voting_locations').select('*').order('name', { ascending: true }),
    service.from('neighborhoods').select('name').order('name', { ascending: true }),
  ])

  const BAIRROS_PARNAIBA = [
    'Alto Santa Maria', 'Area Rural de Parnaiba', 'Bebedouro', 'Boa Esperanca', 'Campos', 
    'Cantagalo', 'Catanduvas', 'Ceara', 'Centro', 'Conselheiro Alberto Silva', 
    'Dirceu Arcoverde', 'Floriopolis', 'Frei Higino', 'Igaracu', 'João XXIII', 
    'Mendonca Clark', 'Nossa Senhora de Fatima', 'Nossa Senhora do Carmo', 'Nova Parnaíba', 
    'Piauí', 'Pindorama', 'Planalto', 'Planalto de Monteserra The', 'Primavera', 
    'Reis Veloso', 'Rodoviária', 'Sabiazal', 'Santa Isabel', 'Santa Luzia', 
    'São Benedito', 'São Francisco da Guarita', 'Sao Jose', 'São Judas Tadeu', 
    'Sao Pedro', 'Sao Vicente de Paula'
  ]
  const bairrosDb = (bairrosRes.data || []).map((b: { name: string }) => b.name)
  const combinedBairros = Array.from(new Set([...BAIRROS_PARNAIBA, ...bairrosDb])).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  )

  return (
    <EleitoresClient
      initialVoters={votersRes.data || []}
      votingLocations={locationsRes.data || []}
      bairros={combinedBairros}
    />
  )
}

function EleitoresSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200">
        <div>
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-36 bg-brand-primary/20 rounded-xl"></div>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 p-6 h-80"></div>
    </div>
  )
}

export default function EleitoresPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Suspense fallback={<EleitoresSkeleton />}>
        <EleitoresData />
      </Suspense>
    </div>
  )
}
