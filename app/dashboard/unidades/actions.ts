'use server'

import { authorizeAdmin } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function createUnidade(formData: FormData) {
  await authorizeAdmin()
  const supabase = createServiceClient()

  const name = formData.get('name')?.toString()
  const neighborhood = formData.get('neighborhood')?.toString()

  if (!name || !neighborhood) return { error: 'Campos obrigatórios faltando.' }

  const { data, error } = await supabase
    .from('voting_locations')
    .insert([{ name, neighborhood }])
    .select()

  if (error) {
    console.error('Error creating unidade:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/unidades')
  return { success: true, data }
}

export async function updateUnidade(formData: FormData) {
  await authorizeAdmin()
  const supabase = createServiceClient()

  const id = formData.get('id')?.toString()
  const name = formData.get('name')?.toString()
  const neighborhood = formData.get('neighborhood')?.toString()

  if (!id || !name || !neighborhood) return { error: 'Campos obrigatórios faltando.' }

  const { data, error } = await supabase
    .from('voting_locations')
    .update({ name, neighborhood })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating unidade:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/unidades')
  return { success: true, data }
}

export async function deleteUnidade(id: string) {
  await authorizeAdmin()
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('voting_locations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting unidade:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/unidades')
  return { success: true }
}
