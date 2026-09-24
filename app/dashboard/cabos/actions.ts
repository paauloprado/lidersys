'use server'

import { authorizeModule } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function createCabo(formData: FormData) {
  // authorizeModule valida sessão e permissão — se passar, usamos o service client
  const { user } = await authorizeModule('cabos')

  const type = formData.get('type') as 'lote' | 'individual'
  const cabo_id = formData.get('cabo_id') as string
  const supabase = createServiceClient()

  type CaboPayload = {
    user_id: string
    type: 'lote' | 'individual'
    neighborhood: string | null
    voting_location: string | null
    quantity?: number
    name?: string | null
    phone?: string | null
  }
  let payloads: CaboPayload[] = []

  if (type === 'lote') {
    const loteDataStr = formData.get('lote_data') as string
    if (loteDataStr) {
      // Criação de múltiplos lotes
      const rows = JSON.parse(loteDataStr) as { neighborhood: string; voting_location: string; quantity: number }[]
      if (
        !Array.isArray(rows) ||
        rows.length === 0 ||
        rows.some(
          (r) => !r || !Number.isInteger(r.quantity) || r.quantity < 1 || !r.neighborhood
        )
      ) {
        return { error: 'Dados de lote inválidos: bairro e quantidade são obrigatórios em todas as linhas.' }
      }
      payloads = rows.map((r) => ({
        user_id: cabo_id || user.id,
        type: 'lote',
        neighborhood: r.neighborhood || null,
        voting_location: r.voting_location || null,
        quantity: r.quantity,
      }))
    } else {
      // Edição de um único lote (modo edição)
      const neighborhood = formData.get('neighborhood') as string
      if (!neighborhood) return { error: 'Bairro é obrigatório.' }
      payloads = [
        {
          user_id: cabo_id || user.id,
          type: 'lote',
          neighborhood,
          voting_location: (formData.get('voting_location') as string) || null,
          quantity: parseInt(formData.get('quantity') as string) || 1,
        },
      ]
    }
  } else {
    // Ficha Individual
    const name = formData.get('name') as string
    if (!name) return { error: 'O nome é obrigatório.' }
    payloads = [
      {
        user_id: cabo_id || user.id,
        type: 'individual',
        neighborhood: (formData.get('neighborhood') as string) || null,
        voting_location: (formData.get('voting_location') as string) || null,
        name,
        phone: (formData.get('phone') as string) || null,
      },
    ]
  }

  const { error } = await supabase.from('cabos_ledger').insert(payloads)

  if (error) {
    console.error('Error insert cabos_ledger:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/cabos')
  return { success: true }
}

export async function deleteCabo(id: string) {
  const { user, profile } = await authorizeModule('cabos')
  const supabase = createServiceClient()

  // Garante que apenas o dono ou admin pode deletar
  const query = supabase.from('cabos_ledger').delete().eq('id', id)
  if (profile.role !== 'admin') {
    query.eq('user_id', user.id)
  }

  const { error } = await query

  if (error) {
    console.error('Error delete cabos_ledger:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/cabos')
  return { success: true }
}

export async function updateCabo(formData: FormData) {
  const { user, profile } = await authorizeModule('cabos')

  const id = formData.get('id') as string
  if (!id) return { error: 'ID não fornecido.' }

  const type = formData.get('type') as 'lote' | 'individual'
  const cabo_id = formData.get('cabo_id') as string
  const neighborhood = formData.get('neighborhood') as string
  const voting_location = formData.get('voting_location') as string
  const supabase = createServiceClient()

  const payload: {
    user_id: string
    neighborhood: string | null
    voting_location: string | null
    quantity?: number
    name?: string | null
    phone?: string | null
  } = {
    user_id: cabo_id || user.id,
    neighborhood: neighborhood || null,
    voting_location: voting_location || null,
  }

  if (type === 'lote') {
    if (!neighborhood) return { error: 'Bairro é obrigatório.' }
    payload.quantity = parseInt(formData.get('quantity') as string) || 1
  } else {
    const name = formData.get('name') as string
    if (!name) return { error: 'O nome é obrigatório.' }
    payload.name = name
    payload.phone = (formData.get('phone') as string) || null
  }

  // Garante que apenas o dono ou admin pode editar
  const query = supabase.from('cabos_ledger').update(payload).eq('id', id)
  if (profile.role !== 'admin') {
    query.eq('user_id', user.id)
  }

  const { error } = await query

  if (error) {
    console.error('Error update cabos_ledger:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/cabos')
  return { success: true }
}
