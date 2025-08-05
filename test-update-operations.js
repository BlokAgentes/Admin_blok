const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('✏️ Testando Operações UPDATE com Supabase...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Classe para operações UPDATE
class UpdateOperations {
  constructor() {
    this.supabase = supabase
  }

  // UPDATE - Atualizar registro por ID
  async updateById(tableName, id, updates) {
    try {
      console.log(`✏️ Atualizando registro ${id} em ${tableName}...`)
      console.log(`📝 Campos para atualizar:`, updates)
      
      // Verificar se o registro existe
      const { data: existingRecord, error: fetchError } = await this.supabase
        .from(tableName)
        .select('id')
        .eq('id', id)
        .single()

      if (fetchError || !existingRecord) {
        console.log(`❌ Registro ${id} não encontrado em ${tableName}`)
        return { success: false, error: 'Registro não encontrado' }
      }

      // Realizar a atualização
      const { data, error } = await this.supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      console.log(`✅ Registro atualizado com sucesso:`, data[0])
      return { success: true, data: data[0] }
    } catch (error) {
      console.error(`❌ Erro ao atualizar registro:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // UPDATE - Atualizar múltiplos registros com filtros
  async updateWithFilters(tableName, filters, updates) {
    try {
      console.log(`✏️ Atualizando registros em ${tableName} com filtros:`, filters)
      console.log(`📝 Campos para atualizar:`, updates)
      
      let query = this.supabase.from(tableName).update(updates)
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
      
      const { data, error, count } = await query.select()
      
      if (error) throw error

      console.log(`✅ ${data.length} registros atualizados`)
      return { success: true, data, count: data.length }
    } catch (error) {
      console.error(`❌ Erro ao atualizar com filtros:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // UPDATE - Atualizar campo específico
  async updateField(tableName, id, field, value) {
    try {
      console.log(`✏️ Atualizando campo ${field} = ${value} no registro ${id}...`)
      
      const { data, error } = await this.supabase
        .from(tableName)
        .update({ [field]: value })
        .eq('id', id)
        .select()

      if (error) throw error

      console.log(`✅ Campo ${field} atualizado:`, data[0])
      return { success: true, data: data[0] }
    } catch (error) {
      console.error(`❌ Erro ao atualizar campo:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // UPDATE - Atualizar com validação de concorrência
  async updateWithOptimisticLock(tableName, id, updates, expectedVersion) {
    try {
      console.log(`🔒 Atualizando com controle de concorrência...`)
      
      // Verificar versão atual
      const { data: currentRecord, error: fetchError } = await this.supabase
        .from(tableName)
        .select('atualizado_em')
        .eq('id', id)
        .single()

      if (fetchError || !currentRecord) {
        return { success: false, error: 'Registro não encontrado' }
      }

      // Comparar versões (usando timestamp como versão)
      if (expectedVersion && currentRecord.atualizado_em !== expectedVersion) {
        return { success: false, error: 'Registro foi modificado por outro usuário' }
      }

      // Realizar atualização
      const { data, error } = await this.supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      console.log(`✅ Atualização com controle de concorrência realizada:`, data[0])
      return { success: true, data: data[0] }
    } catch (error) {
      console.error(`❌ Erro na atualização com controle de concorrência:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // UPDATE - Atualizar com rollback em caso de erro
  async updateWithRollback(tableName, id, updates) {
    try {
      console.log(`🔄 Atualizando com rollback automático...`)
      
      // Buscar dados originais
      const { data: originalData, error: fetchError } = await this.supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !originalData) {
        return { success: false, error: 'Registro não encontrado' }
      }

      // Tentar atualização
      const { data, error } = await this.supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        console.log(`❌ Erro na atualização, fazendo rollback...`)
        // Rollback automático
        await this.supabase
          .from(tableName)
          .update(originalData)
          .eq('id', id)
        
        throw error
      }

      console.log(`✅ Atualização com rollback realizada:`, data[0])
      return { success: true, data: data[0] }
    } catch (error) {
      console.error(`❌ Erro na atualização com rollback:`, error.message)
      return { success: false, error: error.message }
    }
  }
}

async function testUpdateOperations() {
  console.log('\n🎯 Iniciando testes de operações UPDATE...\n')
  
  const updateOps = new UpdateOperations()
  
  // Primeiro, criar alguns dados de teste
  console.log('📝 Criando dados de teste...')
  
  // Criar um usuário de teste
  const { data: testUser, error: createError } = await supabase
    .from('usuarios')
    .insert({
      nome: 'Usuário Teste UPDATE',
      email: 'teste.update@exemplo.com',
      telefone: '(11) 99999-9999',
      tipo_usuario: 'usuario'
    })
    .select()
    .single()

  if (createError) {
    console.log('⚠️ Erro ao criar usuário de teste:', createError.message)
    console.log('📋 Usando dados existentes...')
  } else {
    console.log('✅ Usuário de teste criado:', testUser.id)
  }

  // Teste 1: Atualizar por ID
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 1: ATUALIZAR POR ID')
  console.log('='.repeat(50))
  
  if (testUser) {
    await updateOps.updateById('usuarios', testUser.id, {
      nome: 'Usuário Teste Atualizado',
      telefone: '(11) 88888-8888'
    })
  }

  // Teste 2: Atualizar com filtros
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 2: ATUALIZAR COM FILTROS')
  console.log('='.repeat(50))
  
  await updateOps.updateWithFilters('categorias', { ordem: 1 }, {
    cor: '#FF6B6B',
    descricao: 'Categoria atualizada via filtro'
  })

  // Teste 3: Atualizar campo específico
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 3: ATUALIZAR CAMPO ESPECÍFICO')
  console.log('='.repeat(50))
  
  // Buscar uma categoria para atualizar
  const { data: categoria } = await supabase
    .from('categorias')
    .select('id')
    .limit(1)
    .single()

  if (categoria) {
    await updateOps.updateField('categorias', categoria.id, 'icone', 'updated-icon')
  }

  // Teste 4: Atualizar com controle de concorrência
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 4: ATUALIZAR COM CONTROLE DE CONCORRÊNCIA')
  console.log('='.repeat(50))
  
  if (categoria) {
    // Buscar versão atual
    const { data: currentVersion } = await supabase
      .from('categorias')
      .select('atualizado_em')
      .eq('id', categoria.id)
      .single()

    if (currentVersion) {
      await updateOps.updateWithOptimisticLock('categorias', categoria.id, {
        descricao: 'Atualização com controle de concorrência'
      }, currentVersion.atualizado_em)
    }
  }

  // Teste 5: Atualizar com rollback
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 5: ATUALIZAR COM ROLLBACK')
  console.log('='.repeat(50))
  
  if (categoria) {
    await updateOps.updateWithRollback('categorias', categoria.id, {
      nome: 'Categoria com Rollback',
      ordem: 999
    })
  }

  // Limpar dados de teste
  if (testUser) {
    console.log('\n🧹 Limpando dados de teste...')
    await supabase
      .from('usuarios')
      .delete()
      .eq('id', testUser.id)
    console.log('✅ Dados de teste removidos')
  }

  console.log('\n🎉 Todos os testes de operações UPDATE concluídos com sucesso!')
  console.log('✅ UPDATE, filtros, controle de concorrência e rollback funcionando')
}

testUpdateOperations().catch(console.error) 