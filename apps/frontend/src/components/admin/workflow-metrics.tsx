'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Zap,
  Target
} from 'lucide-react'

interface WorkflowMetrics {
  overview: {
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    runningExecutions: number
    canceledExecutions: number
    successRate: number
    failureRate: number
    avgExecutionTime: number
    avgExecutionTimeFormatted: string
  }
  timeline: Array<{
    date: string
    executions: number
    successful: number
    successRate: number
  }>
  performance: {
    fastestExecution: number
    slowestExecution: number
    medianExecutionTime: number
    totalExecutionTime: number
  }
  workflow: {
    id: string
    name: string
    active: boolean
    syncEnabled: boolean
    lastSync: string
    user: {
      id: string
      nome: string
      email: string
    }
  } | null
}

interface WorkflowMetricsProps {
  workflowId: string
  userId?: string
}

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6']

export function WorkflowMetrics({ workflowId, userId }: WorkflowMetricsProps) {
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  const loadMetrics = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        period
      })
      
      if (userId) {
        params.set('userId', userId)
      }

      const response = await fetch(`/api/admin/workflows/${workflowId}/metrics?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setMetrics(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`
    return `${(ms / 3600000).toFixed(1)}h`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  useEffect(() => {
    loadMetrics()
  }, [workflowId, userId, period])

  if (loading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Erro ao carregar métricas
          </div>
        </CardContent>
      </Card>
    )
  }

  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Sucesso', value: metrics.overview.successfulExecutions, color: '#10B981' },
    { name: 'Falhou', value: metrics.overview.failedExecutions, color: '#EF4444' },
    { name: 'Executando', value: metrics.overview.runningExecutions, color: '#3B82F6' },
    { name: 'Cancelado', value: metrics.overview.canceledExecutions, color: '#8B5CF6' }
  ].filter(item => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métricas do Workflow</h2>
          {metrics.workflow && (
            <p className="text-muted-foreground">
              {metrics.workflow.name} - {metrics.workflow.user.nome}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cards de visão geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Execuções</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.overview.successfulExecutions} sucessos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.overview.successRate.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.overview.successRate >= 90 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              {metrics.overview.failureRate.toFixed(1)}% falhas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.overview.avgExecutionTimeFormatted}
            </div>
            <p className="text-xs text-muted-foreground">
              Por execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Workflow</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={metrics.workflow?.active ? 'default' : 'secondary'}>
                {metrics.workflow?.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sync: {metrics.workflow?.syncEnabled ? 'Habilitado' : 'Desabilitado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline de execuções */}
        <Card>
          <CardHeader>
            <CardTitle>Execuções por Dia</CardTitle>
            <CardDescription>Volume de execuções ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value, name) => [
                    value, 
                    name === 'executions' ? 'Execuções' : 'Sucessos'
                  ]}
                />
                <Bar dataKey="executions" fill="#3B82F6" name="executions" />
                <Bar dataKey="successful" fill="#10B981" name="successful" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxa de sucesso */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Sucesso</CardTitle>
            <CardDescription>Porcentagem de sucesso ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Taxa de Sucesso']}
                />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status e Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de status */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Status</CardTitle>
              <CardDescription>Proporção de cada status de execução</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Métricas de performance */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
            <CardDescription>Estatísticas de tempo de execução</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Execução Mais Rápida</span>
              <Badge variant="outline">
                {formatDuration(metrics.performance.fastestExecution)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Execução Mais Lenta</span>
              <Badge variant="outline">
                {formatDuration(metrics.performance.slowestExecution)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tempo Mediano</span>
              <Badge variant="outline">
                {formatDuration(metrics.performance.medianExecutionTime)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tempo Total</span>
              <Badge variant="outline">
                {formatDuration(metrics.performance.totalExecutionTime)}
              </Badge>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Última Sincronização</span>
                <div className="text-sm text-muted-foreground">
                  {metrics.workflow?.lastSync 
                    ? new Date(metrics.workflow.lastSync).toLocaleString('pt-BR')
                    : 'Nunca'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}