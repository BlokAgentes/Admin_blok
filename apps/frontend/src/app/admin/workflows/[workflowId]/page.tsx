'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { WorkflowMetrics } from '@/components/admin/workflow-metrics'
import { WorkflowExecutions } from '@/components/admin/workflow-executions'

interface ExecutionDetails {
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

export default function WorkflowDetailPage() {
  const params = useParams()
  const workflowId = params.workflowId as string
  const [selectedExecution, setSelectedExecution] = useState<ExecutionDetails | null>(null)

  const handleExecutionClick = (execution: ExecutionDetails) => {
    setSelectedExecution(execution)
    console.log('Execução selecionada:', execution)
    // Aqui você pode abrir um modal ou navegar para uma página de detalhes
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/workflows">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold">Detalhes do Workflow</h1>
            <p className="text-muted-foreground font-mono">ID: {workflowId}</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_N8N_URL}/workflow/${workflowId}`, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir no n8n
        </Button>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        {/* Tab de Métricas */}
        <TabsContent value="metrics" className="space-y-6">
          <WorkflowMetrics workflowId={workflowId} />
        </TabsContent>

        {/* Tab de Execuções */}
        <TabsContent value="executions" className="space-y-6">
          <WorkflowExecutions 
            workflowId={workflowId} 
            onExecutionClick={handleExecutionClick}
          />
        </TabsContent>

        {/* Tab de Dados */}
        <TabsContent value="data" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Visualização de Dados</h3>
            <p className="text-muted-foreground">
              Em desenvolvimento - aqui será exibido o histórico de dados coletados do workflow
            </p>
          </div>
        </TabsContent>

        {/* Tab de Configuração */}
        <TabsContent value="config" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Configurações do Workflow</h3>
            <p className="text-muted-foreground">
              Em desenvolvimento - aqui será possível configurar parâmetros do workflow
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes da execução (placeholder) */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Detalhes da Execução #{selectedExecution.n8n_execution_id.slice(0, 8)}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedExecution(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm">{selectedExecution.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Modo</label>
                  <p className="text-sm">{selectedExecution.mode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Iniciado em</label>
                  <p className="text-sm">
                    {new Date(selectedExecution.started_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Duração</label>
                  <p className="text-sm">
                    {selectedExecution.duration 
                      ? `${selectedExecution.duration}ms` 
                      : 'Em andamento'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Usuário</label>
                <p className="text-sm">
                  {selectedExecution.usuarios.nome} ({selectedExecution.usuarios.email})
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Dados Coletados</label>
                <p className="text-sm">{selectedExecution.data_count} registros</p>
              </div>
              
              {selectedExecution.recent_data.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Dados Recentes</label>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                    {JSON.stringify(selectedExecution.recent_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}