import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação admin aqui
    // const user = await getCurrentUser(request)
    // if (!user || user.role !== 'ADMIN') { return unauthorized }

    // Buscar todos os workflows configurados
    const { data: workflows, error } = await supabase
      .from('workflow_configs')
      .select(`
        *,
        usuarios!inner(
          id,
          nome,
          email,
          criado_em
        )
      `)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar workflows:', error)
      return NextResponse.json(
        { error: 'Erro ao carregar workflows' },
        { status: 500 }
      )
    }

    // Buscar estatísticas de cada workflow
    const workflowsWithStats = await Promise.all(
      workflows.map(async (workflow) => {
        // Buscar execuções recentes
        const { data: executions } = await supabase
          .from('workflow_executions')
          .select('id, status, started_at, finished')
          .eq('workflow_id', workflow.workflow_id)
          .eq('usuario_id', workflow.usuario_id)
          .order('started_at', { ascending: false })
          .limit(10)

        // Calcular estatísticas
        const totalExecutions = executions?.length || 0
        const successfulExecutions = executions?.filter(e => e.status === 'success').length || 0
        const failedExecutions = executions?.filter(e => e.status === 'failed').length || 0
        const runningExecutions = executions?.filter(e => e.status === 'running').length || 0

        const lastExecution = executions?.[0]
        
        return {
          ...workflow,
          stats: {
            totalExecutions,
            successfulExecutions,
            failedExecutions,
            runningExecutions,
            successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
            lastExecution: lastExecution ? {
              id: lastExecution.id,
              status: lastExecution.status,
              started_at: lastExecution.started_at,
              finished: lastExecution.finished
            } : null
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: workflowsWithStats,
      count: workflowsWithStats.length
    })

  } catch (error) {
    console.error('Erro na API de workflows:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}