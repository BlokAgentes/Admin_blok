require('dotenv').config();

const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_SECRET = process.env.N8N_API_SECRET;

async function makeN8nRequest(endpoint) {
  const response = await fetch(`${N8N_BASE_URL}/api/v1${endpoint}`, {
    headers: {
      'X-N8N-API-KEY': N8N_API_SECRET,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

async function getExecutions() {
  try {
    console.log('📊 EXECUÇÕES DOS WORKFLOWS N8N');
    console.log('═'.repeat(80));
    
    // Buscar execuções
    const executions = await makeN8nRequest('/executions?limit=50');
    console.log(`Total de execuções encontradas: ${executions.data?.length || 0}`);
    console.log('');
    
    if (executions.data && executions.data.length > 0) {
      // Buscar workflows para mapear IDs para nomes
      const workflows = await makeN8nRequest('/workflows');
      const workflowMap = {};
      workflows.data.forEach(wf => {
        workflowMap[wf.id] = wf.name;
      });
      
      executions.data.forEach((execution, index) => {
        const status = execution.status || 'unknown';
        const statusEmoji = {
          'success': '✅',
          'failed': '❌', 
          'running': '🔄',
          'waiting': '⏳',
          'canceled': '⏹️',
          'new': '🆕',
          'crashed': '💥'
        }[status] || '❓';
        
        const startDate = execution.startedAt ? 
          new Date(execution.startedAt).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A';
        
        const endDate = execution.stoppedAt ? 
          new Date(execution.stoppedAt).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit', 
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Em andamento';
        
        const duration = execution.startedAt && execution.stoppedAt ? 
          Math.round((new Date(execution.stoppedAt) - new Date(execution.startedAt)) / 1000) + 's' : 'N/A';
        
        const workflowName = workflowMap[execution.workflowId] || 'Nome não encontrado';
        
        console.log(`${index + 1}. 🆔 ID: ${execution.id}`);
        console.log(`   📊 Status: ${statusEmoji} ${status.toUpperCase()}`);
        console.log(`   📋 Workflow: ${workflowName}`);
        console.log(`   🔗 Workflow ID: ${execution.workflowId}`);
        console.log(`   ⚙️  Modo: ${execution.mode || 'N/A'}`);
        console.log(`   🕐 Iniciado: ${startDate}`);
        console.log(`   🏁 Finalizado: ${endDate}`);
        console.log(`   ⏱️  Duração: ${duration}`);
        if (execution.retryOf) {
          console.log(`   🔄 Retry de: ${execution.retryOf}`);
        }
        console.log('   ' + '─'.repeat(70));
      });
      
      // Estatísticas
      const statusCount = {};
      executions.data.forEach(exec => {
        const status = exec.status || 'unknown';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      console.log('\n📈 ESTATÍSTICAS DAS EXECUÇÕES:');
      console.log('═'.repeat(40));
      Object.entries(statusCount).forEach(([status, count]) => {
        const statusEmoji = {
          'success': '✅',
          'failed': '❌', 
          'running': '🔄',
          'waiting': '⏳',
          'canceled': '⏹️',
          'new': '🆕',
          'crashed': '💥'
        }[status] || '❓';
        console.log(`${statusEmoji} ${status.toUpperCase()}: ${count} execuções`);
      });
      
    } else {
      console.log('Nenhuma execução encontrada.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar execuções:', error.message);
  }
}

getExecutions();