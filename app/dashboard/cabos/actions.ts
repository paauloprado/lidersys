'use server'

import { authorizeModule } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createCabo(formData: FormData) {
  try {
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
        const rows = JSON.parse(loteDataStr) as { neighborhood: string; voting_location: string; quantity: number }[]
        if (
          !Array.isArray(rows) ||
          rows.length === 0 ||
          rows.some((r) => !r || !Number.isInteger(r.quantity) || r.quantity < 1 || !r.neighborhood)
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

    revalidateTag('dashboard_metrics')
    revalidateTag('cabos')
    revalidatePath('/dashboard/cabos')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em createCabo:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao salvar cadastro.' }
  }
}

export async function deleteCabo(id: string) {
  try {
    if (!id) return { error: 'ID do registro não fornecido.' }
    const { user, profile } = await authorizeModule('cabos')
    const supabase = createServiceClient()

    // Se não for admin, valida se o registro pertence ao usuário
    if (profile.role !== 'admin') {
      const { data: existing, error: findError } = await supabase
        .from('cabos_ledger')
        .select('id, user_id')
        .eq('id', id)
        .maybeSingle()

      if (findError) {
        return { error: findError.message }
      }
      if (!existing) {
        return { error: 'Registro não encontrado ou já excluído.' }
      }
      if (existing.user_id !== user.id) {
        return { error: 'Você só pode excluir registros vinculados ao seu usuário.' }
      }
    }

    const { data, error } = await supabase
      .from('cabos_ledger')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error delete cabos_ledger:', error)
      return { error: error.message }
    }

    if (!data || data.length === 0) {
      return { error: 'Registro não encontrado ou já excluído.' }
    }

    revalidateTag('dashboard_metrics')
    revalidateTag('cabos')
    revalidatePath('/dashboard/cabos')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('Error em deleteCabo:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao excluir registro.' }
  }
}

export async function updateCabo(formData: FormData) {
  try {
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

    const { data, error } = await query.select()
    if (error) {
      console.error('Error update cabos_ledger:', error)
      return { error: error.message }
    }
    if (!data || data.length === 0) {
      return { error: 'Registro não encontrado para atualização.' }
    }

    revalidateTag('dashboard_metrics')
    revalidateTag('cabos')
    revalidatePath('/dashboard/cabos')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em updateCabo:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao atualizar registro.' }
  }
}
