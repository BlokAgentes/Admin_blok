'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  RefreshCw, 
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  Timer,
  Database
} from 'lucide-react'

interface ExecutionData {
  id: string
  usuario_id: string
  workflow_id: string
  n8n_execution_id: string
  status: string
  mode: string
  started_at: string
  stopped_at?: string
  finished: boolean
  data_count: number
  recent_data: any[]
  duration?: number
  usuarios: {
    id: string
    nome: string
    email: string
  }
}

interface ExecutionStats {
  total: number
  success: number
  failed: number
  running: number
  canceled: number
}

interface WorkflowExecutionsProps {
  workflowId: string
  userId?: string
  onExecutionClick?: (execution: ExecutionData) => void
}

export function WorkflowExecutions({ 
  workflowId, 
  userId, 
  onExecutionClick 
}: WorkflowExecutionsProps) {
  const [executions, setExecutions] = useState<ExecutionData[]>([])
  const [stats, setStats] = useState<ExecutionStats>({ total: 0, success: 0, failed: 0, running: 0, canceled: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const limit = 25

  const loadExecutions = async (reset = false) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: reset ? '0' : (page * limit).toString(),
      })
      
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      
      if (userId) {
        params.set('userId', userId)
      }

      const response = await fetch(`/api/admin/workflows/${workflowId}/executions?${params}`)
      const result = await response.json()
      
      if (result.success) {
        if (reset) {
          setExecutions(result.data)
          setPage(0)
        } else {
          setExecutions(prev => [...prev, ...result.data])
        }
        
        setStats(result.stats)
        setHasMore(result.pagination.hasMore)
      }
    } catch (error) {
      console.error('Erro ao carregar execuções:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`
    return `${(ms / 3600000).toFixed(1)}h`
  }

  const getStatusBadge = (status: string, finished: boolean) => {
    const statusMap = {
      success: { variant: 'default' as const, icon: CheckCircle2, text: 'Sucesso' },
      failed: { variant: 'destructive' as const, icon: XCircle, text: 'Falhou' },
      running: { variant: 'secondary' as const, icon: Clock, text: 'Executando' },
      canceled: { variant: 'outline' as const, icon: AlertCircle, text: 'Cancelado' },
      waiting: { variant: 'secondary' as const, icon: Clock, text: 'Aguardando' }
    }
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.canceled
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
        {status === 'running' && !finished && (
          <div className="w-2 h-2 bg-current rounded-full animate-pulse ml-1" />
        )}
      </Badge>
    )
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  useEffect(() => {
    loadExecutions(true)
  }, [workflowId, userId, statusFilter])

  useEffect(() => {
    if (page > 0) {
      loadExecutions(false)
    }
  }, [page])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Execuções do Workflow</CardTitle>
            <CardDescription>
              Histórico de execuções e resultados
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="running">Executando</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => loadExecutions(true)} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-muted-foreground">Sucesso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Falhou</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            <div className="text-sm text-muted-foreground">Executando</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.canceled}</div>
            <div className="text-sm text-muted-foreground">Cancelado</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Dados</TableHead>
                <TableHead>Modo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && executions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando execuções...
                  </TableCell>
                </TableRow>
              ) : executions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhuma execução encontrada
                  </TableCell>
                </TableRow>
              ) : (
                executions.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell>
                      <div>
                        <div className="font-mono text-sm">
                          #{execution.n8n_execution_id.slice(0, 8)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {execution.usuarios.nome}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(execution.status, execution.finished)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm">{formatDate(execution.started_at)}</div>
                          {execution.stopped_at && (
                            <div className="text-xs text-muted-foreground">
                              Fim: {formatDate(execution.stopped_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {formatDuration(execution.duration)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{execution.data_count}</span>
                        {execution.data_count > 0 && (
                          <Badge variant="outline" size="sm">
                            {execution.recent_data.length} recentes
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">
                        {execution.mode}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExecutionClick?.(execution)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {hasMore && executions.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Carregar Mais'
              )}
            </Button>
          </div>
        )}
        
        {executions.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {executions.length} de {stats.total} execuções
            </div>
            <div className="text-sm text-muted-foreground">
              Taxa de sucesso: {stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0'}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}