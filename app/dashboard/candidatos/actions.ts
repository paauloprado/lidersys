'use server'

import { authorizeAdmin } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function createCandidate(formData: FormData) {
  await authorizeAdmin()
  const supabase = createServiceClient()

  const name = formData.get('name') as string
  const number = formData.get('number') as string
  const role = formData.get('role') as string
  const party = formData.get('party') as string

  if (!name || !number || !role) {
    return { error: 'Campos obrigatórios faltando' }
  }

  const { error } = await supabase
    .from('candidates')
    .insert([{ name, number, role, party }])

  if (error) {
    console.error('Error creating candidate:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/candidatos')
  return { success: true }
}

export async function deleteCandidate(id: string) {
  await authorizeAdmin()
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting candidate:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/candidatos')
  return { success: true }
}

export async function updateCandidate(formData: FormData) {
  await authorizeAdmin()
  const supabase = createServiceClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const number = formData.get('number') as string
  const role = formData.get('role') as string
  const party = formData.get('party') as string

  if (!id || !name || !number || !role) {
    return { error: 'Campos obrigatórios faltando' }
  }

  const { error } = await supabase
    .from('candidates')
    .update({ name, number, role, party })
    .eq('id', id)

  if (error) {
    console.error('Error updating candidate:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/candidatos')
  return { success: true }
}
