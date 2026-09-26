'use server'

import { authorizeModule } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createEleitor(formData: FormData) {
  try {
    const { user } = await authorizeModule('eleitores')
    const supabase = createServiceClient()

    const type = formData.get('type') as string
    const name = (formData.get('name') as string) || 'Registro em Lote'
    const quantity = parseInt((formData.get('quantity') as string) || '1')
    const phone = (formData.get('phone') as string) || null
    const neighborhood = (formData.get('neighborhood') as string) || null
    const voting_location = (formData.get('voting_location') as string) || null

    const { error } = await supabase.from('voters_ledger').insert({
      type,
      name,
      quantity,
      phone,
      neighborhood,
      voting_location,
      lideranca_id: user.id,
    })

    if (error) {
      console.error('Error creating eleitor:', error)
      return { error: error.message }
    }

    revalidateTag('dashboard_metrics')
    revalidateTag('eleitores')
    revalidatePath('/dashboard/eleitores')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em createEleitor:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao cadastrar eleitor.' }
  }
}

export async function deleteEleitor(id: string) {
  try {
    if (!id) return { error: 'ID não fornecido.' }
    const { user, profile } = await authorizeModule('eleitores')
    const supabase = createServiceClient()

    if (profile.role !== 'admin') {
      const { data: existing, error: findError } = await supabase
        .from('voters_ledger')
        .select('id, lideranca_id')
        .eq('id', id)
        .maybeSingle()

      if (findError) return { error: findError.message }
      if (!existing) return { error: 'Registro não encontrado ou já excluído.' }
      if (existing.lideranca_id !== user.id) {
        return { error: 'Você só pode excluir eleitores cadastrados por você.' }
      }
    }

    const { data, error } = await supabase
      .from('voters_ledger')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error deleting eleitor:', error)
      return { error: error.message }
    }

    if (!data || data.length === 0) {
      return { error: 'Registro não encontrado ou já excluído.' }
    }

    revalidateTag('dashboard_metrics')
    revalidateTag('eleitores')
    revalidatePath('/dashboard/eleitores')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em deleteEleitor:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao excluir eleitor.' }
  }
}

export async function updateEleitor(formData: FormData) {
  try {
    const { user, profile } = await authorizeModule('eleitores')
    const supabase = createServiceClient()

    const id = formData.get('id') as string
    if (!id) return { error: 'ID não fornecido.' }

    const type = formData.get('type') as string
    const name = (formData.get('name') as string) || 'Registro em Lote'
    const quantity = parseInt((formData.get('quantity') as string) || '1')
    const phone = (formData.get('phone') as string) || null
    const neighborhood = (formData.get('neighborhood') as string) || null
    const voting_location = (formData.get('voting_location') as string) || null

    const query = supabase
      .from('voters_ledger')
      .update({
        type,
        name,
        quantity,
        phone,
        neighborhood,
        voting_location,
      })
      .eq('id', id)

    if (profile.role !== 'admin') {
      query.eq('lideranca_id', user.id)
    }

    const { data, error } = await query.select()
    if (error) {
      console.error('Error updating eleitor:', error)
      return { error: error.message }
    }
    if (!data || data.length === 0) {
      return { error: 'Registro não encontrado para atualização.' }
    }

    revalidateTag('dashboard_metrics')
    revalidateTag('eleitores')
    revalidatePath('/dashboard/eleitores')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em updateEleitor:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao atualizar eleitor.' }
  }
}
