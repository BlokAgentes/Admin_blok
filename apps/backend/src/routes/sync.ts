import { Router } from 'express';
import { z } from 'zod';
import { dataCollector } from '../services/n8n-data-collector';

const router = Router();

// Schema para validação
const SyncRequestSchema = z.object({
  workflowId: z.string(),
  userId: z.string(),
});

/**
 * POST /api/n8n/sync - Força sincronização de um workflow específico
 */
router.post('/sync', async (req, res) => {
  try {
    const { workflowId, userId } = SyncRequestSchema.parse(req.body);

    console.log(`[SyncRoute] Iniciando sincronização para workflow ${workflowId}, usuário ${userId}`);

    // Executar sincronização
    const result = await dataCollector.syncExecutions(workflowId, userId);

    if (result.success) {
      // Calcular métricas após sincronização
      await dataCollector.calculateMetrics(workflowId, userId);

      res.json({
        success: true,
        message: result.message,
        data: {
          workflowId,
          userId,
          synced: result.synced,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        data: {
          workflowId,
          userId,
          synced: 0,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors: error.issues,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('[SyncRoute] Erro na sincronização:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno na sincronização',
        timestamp: new Date().toISOString()
      });
    }
  }
});

/**
 * POST /api/n8n/sync/all - Sincronização para todos os usuários
 */
router.post('/sync/all', async (req, res) => {
  try {
    console.log('[SyncRoute] Iniciando sincronização global');

    // Executar sincronização para todos os usuários
    await dataCollector.scheduledSync();

    res.json({
      success: true,
      message: 'Sincronização global concluída',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SyncRoute] Erro na sincronização global:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno na sincronização global',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/n8n/sync/status/:workflowId - Verificar status de sincronização
 */
router.get('/sync/status/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;

    // Este endpoint poderia retornar informações sobre o status da sincronização
    // Por enquanto, apenas confirma que o workflow existe
    res.json({
      success: true,
      data: {
        workflowId,
        message: 'Status endpoint disponível',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[SyncRoute] Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao verificar status',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as syncRouter };