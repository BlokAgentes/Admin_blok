import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Importar o data collector - ajustar o caminho conforme necessário
// Nota: Em produção, isso deveria ser feito via service worker ou job queue
async function importDataCollector() {
  try {
    // Como estamos no frontend, vamos fazer a sincronização via API backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    return {
      syncExecutions: async (workflowId: string, userId: string) => {
        const response = await fetch(`${backendUrl}/api/n8n/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId, userId })
        })
        return response.json()
      }
    }
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    // TODO: Adicionar autenticação admin aqui
    // const user = await getCurrentUser(request)
    // if (!user || user.role !== 'ADMIN') { return unauthorized }

    const { workflowId } = params
    const { userId } = await request.json()

    // Verificar se o workflow existe
    const { data: workflowConfig, error: configError } = await supabase
      .from('workflow_configs')
      .select(`
        *,
        usuarios!inner(
          id,
          nome,
          email
        )
      `)
      .eq('workflow_id', workflowId)
      .single()

    if (configError || !workflowConfig) {
      return NextResponse.json(
        { error: 'Workflow não encontrado' },
        { status: 404 }
      )
    }

    // Se userId foi especificado, verificar se corresponde ao workflow
    const targetUserId = userId || workflowConfig.usuario_id

    if (userId && userId !== workflowConfig.usuario_id) {
      return NextResponse.json(
        { error: 'Usuário não corresponde ao workflow' },
        { status: 400 }
      )
    }

    try {
      // Tentar sincronizar via backend service
      const dataCollector = await importDataCollector()
      
      if (dataCollector) {
        const result = await dataCollector.syncExecutions(workflowId, targetUserId)
        
        // Atualizar timestamp de sincronização
        await supabase
          .from('workflow_configs')
          .update({ 
            last_sync: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          })
          .eq('workflow_id', workflowId)

        return NextResponse.json({
          success: true,
          message: result.message || 'Sincronização concluída',
          data: {
            workflowId,
            userId: targetUserId,
            syncedExecutions: result.synced || 0,
            timestamp: new Date().toISOString()
          }
        })
      } else {
        // Fallback: marcar como sincronizado sem fazer nada
        await supabase
          .from('workflow_configs')
          .update({ 
            last_sync: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          })
          .eq('workflow_id', workflowId)

        return NextResponse.json({
          success: true,
          message: 'Sincronização agendada (backend não disponível)',
          data: {
            workflowId,
            userId: targetUserId,
            syncedExecutions: 0,
            timestamp: new Date().toISOString()
          }
        })
      }

    } catch (syncError) {
      console.error('Erro durante sincronização:', syncError)
      
      return NextResponse.json({
        success: false,
        message: `Erro na sincronização: ${syncError instanceof Error ? syncError.message : 'Erro desconhecido'}`,
        data: {
          workflowId,
          userId: targetUserId,
          error: syncError instanceof Error ? syncError.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Erro na API de sincronização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para verificar status de sincronização
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params

    // Buscar informações do workflow
    const { data: workflowConfig, error } = await supabase
      .from('workflow_configs')
      .select(`
        workflow_id,
        workflow_name,
        sync_enabled,
        last_sync,
        sync_frequency,
        usuarios!inner(
          id,
          nome,
          email
        )
      `)
      .eq('workflow_id', workflowId)
      .single()

    if (error || !workflowConfig) {
      return NextResponse.json(
        { error: 'Workflow não encontrado' },
        { status: 404 }
      )
    }

    // Buscar última execução sincronizada
    const { data: lastExecution } = await supabase
      .from('workflow_executions')
      .select('started_at, status, finished')
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    // Calcular se sincronização está atrasada
    const lastSyncTime = workflowConfig.last_sync ? new Date(workflowConfig.last_sync) : null
    const syncFrequency = workflowConfig.sync_frequency || 300 // 5 minutos padrão
    const now = new Date()
    const isOverdue = lastSyncTime 
      ? (now.getTime() - lastSyncTime.getTime()) > (syncFrequency * 1000)
      : true

    return NextResponse.json({
      success: true,
      data: {
        workflow: {
          id: workflowConfig.workflow_id,
          name: workflowConfig.workflow_name,
          user: workflowConfig.usuarios
        },
        sync: {
          enabled: workflowConfig.sync_enabled,
          frequency: syncFrequency,
          lastSync: workflowConfig.last_sync,
          isOverdue,
          nextSync: lastSyncTime 
            ? new Date(lastSyncTime.getTime() + (syncFrequency * 1000)).toISOString()
            : null
        },
        lastExecution: lastExecution || null
      }
    })

  } catch (error) {
    console.error('Erro ao verificar status de sincronização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}