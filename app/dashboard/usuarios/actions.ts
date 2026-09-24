'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado'
}

// Helper para garantir que apenas admins podem rodar a action
async function ensureAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Não autorizado')
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, access_modules')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') {
    throw new Error('Acesso negado: apenas administradores ou usuários com permissão ao módulo Usuários.')
  }
  
  return user
}

export async function createUser(formData: FormData) {
  try {
    await ensureAdmin()
    
    let email = formData.get('email') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string
    const parentId = formData.get('parentId') as string || null
    let password = formData.get('password') as string
    const accessModules = formData.getAll('modules') as string[]
    const hasLogin = formData.get('hasLogin') === 'on' || role === 'admin' || role === 'lider'

    if (!hasLogin) {
      email = `no-login-${Date.now()}@lidersys.local`
      password = crypto.randomUUID()
    } else {
      if (!password || password.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres.')
      }
    }

    const adminAuthClient = createServiceClient()

    // 1. Cria o usuário na Auth do Supabase
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirma para não dar dor de cabeça no login imediato
    })

    if (authError) throw new Error(`Erro Auth: ${authError.message}`)
    if (!authData.user) throw new Error('Erro ao criar usuário na Auth.')

    // 2. Cria/Atualiza o Profile (service client para ignorar RLS)
    const { error: profileError } = await adminAuthClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        role: role,
        parent_id: parentId,
        access_modules: accessModules
      })

    if (profileError) throw new Error(`Erro Profile: ${profileError.message}`)

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateUser(formData: FormData) {
  try {
    await ensureAdmin()
    
    const id = formData.get('id') as string
    const role = formData.get('role') as string
    const parentId = formData.get('parentId') as string || null
    const accessModules = formData.getAll('modules') as string[]

    const service = createServiceClient()
    const { error } = await service
      .from('profiles')
      .update({ role, parent_id: parentId, access_modules: accessModules })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteUser(id: string) {
  try {
    await ensureAdmin()
    const service = createServiceClient()
    
    // Deletar da auth remove em cascata o profile
    const { error } = await service.auth.admin.deleteUser(id)
    if (error) throw error

    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}
