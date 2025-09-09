import { Router } from 'express';
import { z } from 'zod';
import { n8nService } from '../services/n8n.service';

const router = Router();

// Schemas de validação para requests
const ExecuteWorkflowSchema = z.object({
  workflowId: z.string(),
  data: z.any().optional(),
});

const GetExecutionsSchema = z.object({
  workflowId: z.string().optional(),
  status: z.enum(['new', 'running', 'success', 'failed', 'canceled', 'crashed', 'waiting']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const ToggleWorkflowSchema = z.object({
  active: z.boolean(),
});

/**
 * GET /api/n8n/test - Testa conexão com n8n
 */
router.get('/test', async (req, res) => {
  try {
    const result = await n8nService.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/n8n/workflows - Lista todos os workflows
 */
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await n8nService.getWorkflows();
    
    res.json({
      success: true,
      data: workflows.data,
      count: workflows.data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch workflows',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/n8n/workflows/:id - Obtém workflow específico
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await n8nService.getWorkflow(id);
    
    res.json({
      success: true,
      data: workflow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Workflow not found',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/n8n/workflows/:id/execute - Executa workflow
 */
router.post('/workflows/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    
    const execution = await n8nService.executeWorkflow(id, data);
    
    res.json({
      success: true,
      data: execution.data,
      message: 'Workflow execution started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to execute workflow',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * PATCH /api/n8n/workflows/:id/toggle - Ativa/desativa workflow
 */
router.patch('/workflows/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = ToggleWorkflowSchema.parse(req.body);
    
    const workflow = await n8nService.toggleWorkflow(id, active);
    
    res.json({
      success: true,
      data: workflow,
      message: `Workflow ${active ? 'activated' : 'deactivated'} successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.issues,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to toggle workflow',
        timestamp: new Date().toISOString()
      });
    }
  }
});

/**
 * GET /api/n8n/executions - Lista execuções
 */
router.get('/executions', async (req, res) => {
  try {
    const params = GetExecutionsSchema.parse(req.query);
    const executions = await n8nService.getExecutions(params);
    
    res.json({
      success: true,
      data: executions.data,
      count: executions.data.length,
      nextCursor: executions.nextCursor,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.issues,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch executions',
        timestamp: new Date().toISOString()
      });
    }
  }
});

/**
 * GET /api/n8n/executions/:id - Obtém execução específica
 */
router.get('/executions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const includeData = req.query.includeData === 'true';
    
    const execution = await n8nService.getExecution(id, includeData);
    
    res.json({
      success: true,
      data: execution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Execution not found',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/n8n/executions/:id/stop - Para execução
 */
router.post('/executions/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await n8nService.stopExecution(id);
    
    res.json({
      success: true,
      data: result.data,
      message: 'Execution stopped successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to stop execution',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as n8nRouter };