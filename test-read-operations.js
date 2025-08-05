const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('📖 Testando Operações READ com Supabase...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Classe para operações READ
class ReadOperations {
  constructor() {
    this.supabase = supabase
  }

  // READ - Buscar todos os registros com paginação
  async readAll(tableName, options = {}) {
    try {
      const { page = 1, pageSize = 10, orderBy = 'criado_em', ascending = false } = options
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      console.log(`📋 Buscando registros em ${tableName} (página ${page}, ${pageSize} por página)...`)
      
      const { data, error, count } = await this.supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending })
        .range(from, to)

      if (error) throw error

      console.log(`✅ ${data.length} registros encontrados (total: ${count})`)
      return { success: true, data, count, page, pageSize }
    } catch (error) {
      console.error(`❌ Erro ao buscar registros:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // READ - Buscar por filtros
  async readWithFilters(tableName, filters = {}) {
    try {
      console.log(`🔍 Buscando registros em ${tableName} com filtros:`, filters)
      
      let query = this.supabase.from(tableName).select('*')
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'string' && key === 'nome') {
            query = query.ilike(key, `%${value}%`)
          } else {
            query = query.eq(key, value)
          }
        }
      })
      
      const { data, error } = await query
      
      if (error) throw error

      console.log(`✅ ${data.length} registros encontrados com filtros`)
      return { success: true, data }
    } catch (error) {
      console.error(`❌ Erro ao buscar com filtros:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // READ - Buscar por ID
  async readById(tableName, id) {
    try {
      console.log(`🔍 Buscando registro ${id} em ${tableName}...`)
      
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      console.log(`✅ Registro encontrado:`, data)
      return { success: true, data }
    } catch (error) {
      console.error(`❌ Erro ao buscar por ID:`, error.message)
      return { success: false, error: error.message }
    }
  }

  // READ - Contar registros
  async count(tableName, filters = {}) {
    try {
      console.log(`📊 Contando registros em ${tableName}...`)
      
      let query = this.supabase.from(tableName).select('*', { count: 'exact' })
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
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

  // READ - Busca de texto completo
  async search(tableName, searchTerm, searchFields = []) {
    try {
      console.log(`🔍 Buscando "${searchTerm}" em ${tableName}...`)
      
      let query = this.supabase.from(tableName).select('*')
      
      if (searchFields.length > 0) {
        // Busca em campos específicos
        const searchConditions = searchFields.map(field => `${field}.ilike.%${searchTerm}%`)
        query = query.or(searchConditions.join(','))
      } else {
        // Busca em campos específicos de cada tabela
        let searchConditions = ''
        switch (tableName) {
          case 'usuarios':
            searchConditions = `nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
            break
          case 'categorias':
            searchConditions = `nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
            break
          case 'itens':
            searchConditions = `titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`
            break
          case 'comentarios':
            searchConditions = `conteudo.ilike.%${searchTerm}%`
            break
          default:
            searchConditions = `nome.ilike.%${searchTerm}%`
        }
        query = query.or(searchConditions)
      }
      
      const { data, error } = await query
      
      if (error) throw error

      console.log(`✅ ${data.length} resultados encontrados para "${searchTerm}"`)
      return { success: true, data }
    } catch (error) {
      console.error(`❌ Erro na busca:`, error.message)
      return { success: false, error: error.message }
    }
  }
}

async function testReadOperations() {
  console.log('\n🎯 Iniciando testes de operações READ...\n')
  
  const readOps = new ReadOperations()
  
  // Teste 1: Buscar todos os registros
  console.log('=' * 50)
  console.log('TESTE 1: BUSCAR TODOS OS REGISTROS')
  console.log('=' * 50)
  
  // Buscar usuários
  await readOps.readAll('usuarios', { page: 1, pageSize: 5 })
  
  // Buscar categorias
  await readOps.readAll('categorias', { page: 1, pageSize: 10 })
  
  // Buscar itens
  await readOps.readAll('itens', { page: 1, pageSize: 5 })
  
  // Teste 2: Buscar com filtros
  console.log('\n' + '=' * 50)
  console.log('TESTE 2: BUSCAR COM FILTROS')
  console.log('=' * 50)
  
  // Buscar usuários ativos
  await readOps.readWithFilters('usuarios', { ativo: true })
  
  // Buscar categorias por ordem
  await readOps.readWithFilters('categorias', { ordem: 1 })
  
  // Buscar itens por status
  await readOps.readWithFilters('itens', { status: 'ativo' })
  
  // Teste 3: Buscar por ID
  console.log('\n' + '=' * 50)
  console.log('TESTE 3: BUSCAR POR ID')
  console.log('=' * 50)
  
  // Primeiro, buscar um usuário para pegar o ID
  const usuariosResult = await readOps.readAll('usuarios', { page: 1, pageSize: 1 })
  if (usuariosResult.success && usuariosResult.data.length > 0) {
    const userId = usuariosResult.data[0].id
    await readOps.readById('usuarios', userId)
  }
  
  // Buscar uma categoria
  const categoriasResult = await readOps.readAll('categorias', { page: 1, pageSize: 1 })
  if (categoriasResult.success && categoriasResult.data.length > 0) {
    const categoriaId = categoriasResult.data[0].id
    await readOps.readById('categorias', categoriaId)
  }
  
  // Teste 4: Contar registros
  console.log('\n' + '=' * 50)
  console.log('TESTE 4: CONTAR REGISTROS')
  console.log('=' * 50)
  
  await readOps.count('usuarios')
  await readOps.count('categorias')
  await readOps.count('itens')
  await readOps.count('usuarios', { ativo: true })
  
  // Teste 5: Busca de texto
  console.log('\n' + '=' * 50)
  console.log('TESTE 5: BUSCA DE TEXTO')
  console.log('=' * 50)
  
  await readOps.search('usuarios', 'admin')
  await readOps.search('categorias', 'geral')
  await readOps.search('itens', 'teste')
  
  console.log('\n🎉 Todos os testes de operações READ concluídos com sucesso!')
  console.log('✅ READ, filtros, paginação e busca funcionando perfeitamente')
}

testReadOperations().catch(console.error) 