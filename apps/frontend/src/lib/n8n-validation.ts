import { supabase } from './supabase'

/**
 * Valida se um workflow_id é válido para registro
 */
export async function validateWorkflowForRegistration(workflowId: string): Promise<{
  valid: boolean
  error?: string
  workflow?: any
}> {
  try {
    // 1. Verificar se workflow_id não está vazio ou inválido
    if (!workflowId || workflowId.trim().length === 0) {
      return { valid: false, error: 'Código de autenticação é obrigatório' }
    }

    // 2. Verificar se workflow já está vinculado a outro usuário
    const { data: existingUser, error: dbError } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('workflow_id', workflowId)
      .single()

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = not found (ok)
      console.error('Erro ao verificar workflow existente:', dbError)
      return { valid: false, error: 'Erro ao validar código de autenticação' }
    }

    if (existingUser) {
      return { 
        valid: false, 
        error: 'Este código de autenticação já está em uso por outro usuário' 
      }
    }

    // 3. Validar com n8n API (opcional - pode falhar se n8n estiver offline)
    try {
      const response = await fetch(`${process.env.N8N_BASE_URL}/api/v1/workflows/${workflowId}`, {
        headers: {
          'X-N8N-API-KEY': process.env.N8N_API_SECRET!,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const workflow = await response.json()
        return { 
          valid: true, 
          workflow: {
            id: workflow.id,
            name: workflow.name,
            active: workflow.active
          }
        }
      } else if (response.status === 404) {
        return { valid: false, error: 'Código de autenticação não encontrado' }
      } else {
        console.warn('N8N API error:', response.status)
        // Se n8n API falhar, permite registro mesmo assim
        return { valid: true, workflow: { id: workflowId, name: 'Workflow', active: true } }
      }

    } catch (n8nError) {
      console.warn('N8N API não acessível:', n8nError)
      // Se n8n não estiver disponível, permite registro
      return { valid: true, workflow: { id: workflowId, name: 'Workflow', active: true } }
    }

  } catch (error) {
    console.error('Erro na validação do workflow:', error)
    return { valid: false, error: 'Erro interno na validação' }
  }
}

/**
 * Salva configuração do workflow para o usuário
 */
export async function saveWorkflowConfig(userId: string, workflowId: string, workflowData?: any): Promise<void> {
  try {
    // Configurar workflow no sistema
    const configData = {
      usuario_id: userId,
      workflow_id: workflowId,
      workflow_name: workflowData?.name || `Workflow ${workflowId}`,
      workflow_active: workflowData?.active || true,
      sync_enabled: true,
      sync_frequency: 300, // 5 minutos
      config_data: workflowData || {}
    }

    const { error } = await supabase
      .from('workflow_configs')
      .upsert(configData, {
        onConflict: 'usuario_id, workflow_id'
      })

    if (error) {
      console.error('Erro ao salvar configuração do workflow:', error)
      throw error
    }

    console.log(`Workflow ${workflowId} configurado para usuário ${userId}`)

  } catch (error) {
    console.error('Erro ao configurar workflow:', error)
    throw error
  }
}

/**
 * Atualiza o workflow_id do usuário na tabela usuarios
 */
export async function updateUserWorkflowId(userId: string, workflowId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ 
        workflow_id: workflowId,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Erro ao atualizar workflow_id do usuário:', error)
      throw error
    }

    console.log(`Workflow ID ${workflowId} vinculado ao usuário ${userId}`)

  } catch (error) {
    console.error('Erro ao vincular workflow ao usuário:', error)
    throw error
  }
}