const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuração do Supabase com service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Aplicando schema do banco de dados via API REST...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

// Criação do cliente Supabase com service role
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Função para aplicar schema em partes
async function applySchema() {
  console.log('📋 Aplicando schema em partes...\n')

  // Parte 1: Criar tabela usuarios
  console.log('1️⃣ Criando tabela usuarios...')
  try {
    // Tentar inserir um usuário de teste para verificar se a tabela existe
    const { data: testUser, error: testError } = await supabase
      .from('usuarios')
      .insert({
        nome: 'Teste',
        email: 'teste@exemplo.com'
      })
      .select()
      .single()

    if (testError && testError.code === '42P01') {
      // Tabela não existe, vamos criar usando a API REST
      console.log('   ℹ️  Tabela usuarios não existe, criando...')
      
      // Como não podemos criar tabelas via API REST, vamos usar uma abordagem diferente
      console.log('   ⚠️  Não é possível criar tabelas via API REST')
      console.log('   💡 Use o Supabase Dashboard para criar as tabelas manualmente')
    } else if (testError) {
      console.log(`   ❌ Erro ao testar tabela usuarios: ${testError.message}`)
    } else {
      console.log('   ✅ Tabela usuarios já existe')
      // Deletar o usuário de teste
      await supabase.from('usuarios').delete().eq('id', testUser.id)
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
  }

  // Parte 2: Criar tabela categorias
  console.log('\n2️⃣ Testando tabela categorias...')
  try {
    const { data: testCategory, error: testError } = await supabase
      .from('categorias')
      .insert({
        nome: 'Teste',
        descricao: 'Categoria de teste'
      })
      .select()
      .single()

    if (testError && testError.code === '42P01') {
      console.log('   ℹ️  Tabela categorias não existe')
    } else if (testError) {
      console.log(`   ❌ Erro ao testar tabela categorias: ${testError.message}`)
    } else {
      console.log('   ✅ Tabela categorias já existe')
      // Deletar a categoria de teste
      await supabase.from('categorias').delete().eq('id', testCategory.id)
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
  }

  // Parte 3: Criar tabela itens
  console.log('\n3️⃣ Testando tabela itens...')
  try {
    const { data: testItem, error: testError } = await supabase
      .from('itens')
      .insert({
        titulo: 'Teste',
        descricao: 'Item de teste'
      })
      .select()
      .single()

    if (testError && testError.code === '42P01') {
      console.log('   ℹ️  Tabela itens não existe')
    } else if (testError) {
      console.log(`   ❌ Erro ao testar tabela itens: ${testError.message}`)
    } else {
      console.log('   ✅ Tabela itens já existe')
      // Deletar o item de teste
      await supabase.from('itens').delete().eq('id', testItem.id)
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
  }

  // Parte 4: Inserir dados iniciais nas categorias
  console.log('\n4️⃣ Inserindo dados iniciais...')
  try {
    const categoriasIniciais = [
      { nome: 'Tarefas', descricao: 'Tarefas e atividades do dia a dia', cor: '#3B82F6', icone: 'task', ordem: 1 },
      { nome: 'Projetos', descricao: 'Projetos em andamento', cor: '#10B981', icone: 'project', ordem: 2 },
      { nome: 'Ideias', descricao: 'Ideias e brainstormings', cor: '#F59E0B', icone: 'lightbulb', ordem: 3 },
      { nome: 'Lembretes', descricao: 'Lembretes e notificações', cor: '#EF4444', icone: 'bell', ordem: 4 },
      { nome: 'Pessoal', descricao: 'Itens pessoais', cor: '#8B5CF6', icone: 'user', ordem: 5 }
    ]

    for (const categoria of categoriasIniciais) {
      const { data, error } = await supabase
        .from('categorias')
        .upsert(categoria, { onConflict: 'nome' })
        .select()

      if (error) {
        console.log(`   ❌ Erro ao inserir categoria ${categoria.nome}: ${error.message}`)
      } else {
        console.log(`   ✅ Categoria ${categoria.nome} inserida/atualizada`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Erro ao inserir dados iniciais: ${error.message}`)
  }

  // Parte 5: Verificar estrutura das tabelas
  console.log('\n5️⃣ Verificando estrutura das tabelas...')
  try {
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1)

    if (usuariosError) {
      console.log(`   ❌ Erro ao verificar usuarios: ${usuariosError.message}`)
    } else {
      console.log('   ✅ Tabela usuarios acessível')
    }

    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('*')
      .limit(5)

    if (categoriasError) {
      console.log(`   ❌ Erro ao verificar categorias: ${categoriasError.message}`)
    } else {
      console.log(`   ✅ Tabela categorias acessível (${categorias?.length || 0} registros)`)
    }

    const { data: itens, error: itensError } = await supabase
      .from('itens')
      .select('*')
      .limit(1)

    if (itensError) {
      console.log(`   ❌ Erro ao verificar itens: ${itensError.message}`)
    } else {
      console.log('   ✅ Tabela itens acessível')
    }
  } catch (error) {
    console.log(`   ❌ Erro ao verificar estrutura: ${error.message}`)
  }

  console.log('\n🎉 Verificação do schema concluída!')
  console.log('\n📝 Próximos passos:')
  console.log('   1. Use o Supabase Dashboard para criar as tabelas manualmente')
  console.log('   2. Ou use o arquivo database-schema.sql como referência')
  console.log('   3. Execute os testes CRUD após criar as tabelas')
}

// Executa a aplicação do schema
applySchema().catch(console.error) 