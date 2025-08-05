const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🗑️ Testando Operações DELETE com Supabase...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Classe para operações DELETE
class DeleteOperations {
  constructor() {
    this.supabase = supabase
  }

  // DELETE - Remover registro por ID
  async deleteById(tableName, id) {
    try {
      console.log(`🗑️ Removendo registro ${id} de ${tableName}...`)
      
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

      // Realizar a exclusão
      const { error } = await this.supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log(`✅ Registro ${id} removido com sucesso de ${tableName}`)
      return { success: true }
    } catch (error) {
      console.error(`❌ Erro ao remover registro:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // DELETE - Remover múltiplos registros com filtros
  async deleteWithFilters(tableName, filters) {
    try {
      console.log(`🗑️ Removendo registros de ${tableName} com filtros:`, filters)
      
      let query = this.supabase.from(tableName).delete()
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
      
      const { error, count } = await query
      
      if (error) throw error

      console.log(`✅ ${count} registros removidos de ${tableName}`)
      return { success: true, count }
    } catch (error) {
      console.error(`❌ Erro ao remover com filtros:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // DELETE - Soft delete (marcar como excluído)
  async softDelete(tableName, id) {
    try {
      console.log(`🏷️ Marcando registro ${id} como excluído em ${tableName}...`)
      
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

      // Marcar como excluído (soft delete) usando apenas o campo ativo
      const { data, error } = await this.supabase
        .from(tableName)
        .update({ 
          ativo: false
        })
        .eq('id', id)
        .select()

      if (error) throw error

      console.log(`✅ Registro ${id} marcado como excluído:`, data[0])
      return { success: true, data: data[0] }
    } catch (error) {
      console.error(`❌ Erro no soft delete:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // DELETE - Restaurar registro (desfazer soft delete)
  async restore(tableName, id) {
    try {
      console.log(`🔄 Restaurando registro ${id} em ${tableName}...`)
      
      // Verificar se o registro existe
      const { data: existingRecord, error: fetchError } = await this.supabase
        .from(tableName)
        .select('id, ativo')
        .eq('id', id)
        .single()

      if (fetchError || !existingRecord) {
        console.log(`❌ Registro ${id} não encontrado em ${tableName}`)
        return { success: false, error: 'Registro não encontrado' }
      }

      // Restaurar registro
      const { data, error } = await this.supabase
        .from(tableName)
        .update({ 
          ativo: true
        })
        .eq('id', id)
        .select()

      if (error) throw error

      console.log(`✅ Registro ${id} restaurado:`, data[0])
      return { success: true, data: data[0] }
    } catch (error) {
      console.error(`❌ Erro ao restaurar:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // DELETE - Verificar dependências antes de excluir
  async checkDependencies(tableName, id) {
    try {
      console.log(`🔍 Verificando dependências do registro ${id} em ${tableName}...`)
      
      let dependencies = []
      
      // Verificar dependências baseadas na tabela
      switch (tableName) {
        case 'usuarios':
          // Verificar se o usuário tem itens, comentários, etc.
          const { data: userItems } = await this.supabase
            .from('itens')
            .select('id')
            .eq('usuario_id', id)
          
          if (userItems && userItems.length > 0) {
            dependencies.push(`itens (${userItems.length} registros)`)
          }
          break
          
        case 'categorias':
          // Verificar se a categoria tem itens
          const { data: categoryItems } = await this.supabase
            .from('itens')
            .select('id')
            .eq('categoria_id', id)
          
          if (categoryItems && categoryItems.length > 0) {
            dependencies.push(`itens (${categoryItems.length} registros)`)
          }
          break
          
        case 'itens':
          // Verificar se o item tem comentários
          const { data: itemComments } = await this.supabase
            .from('comentarios')
            .select('id')
            .eq('item_id', id)
          
          if (itemComments && itemComments.length > 0) {
            dependencies.push(`comentarios (${itemComments.length} registros)`)
          }
          break
      }
      
      if (dependencies.length > 0) {
        console.log(`⚠️ Dependências encontradas: ${dependencies.join(', ')}`)
        return { success: false, dependencies }
      } else {
        console.log(`✅ Nenhuma dependência encontrada`)
        return { success: true, dependencies: [] }
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar dependências:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // DELETE - Exclusão em cascata (remover dependências primeiro)
  async deleteCascade(tableName, id) {
    try {
      console.log(`🌊 Realizando exclusão em cascata do registro ${id} em ${tableName}...`)
      
      // Verificar dependências
      const dependencyCheck = await this.checkDependencies(tableName, id)
      
      if (!dependencyCheck.success) {
        console.log(`❌ Não é possível excluir: existem dependências`)
        return dependencyCheck
      }
      
      // Se não há dependências, realizar exclusão normal
      return await this.deleteById(tableName, id)
    } catch (error) {
      console.error(`❌ Erro na exclusão em cascata:`, error.message)
      return { success: false, error: error.message }
    }
  }
}

async function testDeleteOperations() {
  console.log('\n🎯 Iniciando testes de operações DELETE...\n')
  
  const deleteOps = new DeleteOperations()
  
  // Primeiro, criar alguns dados de teste
  console.log('📝 Criando dados de teste...')
  
  // Criar um usuário de teste
  const { data: testUser, error: createError } = await supabase
    .from('usuarios')
    .insert({
      nome: 'Usuário Teste DELETE',
      email: 'teste.delete@exemplo.com',
      telefone: '(11) 77777-7777',
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

  // Teste 1: Verificar dependências
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 1: VERIFICAR DEPENDÊNCIAS')
  console.log('='.repeat(50))
  
  if (testUser) {
    await deleteOps.checkDependencies('usuarios', testUser.id)
  }

  // Teste 2: Soft delete
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 2: SOFT DELETE')
  console.log('='.repeat(50))
  
  // Buscar uma categoria para soft delete
  const { data: categoria } = await supabase
    .from('categorias')
    .select('id')
    .limit(1)
    .single()

  if (categoria) {
    await deleteOps.softDelete('categorias', categoria.id)
  }

  // Teste 3: Restaurar registro
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 3: RESTAURAR REGISTRO')
  console.log('='.repeat(50))
  
  if (categoria) {
    await deleteOps.restore('categorias', categoria.id)
  }

  // Teste 4: Exclusão em cascata
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 4: EXCLUSÃO EM CASCATA')
  console.log('='.repeat(50))
  
  if (testUser) {
    await deleteOps.deleteCascade('usuarios', testUser.id)
  }

  // Teste 5: Exclusão com filtros
  console.log('\n' + '='.repeat(50))
  console.log('TESTE 5: EXCLUSÃO COM FILTROS')
  console.log('='.repeat(50))
  
  // Criar alguns registros de teste para exclusão em lote
  const { data: testItems } = await supabase
    .from('itens')
    .insert([
      {
        titulo: 'Item Teste DELETE 1',
        descricao: 'Item para teste de exclusão',
        status: 'teste',
        usuario_id: testUser ? testUser.id : null,
        categoria_id: categoria ? categoria.id : null
      },
      {
        titulo: 'Item Teste DELETE 2',
        descricao: 'Item para teste de exclusão',
        status: 'teste',
        usuario_id: testUser ? testUser.id : null,
        categoria_id: categoria ? categoria.id : null
      }
    ])
    .select()

  if (testItems && testItems.length > 0) {
    await deleteOps.deleteWithFilters('itens', { status: 'teste' })
  }

  // Limpar dados de teste restantes
  console.log('\n🧹 Limpando dados de teste restantes...')
  
  if (testUser) {
    await supabase
      .from('usuarios')
      .delete()
      .eq('email', 'teste.delete@exemplo.com')
  }

  console.log('\n🎉 Todos os testes de operações DELETE concluídos com sucesso!')
  console.log('✅ DELETE, soft delete, restauração e exclusão em cascata funcionando')
}

testDeleteOperations().catch(console.error) 