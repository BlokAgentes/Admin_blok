import { supabase } from './supabase'
import { createCRUD } from './supabase-crud'

/**
 * Integração entre Sistema de Auditoria e Taskmaster MCP
 * 
 * Este módulo fornece funcionalidades específicas para integrar
 * os logs de auditoria do Supabase com o Taskmaster MCP, permitindo
 * rastreamento de atividades relacionadas às tarefas.
 */

// Interface para logs de auditoria relacionados a tarefas
export interface TaskAuditLog {
  id?: string
  task_id?: string
  subtask_id?: string
  action: 'task_created' | 'task_updated' | 'task_completed' | 'task_deleted' | 'subtask_created' | 'subtask_updated' | 'subtask_completed'
  description: string
  metadata?: {
    previous_status?: string
    new_status?: string
    task_title?: string
    priority?: string
    [key: string]: any
  }
  created_by?: string
  timestamp?: Date
}

// Classe para gerenciar logs de auditoria do Taskmaster
export class TaskmasterAuditOperations {
  private auditCRUD = createCRUD('logs_atividade')

  /**
   * Registra uma ação relacionada a tarefas do Taskmaster
   */
  async logTaskAction(logData: TaskAuditLog): Promise<{ success: boolean; error?: string }> {
    try {
      const auditEntry = {
        acao: logData.action,
        tabela_afetada: 'taskmaster_tasks',
        registro_id: logData.task_id || logData.subtask_id,
        dados_novos: {
          task_id: logData.task_id,
          subtask_id: logData.subtask_id,
          description: logData.description,
          metadata: logData.metadata || {},
          timestamp: logData.timestamp || new Date()
        },
        criado_em: new Date().toISOString()
      }

      const result = await this.auditCRUD.create(auditEntry)
      
      if (result.success) {
        console.log(`✅ Taskmaster audit log created: ${logData.action} - ${logData.description}`)
        return { success: true }
      } else {
        console.error('❌ Failed to create taskmaster audit log:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ Error logging taskmaster action:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Busca logs de auditoria relacionados a uma tarefa específica
   */
  async getTaskLogs(taskId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const result = await this.auditCRUD.read({
        filters: {
          tabela_afetada: 'taskmaster_tasks',
          registro_id: taskId
        },
        orderBy: 'criado_em',
        ascending: false,
        limit: 50
      })

      return result
    } catch (error) {
      console.error('❌ Error fetching task logs:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Busca estatísticas de atividade do Taskmaster
   */
  async getTaskmasterStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const result = await this.auditCRUD.read({
        filters: {
          tabela_afetada: 'taskmaster_tasks'
        }
      })

      if (result.success && result.data) {
        const actions = result.data as any[]
        const stats = {
          total_actions: actions.length,
          actions_by_type: {},
          recent_activity: actions.slice(0, 10)
        }

        // Contar ações por tipo
        actions.forEach((action: any) => {
          const type = action.acao
          stats.actions_by_type[type] = (stats.actions_by_type[type] || 0) + 1
        })

        return { success: true, data: stats }
      }

      return result
    } catch (error) {
      console.error('❌ Error fetching taskmaster stats:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Registra mudança de status de tarefa
   */
  async logStatusChange(
    taskId: string, 
    previousStatus: string, 
    newStatus: string,
    taskTitle?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logTaskAction({
      task_id: taskId,
      action: 'task_updated',
      description: `Status changed from ${previousStatus} to ${newStatus}`,
      metadata: {
        previous_status: previousStatus,
        new_status: newStatus,
        task_title: taskTitle
      }
    })
  }

  /**
   * Registra criação de nova tarefa
   */
  async logTaskCreated(
    taskId: string,
    taskTitle: string,
    priority?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logTaskAction({
      task_id: taskId,
      action: 'task_created',
      description: `New task created: ${taskTitle}`,
      metadata: {
        task_title: taskTitle,
        priority: priority
      }
    })
  }

  /**
   * Registra conclusão de tarefa
   */
  async logTaskCompleted(
    taskId: string,
    taskTitle?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logTaskAction({
      task_id: taskId,
      action: 'task_completed',
      description: `Task completed: ${taskTitle || taskId}`,
      metadata: {
        task_title: taskTitle,
        new_status: 'completed'
      }
    })
  }

  /**
   * Limpa logs antigos (mais de 90 dias)
   */
  async cleanupOldLogs(): Promise<{ success: boolean; removed?: number; error?: string }> {
    try {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const { data, error } = await supabase
        .from('logs_atividade')
        .delete()
        .eq('tabela_afetada', 'taskmaster_tasks')
        .lt('criado_em', ninetyDaysAgo.toISOString())

      if (error) throw error

      console.log(`✅ Cleaned up old taskmaster audit logs (older than 90 days)`)
      return { success: true, removed: data?.length || 0 }
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Instância singleton para uso global
export const taskmasterAudit = new TaskmasterAuditOperations()

// Funções helper para uso direto
export const logTaskAction = (logData: TaskAuditLog) => taskmasterAudit.logTaskAction(logData)
export const getTaskLogs = (taskId: string) => taskmasterAudit.getTaskLogs(taskId)
export const getTaskmasterStats = () => taskmasterAudit.getTaskmasterStats()
export const logStatusChange = (taskId: string, previousStatus: string, newStatus: string, taskTitle?: string) => 
  taskmasterAudit.logStatusChange(taskId, previousStatus, newStatus, taskTitle)
export const logTaskCreated = (taskId: string, taskTitle: string, priority?: string) => 
  taskmasterAudit.logTaskCreated(taskId, taskTitle, priority)
export const logTaskCompleted = (taskId: string, taskTitle?: string) => 
  taskmasterAudit.logTaskCompleted(taskId, taskTitle)

export default taskmasterAudit