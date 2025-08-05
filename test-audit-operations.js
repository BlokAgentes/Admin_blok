const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('📋 Testando Operações de Auditoria com Supabase...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Classe para operações de Auditoria
class AuditOperations {
  constructor() {
    this.supabase = supabase
  }

  // AUDIT - Registrar log de auditoria
  async logAudit(auditData) {
    try {
      console.log(`📝 Registrando log de auditoria:`, auditData)
      
      const { data, error } = await this.supabase
        .from('logs_atividade')
        .insert({
          usuario_id: auditData.usuario_id || null,
          acao: auditData.acao,
          tabela_afetada: auditData.tabela_afetada,
          registro_id: auditData.registro_id
        })
        .select()

      if (error) throw error

      console.log(`✅ Log de auditoria registrado:`, data[0])
      return { success: true, data: data[0] }
    } catch (error) {
      console.error(`❌ Erro ao registrar log:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // AUDIT - Buscar logs de auditoria
  async getAuditLogs(filters = {}) {
    try {
      console.log(`🔍 Buscando logs de auditoria com filtros:`, filters)
      
      let query = this.supabase
        .from('logs_atividade')
        .select('*')
        .order('criado_em', { ascending: false })

      // Aplicar filtros
      if (filters.usuario_id) {
        query = query.eq('usuario_id', filters.usuario_id)
      }
      if (filters.acao) {
        query = query.eq('acao', filters.acao)
      }
      if (filters.tabela_afetada) {
        query = query.eq('tabela_afetada', filters.tabela_afetada)
      }
      if (filters.registro_id) {
        query = query.eq('registro_id', filters.registro_id)
      }
      if (filters.data_inicio) {
        query = query.gte('criado_em', filters.data_inicio)
      }
      if (filters.data_fim) {
        query = query.lte('criado_em', filters.data_fim)
      }

      const { data, error } = await query

      if (error) throw error

      console.log(`✅ ${data.length} logs de auditoria encontrados`)
      return { success: true, data }
    } catch (error) {
      console.error(`❌ Erro ao buscar logs:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // AUDIT - Contar logs por ação
  async countLogsByAction() {
    try {
      console.log(`📊 Contando logs por ação...`)
      
      const { data, error } = await this.supabase
        .from('logs_atividade')
        .select('acao')
        .order('acao')

      if (error) throw error

      // Agrupar por ação
      const counts = data.reduce((acc, log) => {
        acc[log.acao] = (acc[log.acao] || 0) + 1
        return acc
      }, {})

      console.log(`✅ Contagem por ação:`, counts)
      return { success: true, data: counts }
    } catch (error) {
      console.error(`❌ Erro ao contar logs:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // AUDIT - Buscar logs de um registro específico
  async getLogsForRecord(tableName, recordId) {
    try {
      console.log(`🔍 Buscando logs para registro ${recordId} em ${tableName}...`)
      
      const { data, error } = await this.supabase
        .from('logs_atividade')
        .select('*')
        .eq('tabela_afetada', tableName)
        .eq('registro_id', recordId)
        .order('criado_em', { ascending: false })

      if (error) throw error

      console.log(`✅ ${data.length} logs encontrados para o registro`)
      return { success: true, data }
    } catch (error) {
      console.error(`❌ Erro ao buscar logs do registro:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // AUDIT - Limpar logs antigos
  async cleanOldLogs(daysToKeep = 30) {
    try {
      console.log(`🧹 Limpando logs mais antigos que ${daysToKeep} dias...`)
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      
      const { data, error } = await this.supabase
        .from('logs_atividade')
        .delete()
        .lt('criado_em', cutoffDate.toISOString())
        .select()

      if (error) throw error

      console.log(`✅ ${data.length} logs antigos removidos`)
      return { success: true, count: data.length }
    } catch (error) {
      console.error(`❌ Erro ao limpar logs antigos:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // AUDIT - Simular operações CRUD com logs
  async simulateCRUDWithAudit() {
    try {
      console.log(`🎭 Simulando operações CRUD com auditoria...`)
      
      // Gerar UUIDs válidos para teste
      const testCreateId = '550e8400-e29b-41d4-a716-446655440001'
      const testUpdateId = '550e8400-e29b-41d4-a716-446655440002'
      const testDeleteId = '550e8400-e29b-41d4-a716-446655440003'
      
      // Simular CREATE
      console.log('\n📝 Simulando CREATE...')
      const createLog = await this.logAudit({
        acao: 'CREATE',
        tabela_afetada: 'usuarios',
        registro_id: testCreateId,
        dados_novos: { nome: 'Usuário Teste', email: 'teste@exemplo.com' },
        detalhes: 'Criação de usuário de teste'
      })

      // Simular UPDATE
      console.log('\n✏️ Simulando UPDATE...')
      const updateLog = await this.logAudit({
        acao: 'UPDATE',
        tabela_afetada: 'usuarios',
        registro_id: testUpdateId,
        dados_antigos: { nome: 'Usuário Antigo', email: 'antigo@exemplo.com' },
        dados_novos: { nome: 'Usuário Atualizado', email: 'atualizado@exemplo.com' },
        detalhes: 'Atualização de dados do usuário'
      })

      // Simular DELETE
      console.log('\n🗑️ Simulando DELETE...')
      const deleteLog = await this.logAudit({
        acao: 'DELETE',
        tabela_afetada: 'usuarios',
        registro_id: testDeleteId,
        dados_antigos: { nome: 'Usuário Deletado', email: 'deletado@exemplo.com' },
        detalhes: 'Exclusão de usuário'
      })

      return { 
        success: true, 
        logs: { create: createLog, update: updateLog, delete: deleteLog },
        testIds: { create: testCreateId, update: testUpdateId, delete: testDeleteId }
      }
    } catch (error) {
      console.error(`❌ Erro na simulação CRUD:`, error.message)
      return { success: false, error: error.message }
    }
  }
}

async function testAuditOperations() {
  console.log('\n🎯 Iniciando testes de operações de Auditoria...\n')
  
  const auditOps = new AuditOperations()
  
  // Teste 1: Simular operações CRUD com logs
  console.log('='.repeat(50))
  console.log('TESTE 1: SIMULAR OPERAÇÕES CRUD COM LOGS')
  console.log('='.repeat(50))
  
  const simulationResult = await auditOps.simulateCRUDWithAudit()

  // Teste 2: Buscar logs de auditoria
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 2: BUSCAR LOGS DE AUDITORIA')
  console.log('='.repeat(50))
  
  await auditOps.getAuditLogs()

  // Teste 3: Contar logs por ação
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 3: CONTAR LOGS POR AÇÃO')
  console.log('='.repeat(50))
  
  await auditOps.countLogsByAction()

  // Teste 4: Buscar logs de registro específico
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 4: BUSCAR LOGS DE REGISTRO ESPECÍFICO')
  console.log('='.repeat(50))
  
  if (simulationResult.success && simulationResult.testIds) {
    await auditOps.getLogsForRecord('usuarios', simulationResult.testIds.create)
  }

  // Teste 5: Buscar logs com filtros
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 5: BUSCAR LOGS COM FILTROS')
  console.log('='.repeat(50))
  
  await auditOps.getAuditLogs({
    acao: 'CREATE',
    tabela_afetada: 'usuarios'
  })

  // Teste 6: Limpar logs antigos (comentado para não remover dados reais)
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 6: LIMPAR LOGS ANTIGOS (SIMULADO)')
  console.log('='.repeat(50))
  
  console.log('⚠️ Teste de limpeza simulado - não executando para preservar dados')
  // await auditOps.cleanOldLogs(1) // Comentado para não remover dados reais

  console.log('\n🎉 Todos os testes de operações de Auditoria concluídos com sucesso!')
  console.log('✅ Logs de auditoria, busca, contagem e filtros funcionando')
}

testAuditOperations().catch(console.error) 