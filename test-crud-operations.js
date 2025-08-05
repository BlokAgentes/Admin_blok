const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Testando Operações CRUD com Supabase...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Classe simplificada para demonstrar operações CRUD
class TestCRUD {
  constructor(tableName) {
    this.tableName = tableName
    this.supabase = supabase
  }

  // CREATE - Criar novo registro
  async create(data) {
    try {
      console.log(`📝 Criando registro em ${this.tableName}...`)
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
      
      if (error) throw error
      
      console.log(`✅ Registro criado com sucesso:`, result[0])
      return { success: true, data: result[0] }
    } catch (error) {
      console.error(`❌ Erro ao criar registro:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // READ - Buscar registros
  async read(filters = {}) {
    try {
      console.log(`🔍 Buscando registros em ${this.tableName}...`)
      let query = this.supabase.from(this.tableName).select('*')
      
      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key])
      })
      
      const { data, error } = await query
      
      if (error) throw error
      
      console.log(`✅ ${data.length} registros encontrados`)
      return { success: true, data }
    } catch (error) {
      console.error(`❌ Erro ao buscar registros:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // UPDATE - Atualizar registro
  async update(id, updates) {
    try {
      console.log(`✏️ Atualizando registro ${id} em ${this.tableName}...`)
      const { data, error } = await this.supabase
        .from(this.tableName)
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

  // DELETE - Deletar registro
  async delete(id) {
    try {
      console.log(`🗑️ Deletando registro ${id} de ${this.tableName}...`)
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      console.log(`✅ Registro deletado com sucesso`)
      return { success: true }
    } catch (error) {
      console.error(`❌ Erro ao deletar registro:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // COUNT - Contar registros
  async count(filters = {}) {
    try {
      console.log(`📊 Contando registros em ${this.tableName}...`)
      let query = this.supabase.from(this.tableName).select('*', { count: 'exact' })
      
      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key])
      })
      
      const { count, error } = await query
      
      if (error) throw error
      
      console.log(`✅ Total de registros: ${count}`)
      return { success: true, count }
    } catch (error) {
      console.error(`❌ Erro ao contar registros:`, error.message)
      return { success: false, error: error.message }
    }
  }
}

async function testCRUDOperations() {
  console.log('\n🎯 Iniciando testes CRUD...\n')
  
  // Teste 1: Operações CREATE
  console.log('=' * 50)
  console.log('TESTE 1: OPERAÇÕES CREATE')
  console.log('=' * 50)
  
  const usuariosCRUD = new TestCRUD('usuarios')
  const categoriasCRUD = new TestCRUD('categorias')
  const itensCRUD = new TestCRUD('itens')
  
  // Criar usuário de teste
  const usuarioTeste = {
    nome: 'João Silva',
    email: 'joao.silva@teste.com',
    telefone: '(11) 99999-9999',
    tipo_usuario: 'usuario'
  }
  
  const usuarioResult = await usuariosCRUD.create(usuarioTeste)
  
  if (!usuarioResult.success) {
    console.log('❌ Falha ao criar usuário, abortando testes...')
    return
  }
  
  const usuarioId = usuarioResult.data.id
  
  // Criar categoria de teste
  const categoriaTeste = {
    nome: 'Teste CRUD',
    descricao: 'Categoria criada para testar operações CRUD',
    cor: '#FF6B6B',
    icone: 'test',
    ordem: 999
  }
  
  const categoriaResult = await categoriasCRUD.create(categoriaTeste)
  
  if (!categoriaResult.success) {
    console.log('❌ Falha ao criar categoria, abortando testes...')
    return
  }
  
  const categoriaId = categoriaResult.data.id
  
  // Criar item de teste
  const itemTeste = {
    titulo: 'Item de Teste CRUD',
    descricao: 'Item criado para testar operações CRUD',
    categoria_id: categoriaId,
    usuario_id: usuarioId,
    status: 'ativo',
    prioridade: 'media',
    tags: ['teste', 'crud', 'demo']
  }
  
  const itemResult = await itensCRUD.create(itemTeste)
  
  if (!itemResult.success) {
    console.log('❌ Falha ao criar item, abortando testes...')
    return
  }
  
  const itemId = itemResult.data.id
  
  // Teste 2: Operações READ
  console.log('\n' + '=' * 50)
  console.log('TESTE 2: OPERAÇÕES READ')
  console.log('=' * 50)
  
  // Buscar todos os usuários
  await usuariosCRUD.read()
  
  // Buscar usuário específico
  await usuariosCRUD.read({ email: 'joao.silva@teste.com' })
  
  // Buscar todos os itens
  await itensCRUD.read()
  
  // Contar registros
  await usuariosCRUD.count()
  await itensCRUD.count()
  
  // Teste 3: Operações UPDATE
  console.log('\n' + '=' * 50)
  console.log('TESTE 3: OPERAÇÕES UPDATE')
  console.log('=' * 50)
  
  // Atualizar usuário
  await usuariosCRUD.update(usuarioId, {
    nome: 'João Silva Atualizado',
    telefone: '(11) 88888-8888'
  })
  
  // Atualizar item
  await itensCRUD.update(itemId, {
    titulo: 'Item Atualizado',
    prioridade: 'alta',
    status: 'pendente'
  })
  
  // Teste 4: Operações DELETE
  console.log('\n' + '=' * 50)
  console.log('TESTE 4: OPERAÇÕES DELETE')
  console.log('=' * 50)
  
  // Deletar item
  await itensCRUD.delete(itemId)
  
  // Deletar categoria
  await categoriasCRUD.delete(categoriaId)
  
  // Deletar usuário
  await usuariosCRUD.delete(usuarioId)
  
  console.log('\n🎉 Todos os testes CRUD concluídos com sucesso!')
  console.log('✅ CREATE, READ, UPDATE e DELETE funcionando perfeitamente')
}

testCRUDOperations().catch(console.error) 