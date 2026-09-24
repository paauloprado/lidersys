import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import UnidadesClient from './UnidadesClient'

// Bairros padrão para o select (já que eles são fixos, ou poderiam vir de uma tabela própria no futuro)
const BAIRROS_PARNAIBA = [
  'Alto Santa Maria', 'Bebedouro', 'Boa Esperanca', 'Broderville', 'Campestre', 
  'Canta Galo', 'Carmo', 'Catanduvas', 'Ceara', 'Centro', 'Conselheiro Alberto Silva', 
  'Dirceu Arcoverde', 'Do Carmo', 'Dom Rufino', 'Do Planalto', 'Floriopolis', 'Frei Higino', 
  'Guarita', 'Igaraçu', 'Ilha Grande De Santa Isabel', 'Joao Xxiii', 'Nossa Senhora de Fatima', 
  'Nossa Senhora do Carmo', 'Nova Parnaiba', 'Piauí', 'Planalto de Monteserra The', 'Primavera', 
  'Rodoviaria', 'Rosapolis', 'Santa Luzia', 'São Benedito', 'São Francisco da Guarita', 
  'Sao Jose', 'São Judas Tadeu', 'Sao Pedro', 'Sao Vicente de Paula'
]

async function UnidadesData() {
  const supabase = await createClient()

  // 1. Verifica sessão via cookie (auth client)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Usa service client para leituras
  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // 3. Busca as unidades eleitorais ordenadas pelo nome
  const { data: unidades } = await service
    .from('voting_locations')
    .select('*')
    .order('name', { ascending: true })

  return (
    <UnidadesClient 
      initialUnidades={unidades || []}
      bairros={BAIRROS_PARNAIBA}
      isAdmin={isAdmin}
    />
  )
}

function UnidadesSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-10 w-64 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-5 w-48 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-12 w-40 bg-brand-primary/20 rounded-xl"></div>
      </div>
      <div className="h-14 bg-slate-200 rounded-2xl w-full"></div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[400px]"></div>
    </div>
  )
}

export default function UnidadesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Suspense fallback={<UnidadesSkeleton />}>
        <UnidadesData />
      </Suspense>
    </div>
  )
}
