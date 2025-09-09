import { dataCollector } from '../services/n8n-data-collector';

export class SyncScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Inicia a sincronização periódica
   */
  start(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('[SyncScheduler] Scheduler já está em execução');
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    
    console.log(`[SyncScheduler] Iniciando sincronização periódica a cada ${intervalMinutes} minutos`);
    
    // Executar uma vez imediatamente
    this.runSync();
    
    // Agendar execuções periódicas
    this.intervalId = setInterval(() => {
      this.runSync();
    }, intervalMs);
    
    this.isRunning = true;
  }

  /**
   * Para a sincronização periódica
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('[SyncScheduler] Sincronização periódica parada');
  }

  /**
   * Verifica se está em execução
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Executa uma sincronização
   */
  private async runSync(): Promise<void> {
    try {
      console.log('[SyncScheduler] Iniciando ciclo de sincronização');
      const startTime = Date.now();
      
      await dataCollector.scheduledSync();
      
      const duration = Date.now() - startTime;
      console.log(`[SyncScheduler] Ciclo de sincronização concluído em ${duration}ms`);
      
    } catch (error) {
      console.error('[SyncScheduler] Erro no ciclo de sincronização:', error);
    }
  }

  /**
   * Força uma sincronização imediata
   */
  async forceSync(): Promise<void> {
    console.log('[SyncScheduler] Forçando sincronização imediata');
    await this.runSync();
  }
}

// Instância global do scheduler
export const syncScheduler = new SyncScheduler();

// Auto-start apenas se não estiver em desenvolvimento
if (process.env.NODE_ENV !== 'development') {
  syncScheduler.start(5); // 5 minutos
} else {
  console.log('[SyncScheduler] Modo desenvolvimento - sincronização automática desabilitada');
}