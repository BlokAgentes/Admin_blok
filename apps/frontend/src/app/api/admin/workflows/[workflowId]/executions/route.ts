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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Construir query
    let query = supabase
      .from('workflow_executions')
      .select(`
        *,
        usuarios!inner(
          id,
          nome,
          email
        )
      `)
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtros opcionais
    if (status) {
      query = query.eq('status', status)
    }

    if (userId) {
      query = query.eq('usuario_id', userId)
    }

    const { data: executions, error, count } = await query

    if (error) {
      console.error('Erro ao buscar execuções:', error)
      return NextResponse.json(
        { error: 'Erro ao carregar execuções' },
        { status: 500 }
      )
    }

    // Buscar dados adicionais para cada execução
    const executionsWithData = await Promise.all(
      (executions || []).map(async (execution) => {
        // Buscar dados da execução
        const { data: executionData } = await supabase
          .from('workflow_data')
          .select('*')
          .eq('execution_id', execution.id)
          .order('collected_at', { ascending: false })
          .limit(5) // Limitar a 5 dados mais recentes

        return {
          ...execution,
          data_count: executionData?.length || 0,
          recent_data: executionData?.slice(0, 3) || [], // 3 dados mais recentes
          duration: execution.started_at && execution.stopped_at 
            ? new Date(execution.stopped_at).getTime() - new Date(execution.started_at).getTime()
            : null
        }
      })
    )

    // Buscar estatísticas do workflow
    const { data: workflowStats } = await supabase
      .from('workflow_executions')
      .select('status')
      .eq('workflow_id', workflowId)

    const stats = {
      total: workflowStats?.length || 0,
      success: workflowStats?.filter(e => e.status === 'success').length || 0,
      failed: workflowStats?.filter(e => e.status === 'failed').length || 0,
      running: workflowStats?.filter(e => e.status === 'running').length || 0,
      canceled: workflowStats?.filter(e => e.status === 'canceled').length || 0
    }

    return NextResponse.json({
      success: true,
      data: executionsWithData,
      count: executionsWithData.length,
      total: count || 0,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Erro na API de execuções:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}