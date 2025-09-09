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

async function testN8nConnection() {
  console.log('🧪 Testando conexão com n8n...');
  console.log(`📍 URL: ${N8N_BASE_URL}`);
  console.log(`🔑 Token: ${N8N_API_SECRET ? 'Configurado ✅' : 'Não encontrado ❌'}`);
  
  if (!N8N_BASE_URL || !N8N_API_SECRET) {
    console.error('❌ Variáveis de ambiente N8N_BASE_URL ou N8N_API_SECRET não configuradas');
    return;
  }

  try {
    // Teste 1: Listar workflows
    console.log('\n📋 Teste 1: Listando workflows...');
    const response = await makeN8nRequest('/workflows');

    console.log(`✅ Sucesso!`);
    console.log(`📊 Workflows encontrados: ${response.data?.length || 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log('\n🔍 Workflows disponíveis:');
      response.data.forEach((workflow, index) => {
        console.log(`${index + 1}. ${workflow.name} (ID: ${workflow.id}) - ${workflow.active ? 'Ativo ✅' : 'Inativo ❌'}`);
      });
      
      // Teste 2: Obter detalhes do primeiro workflow
      const firstWorkflow = response.data[0];
      console.log(`\n🔍 Teste 2: Obtendo detalhes do workflow "${firstWorkflow.name}"...`);
      
      const workflowDetails = await makeN8nRequest(`/workflows/${firstWorkflow.id}`);
      
      console.log(`✅ Workflow obtido com sucesso`);
      console.log(`📝 Nome: ${workflowDetails.name}`);
      console.log(`🏷️ ID: ${workflowDetails.id}`);
      console.log(`📊 Nós: ${workflowDetails.nodes?.length || 0}`);
      console.log(`🔄 Ativo: ${workflowDetails.active ? 'Sim' : 'Não'}`);
    }

    // Teste 3: Listar execuções recentes
    console.log('\n📈 Teste 3: Listando execuções recentes...');
    const executions = await makeN8nRequest('/executions?limit=5');

    console.log(`✅ Execuções obtidas: ${executions.data?.length || 0}`);
    
    if (executions.data && executions.data.length > 0) {
      executions.data.forEach((execution, index) => {
        const status = execution.status;
        const statusEmoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : status === 'running' ? '🔄' : '⏸️';
        console.log(`${index + 1}. Execução ${execution.id} - ${statusEmoji} ${status} (${execution.startedAt})`);
      });
    }

    console.log('\n🎉 Todos os testes passaram! A integração com n8n está funcionando corretamente.');
    
  } catch (error) {
    console.error('\n❌ Erro na conexão com n8n:');
    console.error(`Mensagem: ${error.message}`);
    
    if (error.message.includes('401')) {
      console.error('🔑 Erro de autenticação - verifique se o token JWT está correto e não expirou');
    } else if (error.message.includes('404')) {
      console.error('🔍 Endpoint não encontrado - verifique se a URL base está correta');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('🌐 Erro de conexão - verifique se a URL do n8n está acessível');
    }
  }
}

// Executar teste
testN8nConnection();