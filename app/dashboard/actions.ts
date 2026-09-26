'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { getSessionProfile, getSessionUser } from '@/lib/supabase/authCache'
import { revalidateTag } from 'next/cache'

export async function updateMetaEleitores(formData: FormData) {
  try {
    const user = await getSessionUser()
    if (!user) return { error: 'Não autorizado' }

    const profile = await getSessionProfile(user.id)
    if (profile?.role !== 'admin') return { error: 'Apenas administradores podem alterar a meta.' }

    const rawValue = formData.get('meta') as string
    const meta = parseInt(rawValue, 10)
    if (!meta || meta < 1) return { error: 'Valor inválido para a meta.' }

    const service = createServiceClient()
    const { error } = await service
      .from('campaign_settings')
      .upsert(
        { key: 'meta_eleitores', value: String(meta), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) return { error: error.message }

    revalidateTag('campaign_settings')
    revalidateTag('dashboard_metrics')
    return { success: true }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Erro inesperado' }
  }
}
