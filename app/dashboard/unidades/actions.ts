'use server'

import { authorizeAdmin } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function createUnidade(formData: FormData) {
  try {
    await authorizeAdmin()
    const supabase = createServiceClient()

    const name = formData.get('name') as string
    const neighborhood = formData.get('neighborhood') as string
    const address = (formData.get('address') as string) || null

    if (!name || !neighborhood) {
      return { error: 'Nome e Bairro são obrigatórios.' }
    }

    const { data, error } = await supabase
      .from('voting_locations')
      .insert({
        name,
        neighborhood,
        address,
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
    await authorizeAdmin()
    const supabase = createServiceClient()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const neighborhood = formData.get('neighborhood') as string
    const address = (formData.get('address') as string) || null

    if (!id || !name || !neighborhood) {
      return { error: 'ID, Nome e Bairro são obrigatórios.' }
    }

    const { data, error } = await supabase
      .from('voting_locations')
      .update({
        name,
        neighborhood,
        address,
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
    await authorizeAdmin()
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
