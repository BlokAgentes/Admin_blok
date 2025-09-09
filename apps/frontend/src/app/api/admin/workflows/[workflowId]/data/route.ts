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
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const dataType = searchParams.get('dataType') // input, output, intermediate
    const executionId = searchParams.get('executionId')
    const nodeName = searchParams.get('nodeName')

    // Construir query
    let query = supabase
      .from('workflow_data')
      .select(`
        *,
        workflow_executions!inner(
          id,
          status,
          started_at,
          finished
        ),
        usuarios!inner(
          id,
          nome,
          email
        )
      `)
      .eq('workflow_id', workflowId)
      .order('collected_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtros opcionais
    if (dataType) {
      query = query.eq('data_type', dataType)
    }

    if (executionId) {
      query = query.eq('execution_id', executionId)
    }

    if (nodeName) {
      query = query.eq('node_name', nodeName)
    }

    const { data: workflowData, error, count } = await query

    if (error) {
      console.error('Erro ao buscar dados do workflow:', error)
      return NextResponse.json(
        { error: 'Erro ao carregar dados' },
        { status: 500 }
      )
    }

    // Buscar estatísticas dos dados
    const { data: dataStats } = await supabase
      .from('workflow_data')
      .select('data_type, node_name, node_type')
      .eq('workflow_id', workflowId)

    // Agregar estatísticas
    const stats = {
      totalRecords: dataStats?.length || 0,
      byDataType: dataStats?.reduce((acc, item) => {
        acc[item.data_type] = (acc[item.data_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      byNodeType: dataStats?.reduce((acc, item) => {
        if (item.node_type) {
          acc[item.node_type] = (acc[item.node_type] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {},
      uniqueNodes: [...new Set(dataStats?.map(item => item.node_name).filter(Boolean))].length
    }

    // Buscar nós únicos para filtros
    const { data: uniqueNodes } = await supabase
      .from('workflow_data')
      .select('node_name, node_type')
      .eq('workflow_id', workflowId)
      .not('node_name', 'is', null)

    const nodeTypes = [...new Set(uniqueNodes?.map(n => n.node_type).filter(Boolean))] || []
    const nodeNames = [...new Set(uniqueNodes?.map(n => n.node_name).filter(Boolean))] || []

    return NextResponse.json({
      success: true,
      data: workflowData || [],
      count: (workflowData || []).length,
      total: count || 0,
      stats,
      filters: {
        nodeTypes,
        nodeNames,
        dataTypes: ['input', 'output', 'intermediate', 'trigger']
      },
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Erro na API de dados do workflow:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}