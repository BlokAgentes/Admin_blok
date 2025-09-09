import { createClient } from '@supabase/supabase-js';
import { n8nService, type Execution, type Workflow } from './n8n.service';

// Configuração Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface WorkflowExecution {
  id: string;
  usuario_id: string;
  workflow_id: string;
  n8n_execution_id: string;
  status: string;
  mode?: string;
  started_at?: string;
  stopped_at?: string;
  finished: boolean;
  execution_data: any;
  error_data?: any;
  retry_of?: string;
  wait_till?: string;
}

export interface WorkflowData {
  usuario_id: string;
  workflow_id: string;
  execution_id: string;
  n8n_execution_id: string;
  data_type: string;
  node_name?: string;
  node_type?: string;
  data_content: any;
  execution_time?: number;
}

export interface WorkflowMetric {
  usuario_id: string;
  workflow_id: string;
  metric_name: string;
  metric_value: any;
  period_start?: Date;
  period_end?: Date;
}

export class N8nDataCollector {
  
  /**
   * Sincroniza execuções do n8n para o Supabase
   */
  async syncExecutions(workflowId: string, userId: string): Promise<{ success: boolean; synced: number; message: string }> {
    try {
      console.log(`[DataCollector] Iniciando sincronização para workflow ${workflowId}, usuário ${userId}`);

      // Buscar última execução sincronizada
      const { data: lastExecution } = await supabase
        .from('workflow_executions')
        .select('started_at')
        .eq('workflow_id', workflowId)
        .eq('usuario_id', userId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      // Buscar execuções do n8n
      const n8nExecutions = await n8nService.getExecutions({
        workflowId,
        limit: 50
      });

      if (!n8nExecutions.data || n8nExecutions.data.length === 0) {
        return { success: true, synced: 0, message: 'Nenhuma execução encontrada no n8n' };
      }

      let syncedCount = 0;
      
      for (const execution of n8nExecutions.data) {
        // Verificar se execução já existe
        const { data: existingExecution } = await supabase
          .from('workflow_executions')
          .select('id')
          .eq('n8n_execution_id', execution.id)
          .single();

        if (existingExecution) {
          // Atualizar execução existente se status mudou
          await this.updateExecution(execution, userId, workflowId);
        } else {
          // Criar nova execução
          await this.createExecution(execution, userId, workflowId);
          syncedCount++;
        }

        // Coletar dados detalhados da execução
        await this.collectExecutionData(execution.id, workflowId, userId);
      }

      // Atualizar timestamp de última sincronização
      await this.updateLastSync(workflowId, userId);

      console.log(`[DataCollector] Sincronização concluída: ${syncedCount} execuções sincronizadas`);
      
      return { 
        success: true, 
        synced: syncedCount, 
        message: `${syncedCount} execuções sincronizadas com sucesso` 
      };

    } catch (error) {
      console.error('[DataCollector] Erro na sincronização:', error);
      return { 
        success: false, 
        synced: 0, 
        message: `Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  }

  /**
   * Cria nova execução no Supabase
   */
  private async createExecution(execution: Execution, userId: string, workflowId: string): Promise<string | null> {
    try {
      const executionData: Partial<WorkflowExecution> = {
        usuario_id: userId,
        workflow_id: workflowId,
        n8n_execution_id: execution.id,
        status: execution.status,
        mode: execution.mode,
        started_at: execution.startedAt,
        stopped_at: execution.stoppedAt,
        finished: execution.finished,
        execution_data: execution,
        retry_of: execution.retryOf,
        wait_till: execution.waitTill
      };

      const { data, error } = await supabase
        .from('workflow_executions')
        .insert(executionData)
        .select('id')
        .single();

      if (error) {
        console.error('[DataCollector] Erro ao criar execução:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('[DataCollector] Erro ao criar execução:', error);
      return null;
    }
  }

  /**
   * Atualiza execução existente
   */
  private async updateExecution(execution: Execution, userId: string, workflowId: string): Promise<void> {
    try {
      const updateData = {
        status: execution.status,
        stopped_at: execution.stoppedAt,
        finished: execution.finished,
        execution_data: execution,
        wait_till: execution.waitTill,
        atualizado_em: new Date().toISOString()
      };

      await supabase
        .from('workflow_executions')
        .update(updateData)
        .eq('n8n_execution_id', execution.id)
        .eq('usuario_id', userId);

    } catch (error) {
      console.error('[DataCollector] Erro ao atualizar execução:', error);
    }
  }

  /**
   * Coleta dados detalhados de uma execução
   */
  async collectExecutionData(executionId: string, workflowId: string, userId: string): Promise<void> {
    try {
      // Buscar execução completa com dados
      const detailedExecution = await n8nService.getExecution(executionId, true);
      
      // Buscar ID da execução no Supabase
      const { data: supabaseExecution } = await supabase
        .from('workflow_executions')
        .select('id')
        .eq('n8n_execution_id', executionId)
        .single();

      if (!supabaseExecution) {
        console.warn(`[DataCollector] Execução ${executionId} não encontrada no Supabase`);
        return;
      }

      // Processar dados dos nós (simulado - adaptado conforme estrutura real do n8n)
      if (detailedExecution && (detailedExecution as any).data?.resultData?.runData) {
        const runData = (detailedExecution as any).data.resultData.runData;
        
        for (const [nodeName, nodeData] of Object.entries(runData)) {
          if (Array.isArray(nodeData)) {
            for (let i = 0; i < nodeData.length; i++) {
              const nodeExecution = (nodeData as any)[i];
              
              const workflowData: Partial<WorkflowData> = {
                usuario_id: userId,
                workflow_id: workflowId,
                execution_id: supabaseExecution.id,
                n8n_execution_id: executionId,
                data_type: 'output', // ou 'input', 'intermediate' dependendo do contexto
                node_name: nodeName,
                node_type: nodeExecution.node?.type || 'unknown',
                data_content: nodeExecution.data || {},
                execution_time: nodeExecution.executionTime || 0
              };

              // Inserir dados do nó
              await supabase
                .from('workflow_data')
                .insert(workflowData);
            }
          }
        }
      }

    } catch (error) {
      console.error('[DataCollector] Erro ao coletar dados da execução:', error);
    }
  }

  /**
   * Calcula métricas do workflow
   */
  async calculateMetrics(workflowId: string, userId: string): Promise<void> {
    try {
      // Buscar execuções dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .eq('usuario_id', userId)
        .gte('started_at', thirtyDaysAgo.toISOString());

      if (!executions || executions.length === 0) {
        return;
      }

      const now = new Date();
      const periodStart = thirtyDaysAgo;
      const periodEnd = now;

      // Calcular taxa de sucesso
      const successfulExecutions = executions.filter(e => e.status === 'success').length;
      const successRate = (successfulExecutions / executions.length) * 100;

      // Calcular tempo médio de execução
      const executionTimes = executions
        .filter(e => e.started_at && e.stopped_at)
        .map(e => new Date(e.stopped_at!).getTime() - new Date(e.started_at!).getTime());
      
      const avgExecutionTime = executionTimes.length > 0 
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
        : 0;

      // Preparar métricas
      const metrics: Partial<WorkflowMetric>[] = [
        {
          usuario_id: userId,
          workflow_id: workflowId,
          metric_name: 'success_rate',
          metric_value: { value: successRate, total: executions.length, successful: successfulExecutions },
          period_start: periodStart,
          period_end: periodEnd
        },
        {
          usuario_id: userId,
          workflow_id: workflowId,
          metric_name: 'avg_execution_time',
          metric_value: { value: avgExecutionTime, unit: 'ms' },
          period_start: periodStart,
          period_end: periodEnd
        },
        {
          usuario_id: userId,
          workflow_id: workflowId,
          metric_name: 'total_executions',
          metric_value: { value: executions.length },
          period_start: periodStart,
          period_end: periodEnd
        }
      ];

      // Salvar métricas (upsert)
      for (const metric of metrics) {
        await supabase
          .from('workflow_metrics')
          .upsert(metric, {
            onConflict: 'usuario_id, workflow_id, metric_name, period_start, period_end'
          });
      }

      console.log(`[DataCollector] Métricas calculadas para workflow ${workflowId}`);

    } catch (error) {
      console.error('[DataCollector] Erro ao calcular métricas:', error);
    }
  }

  /**
   * Sincronização periódica para todos os usuários
   */
  async scheduledSync(): Promise<void> {
    try {
      console.log('[DataCollector] Iniciando sincronização periódica');

      // Buscar todos os usuários com workflow_id configurado
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, workflow_id')
        .not('workflow_id', 'is', null);

      if (!usuarios || usuarios.length === 0) {
        console.log('[DataCollector] Nenhum usuário com workflow configurado');
        return;
      }

      let totalSynced = 0;

      for (const usuario of usuarios) {
        try {
          const result = await this.syncExecutions(usuario.workflow_id, usuario.id);
          totalSynced += result.synced;
          
          // Calcular métricas após sincronização
          await this.calculateMetrics(usuario.workflow_id, usuario.id);
          
          // Pequena pausa entre usuários para não sobrecarregar APIs
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`[DataCollector] Erro na sincronização do usuário ${usuario.id}:`, error);
        }
      }

      console.log(`[DataCollector] Sincronização periódica concluída. ${totalSynced} execuções sincronizadas`);

    } catch (error) {
      console.error('[DataCollector] Erro na sincronização periódica:', error);
    }
  }

  /**
   * Atualiza timestamp da última sincronização
   */
  private async updateLastSync(workflowId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('workflow_configs')
        .upsert({
          usuario_id: userId,
          workflow_id: workflowId,
          last_sync: new Date().toISOString()
        }, {
          onConflict: 'usuario_id, workflow_id'
        });
    } catch (error) {
      console.error('[DataCollector] Erro ao atualizar última sincronização:', error);
    }
  }

  /**
   * Configura workflow para usuário
   */
  async setupWorkflowConfig(workflowId: string, userId: string, workflowName?: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('workflow_configs')
        .upsert({
          usuario_id: userId,
          workflow_id: workflowId,
          workflow_name: workflowName || `Workflow ${workflowId}`,
          workflow_active: true,
          sync_enabled: true,
          sync_frequency: 300, // 5 minutos
          config_data: {}
        }, {
          onConflict: 'usuario_id, workflow_id'
        });

      if (error) {
        console.error('[DataCollector] Erro ao configurar workflow:', error);
        throw error;
      }

      console.log(`[DataCollector] Workflow ${workflowId} configurado para usuário ${userId}`);
    } catch (error) {
      console.error('[DataCollector] Erro ao configurar workflow:', error);
      throw error;
    }
  }
}

export const dataCollector = new N8nDataCollector();