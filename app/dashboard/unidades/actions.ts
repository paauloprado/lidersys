'use server'

import { authorizeModule } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function createUnidade(formData: FormData) {
  try {
    await authorizeModule('unidades')
    const supabase = createServiceClient()

    const name = String(formData.get('name') || '').trim()
    const neighborhood = String(formData.get('neighborhood') || '').trim()

    if (!name || !neighborhood) {
      return { error: 'Nome e Bairro são obrigatórios.' }
    }

    const { data, error } = await supabase
      .from('voting_locations')
      .insert({
        name,
        neighborhood,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating unidade:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/unidades')
    return { success: true, data }
  } catch (err: unknown) {
    console.error('Erro em createUnidade:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao cadastrar unidade.' }
  }
}

export async function updateUnidade(formData: FormData) {
  try {
    await authorizeModule('unidades')
    const supabase = createServiceClient()

    const id = String(formData.get('id') || '').trim()
    const name = String(formData.get('name') || '').trim()
    const neighborhood = String(formData.get('neighborhood') || '').trim()

    if (!id || !name || !neighborhood) {
      return { error: 'ID, Nome e Bairro são obrigatórios.' }
    }

    const { data, error } = await supabase
      .from('voting_locations')
      .update({
        name,
        neighborhood,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating unidade:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/unidades')
    return { success: true, data }
  } catch (err: unknown) {
    console.error('Erro em updateUnidade:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao atualizar unidade.' }
  }
}

export async function deleteUnidade(id: string) {
  try {
    if (!id) return { error: 'ID não fornecido.' }
    await authorizeModule('unidades')
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('voting_locations')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error deleting unidade:', error)
      return { error: error.message }
    }

    if (!data || data.length === 0) {
      return { error: 'Unidade não encontrada ou já excluída.' }
    }

    revalidatePath('/dashboard/unidades')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em deleteUnidade:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao excluir unidade.' }
  }
}
