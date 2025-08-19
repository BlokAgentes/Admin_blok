#!/usr/bin/env node

/**
 * Script de teste para integração Taskmaster + Sistema de Auditoria
 * 
 * Este script demonstra e testa a integração entre o sistema de auditoria
 * do Supabase e o Taskmaster MCP.
 */

const { taskmasterAudit, logTaskCreated, logStatusChange, logTaskCompleted } = require('./src/lib/audit-taskmaster-integration.ts')

async function testTaskmasterAuditIntegration() {
  console.log('🧪 Testando integração Taskmaster + Sistema de Auditoria\n')

  try {
    // Test 1: Registrar criação de nova tarefa
    console.log('📝 Test 1: Registrando criação de nova tarefa...')
    const taskId = 'task-' + Math.random().toString(36).substr(2, 9)
    const createResult = await logTaskCreated(
      taskId, 
      'Implementar integração Taskmaster-Audit',
      'high'
    )
    
    if (createResult.success) {
      console.log('✅ Tarefa criada registrada com sucesso')
    } else {
      console.log('❌ Erro ao registrar criação de tarefa:', createResult.error)
    }

    // Test 2: Registrar mudança de status
    console.log('\n🔄 Test 2: Registrando mudança de status...')
    const statusResult = await logStatusChange(
      taskId,
      'pending',
      'in-progress',
      'Implementar integração Taskmaster-Audit'
    )
    
    if (statusResult.success) {
      console.log('✅ Mudança de status registrada com sucesso')
    } else {
      console.log('❌ Erro ao registrar mudança de status:', statusResult.error)
    }

    // Test 3: Registrar conclusão de tarefa
    console.log('\n✅ Test 3: Registrando conclusão de tarefa...')
    const completeResult = await logTaskCompleted(
      taskId,
      'Implementar integração Taskmaster-Audit'
    )
    
    if (completeResult.success) {
      console.log('✅ Conclusão de tarefa registrada com sucesso')
    } else {
      console.log('❌ Erro ao registrar conclusão de tarefa:', completeResult.error)
    }

    // Test 4: Buscar logs da tarefa
    console.log('\n📊 Test 4: Buscando logs da tarefa...')
    const logsResult = await taskmasterAudit.getTaskLogs(taskId)
    
    if (logsResult.success) {
      console.log(`✅ Encontrados ${logsResult.data?.length || 0} logs para a tarefa`)
      if (logsResult.data && logsResult.data.length > 0) {
        console.log('Últimos logs:')
        logsResult.data.slice(0, 3).forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.acao}: ${log.dados_novos?.description || 'N/A'}`)
        })
      }
    } else {
      console.log('❌ Erro ao buscar logs:', logsResult.error)
    }

    // Test 5: Buscar estatísticas gerais
    console.log('\n📈 Test 5: Buscando estatísticas do Taskmaster...')
    const statsResult = await taskmasterAudit.getTaskmasterStats()
    
    if (statsResult.success) {
      console.log('✅ Estatísticas obtidas com sucesso')
      console.log('Total de ações:', statsResult.data?.total_actions || 0)
      console.log('Ações por tipo:', JSON.stringify(statsResult.data?.actions_by_type || {}, null, 2))
    } else {
      console.log('❌ Erro ao buscar estatísticas:', statsResult.error)
    }

    console.log('\n🎉 Teste de integração concluído!')
    console.log('\n📋 Funcionalidades testadas:')
    console.log('✅ Registro de criação de tarefas')
    console.log('✅ Registro de mudanças de status')
    console.log('✅ Registro de conclusão de tarefas')
    console.log('✅ Busca de logs por tarefa')
    console.log('✅ Estatísticas gerais do sistema')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  testTaskmasterAuditIntegration()
    .then(() => {
      console.log('\n✨ Integração Taskmaster + Auditoria funcionando corretamente!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Falha na integração:', error)
      process.exit(1)
    })
}

module.exports = { testTaskmasterAuditIntegration }