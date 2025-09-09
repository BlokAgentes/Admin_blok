import { z } from 'zod';

// Schemas de validação
const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  nodes: z.array(z.any()),
  connections: z.any(),
  createdAt: z.string(),
  updatedAt: z.string(),
  versionId: z.string().optional(),
  tags: z.array(z.any()).optional(),
});

const ExecutionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  mode: z.string(),
  retryOf: z.string().optional(),
  startedAt: z.string(),
  stoppedAt: z.string().optional(),
  finished: z.boolean(),
  status: z.enum(['new', 'running', 'success', 'failed', 'canceled', 'crashed', 'waiting']),
  waitTill: z.string().optional(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
export type Execution = z.infer<typeof ExecutionSchema>;

export class N8nService {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor() {
    this.baseUrl = process.env.N8N_BASE_URL!;
    this.apiToken = process.env.N8N_API_SECRET!;
    
    if (!this.baseUrl || !this.apiToken) {
      throw new Error('N8N_BASE_URL and N8N_API_SECRET must be defined in environment variables');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-N8N-API-KEY': this.apiToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Lista todos os workflows
   */
  async getWorkflows(): Promise<{ data: Workflow[] }> {
    const result = await this.makeRequest('/workflows');
    return {
      data: result.data?.map((workflow: any) => WorkflowSchema.parse(workflow)) || []
    };
  }

  /**
   * Obtém um workflow específico por ID
   */
  async getWorkflow(workflowId: string): Promise<Workflow> {
    const result = await this.makeRequest(`/workflows/${workflowId}`);
    return WorkflowSchema.parse(result);
  }

  /**
   * Executa um workflow
   */
  async executeWorkflow(workflowId: string, data?: any): Promise<{ data: { executionId: string } }> {
    const payload = data ? { triggerData: data } : {};
    
    const result = await this.makeRequest(`/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    return result;
  }

  /**
   * Lista execuções de workflows
   */
  async getExecutions(params?: {
    workflowId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Execution[], nextCursor?: string }> {
    const searchParams = new URLSearchParams();
    
    if (params?.workflowId) searchParams.set('workflowId', params.workflowId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const endpoint = `/executions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const result = await this.makeRequest(endpoint);
    
    return {
      data: result.data?.map((execution: any) => ExecutionSchema.parse(execution)) || [],
      nextCursor: result.nextCursor
    };
  }

  /**
   * Obtém uma execução específica
   */
  async getExecution(executionId: string, includeData: boolean = false): Promise<Execution> {
    const endpoint = `/executions/${executionId}${includeData ? '?includeData=true' : ''}`;
    const result = await this.makeRequest(endpoint);
    return ExecutionSchema.parse(result);
  }

  /**
   * Para uma execução em andamento
   */
  async stopExecution(executionId: string): Promise<{ data: { success: boolean } }> {
    const result = await this.makeRequest(`/executions/${executionId}/stop`, {
      method: 'POST',
    });
    return result;
  }

  /**
   * Ativa/desativa um workflow
   */
  async toggleWorkflow(workflowId: string, active: boolean): Promise<Workflow> {
    const result = await this.makeRequest(`/workflows/${workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
    return WorkflowSchema.parse(result);
  }

  /**
   * Testa a conexão com a API do n8n
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.makeRequest('/workflows?limit=1');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const n8nService = new N8nService();