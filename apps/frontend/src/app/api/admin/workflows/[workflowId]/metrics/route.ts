import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    // TODO: Adicionar autenticação admin aqui
    // const user = await getCurrentUser(request)
    // if (!user || user.role !== 'ADMIN') { return unauthorized }

    const { workflowId } = params
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de consulta
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d
    const userId = searchParams.get('userId')

    // Calcular período
    const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Buscar métricas salvas
    let metricsQuery = supabase
      .from('workflow_metrics')
      .select('*')
      .eq('workflow_id', workflowId)
      .gte('calculated_at', startDate.toISOString())
      .order('calculated_at', { ascending: false })

    if (userId) {
      metricsQuery = metricsQuery.eq('usuario_id', userId)
    }

    const { data: savedMetrics } = await metricsQuery

    // Buscar execuções para calcular métricas em tempo real
    let executionsQuery = supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .gte('started_at', startDate.toISOString())

    if (userId) {
      executionsQuery = executionsQuery.eq('usuario_id', userId)
    }

    const { data: executions } = await executionsQuery

    // Calcular métricas em tempo real
    const totalExecutions = executions?.length || 0
    const successfulExecutions = executions?.filter(e => e.status === 'success').length || 0
    const failedExecutions = executions?.filter(e => e.status === 'failed').length || 0
    const runningExecutions = executions?.filter(e => e.status === 'running').length || 0
    const canceledExecutions = executions?.filter(e => e.status === 'canceled').length || 0

    // Calcular tempo médio de execução
    const completedExecutions = executions?.filter(e => 
      e.started_at && e.stopped_at && (e.status === 'success' || e.status === 'failed')
    ) || []

    const executionTimes = completedExecutions.map(e => 
      new Date(e.stopped_at!).getTime() - new Date(e.started_at!).getTime()
    )

    const avgExecutionTime = executionTimes.length > 0 
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
      : 0

    // Calcular execuções por dia
    const executionsByDay = executions?.reduce((acc, execution) => {
      const day = new Date(execution.started_at || execution.criado_em).toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Calcular taxa de sucesso por dia
    const successByDay = executions?.filter(e => e.status === 'success').reduce((acc, execution) => {
      const day = new Date(execution.started_at || execution.criado_em).toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Preparar dados para gráficos
    const chartData = []
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      
      chartData.push({
        date: dayKey,
        executions: executionsByDay[dayKey] || 0,
        successful: successByDay[dayKey] || 0,
        successRate: executionsByDay[dayKey] 
          ? ((successByDay[dayKey] || 0) / executionsByDay[dayKey]) * 100 
          : 0
      })
    }

    // Buscar informações do usuário
    const { data: workflowConfig } = await supabase
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

    const currentMetrics = {
      overview: {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        runningExecutions,
        canceledExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
        failureRate: totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0,
        avgExecutionTime,
        avgExecutionTimeFormatted: formatDuration(avgExecutionTime)
      },
      timeline: chartData,
      performance: {
        fastestExecution: Math.min(...executionTimes) || 0,
        slowestExecution: Math.max(...executionTimes) || 0,
        medianExecutionTime: getMedian(executionTimes) || 0,
        totalExecutionTime: executionTimes.reduce((a, b) => a + b, 0)
      },
      workflow: workflowConfig ? {
        id: workflowConfig.workflow_id,
        name: workflowConfig.workflow_name,
        active: workflowConfig.workflow_active,
        syncEnabled: workflowConfig.sync_enabled,
        lastSync: workflowConfig.last_sync,
        user: workflowConfig.usuarios
      } : null,
      savedMetrics: savedMetrics || []
    }

    return NextResponse.json({
      success: true,
      data: currentMetrics,
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro na API de métricas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para formatar duração
function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  if (ms < 3600000) return `${Math.round(ms / 60000)}min`
  return `${Math.round(ms / 3600000)}h`
}

// Função auxiliar para calcular mediana
function getMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  
  return sorted[middle]
}