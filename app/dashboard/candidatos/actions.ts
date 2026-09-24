'use server'

import { authorizeAdmin } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function createCandidate(formData: FormData) {
  try {
    await authorizeAdmin()
    const supabase = createServiceClient()

    const name = formData.get('name') as string
    const number = formData.get('number') as string
    const role = formData.get('role') as string
    const party = formData.get('party') as string

    if (!name || !number || !role) {
      return { error: 'Nome, número e cargo são obrigatórios.' }
    }

    const { error } = await supabase.from('candidates').insert({
      name,
      number,
      role,
      party: party || null,
    })

    if (error) {
      console.error('Error creating candidate:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/candidatos')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em createCandidate:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao cadastrar candidato.' }
  }
}

export async function deleteCandidate(id: string) {
  try {
    if (!id) return { error: 'ID não fornecido.' }
    await authorizeAdmin()
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error deleting candidate:', error)
      return { error: error.message }
    }

    if (!data || data.length === 0) {
      return { error: 'Candidato não encontrado ou já excluído.' }
    }

    revalidatePath('/dashboard/candidatos')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em deleteCandidate:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao excluir candidato.' }
  }
}

export async function updateCandidate(formData: FormData) {
  try {
    await authorizeAdmin()
    const supabase = createServiceClient()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const number = formData.get('number') as string
    const role = formData.get('role') as string
    const party = formData.get('party') as string

    if (!id || !name || !number || !role) {
      return { error: 'Dados obrigatórios ausentes.' }
    }

    const { data, error } = await supabase
      .from('candidates')
      .update({
        name,
        number,
        role,
        party: party || null,
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating candidate:', error)
      return { error: error.message }
    }

    if (!data || data.length === 0) {
      return { error: 'Candidato não encontrado para atualização.' }
    }

    revalidatePath('/dashboard/candidatos')
    return { success: true }
  } catch (err: unknown) {
    console.error('Erro em updateCandidate:', err)
    return { error: err instanceof Error ? err.message : 'Falha ao atualizar candidato.' }
  }
}
