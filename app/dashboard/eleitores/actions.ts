'use server'

import { authorizeModule } from '@/lib/supabase/authorization'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function createEleitor(formData: FormData) {
  const { user } = await authorizeModule('eleitores')
  const supabase = createServiceClient()

  const type = formData.get('type') as string
  const name = formData.get('name') as string || 'Registro em Lote'
  const quantity = parseInt(formData.get('quantity') as string || '1')
  const phone = formData.get('phone') as string || null
  const neighborhood = formData.get('neighborhood') as string || null
  const voting_location = formData.get('voting_location') as string || null
  
  const { error } = await supabase.from('voters_ledger').insert({
    type,
    name,
    quantity,
    phone,
    neighborhood,
    voting_location,
    lideranca_id: user.id
  })

  if (error) {
    console.error('Error creating eleitor:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/eleitores')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteEleitor(id: string) {
  const { user, profile } = await authorizeModule('eleitores')
  const supabase = createServiceClient()
  
  const query = supabase.from('voters_ledger').delete().eq('id', id)
  if (profile.role !== 'admin') {
    query.eq('lideranca_id', user.id)
  }
  
  const { error } = await query
  if (error) {
    console.error('Error deleting eleitor:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/eleitores')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateEleitor(formData: FormData) {
  const { user, profile } = await authorizeModule('eleitores')
  const supabase = createServiceClient()

  const id = formData.get('id') as string
  const type = formData.get('type') as string
  const name = formData.get('name') as string || 'Registro em Lote'
  const quantity = parseInt(formData.get('quantity') as string || '1')
  const phone = formData.get('phone') as string || null
  const neighborhood = formData.get('neighborhood') as string || null
  const voting_location = formData.get('voting_location') as string || null
  
  const query = supabase.from('voters_ledger').update({
    type,
    name,
    quantity,
    phone,
    neighborhood,
    voting_location,
  }).eq('id', id)

  if (profile.role !== 'admin') {
    query.eq('lideranca_id', user.id)
  }

  const { error } = await query
  if (error) {
    console.error('Error updating eleitor:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/eleitores')
  revalidatePath('/dashboard')
  return { success: true }
}
