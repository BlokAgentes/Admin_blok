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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  RefreshCw, 
  Play, 
  Pause, 
  MoreHorizontal, 
  ExternalLink,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface WorkflowStats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  runningExecutions: number
  successRate: number
  lastExecution?: {
    id: string
    status: string
    started_at: string
    finished: boolean
  }
}

interface WorkflowUser {
  id: string
  nome: string
  email: string
  criado_em: string
}

interface WorkflowData {
  id: string
  workflow_id: string
  workflow_name: string
  workflow_active: boolean
  sync_enabled: boolean
  last_sync: string | null
  usuarios: WorkflowUser
  stats: WorkflowStats
  criado_em: string
  atualizado_em: string
}

export function WorkflowsTable() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/workflows')
      const result = await response.json()
      
      if (result.success) {
        setWorkflows(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncWorkflow = async (workflowId: string, userId: string) => {
    try {
      setSyncing(workflowId)
      
      const response = await fetch(`/api/admin/workflows/${workflowId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Recarregar workflows após sincronização
        await loadWorkflows()
      }
      
    } catch (error) {
      console.error('Erro na sincronização:', error)
    } finally {
      setSyncing(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      success: { variant: 'default' as const, icon: CheckCircle2, text: 'Sucesso' },
      failed: { variant: 'destructive' as const, icon: XCircle, text: 'Falhou' },
      running: { variant: 'secondary' as const, icon: Clock, text: 'Executando' },
      canceled: { variant: 'outline' as const, icon: AlertCircle, text: 'Cancelado' },
    }
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.canceled
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  useEffect(() => {
    loadWorkflows()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflows Ativos</CardTitle>
            <CardDescription>
              Gerenciar workflows conectados ao n8n
            </CardDescription>
          </div>
          <Button onClick={loadWorkflows} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Execuções</TableHead>
                <TableHead>Taxa Sucesso</TableHead>
                <TableHead>Última Sync</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum workflow encontrado
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((workflow) => (
                  <TableRow key={workflow.workflow_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.workflow_name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {workflow.workflow_id}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.usuarios.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {workflow.usuarios.email}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={workflow.workflow_active ? 'default' : 'secondary'}>
                          {workflow.workflow_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {workflow.stats.lastExecution && (
                          getStatusBadge(workflow.stats.lastExecution.status)
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{workflow.stats.totalExecutions}</span>
                        <span className="text-sm text-muted-foreground">
                          ({workflow.stats.successfulExecutions}✓ {workflow.stats.failedExecutions}✗)
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          workflow.stats.successRate >= 90 ? 'bg-green-500' :
                          workflow.stats.successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium">
                          {workflow.stats.successRate.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {workflow.last_sync ? (
                          <div>
                            <div>{formatDate(workflow.last_sync)}</div>
                            <Badge variant="outline" size="sm">
                              {workflow.sync_enabled ? 'Auto' : 'Manual'}
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="secondary">Nunca</Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => window.open(`/admin/workflows/${workflow.workflow_id}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => syncWorkflow(workflow.workflow_id, workflow.usuarios.id)}
                            disabled={syncing === workflow.workflow_id}
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${syncing === workflow.workflow_id ? 'animate-spin' : ''}`} />
                            Sincronizar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {workflows.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}