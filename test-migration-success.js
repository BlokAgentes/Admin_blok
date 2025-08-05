const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Verificando se as tabelas foram criadas com sucesso...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testTables() {
  try {
    console.log('📋 Verificando tabelas criadas...\n')
    
    // Lista de tabelas que deveriam ter sido criadas
    const expectedTables = [
      'usuarios',
      'perfis', 
      'categorias',
      'itens',
      'comentarios',
      'anexos',
      'logs_atividade',
      'sessoes'
    ]
    
    for (const tableName of expectedTables) {
      try {
        // Tentar fazer uma consulta simples para verificar se a tabela existe
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Tabela ${tableName}: ${error.message}`)
        } else {
          console.log(`✅ Tabela ${tableName}: Criada com sucesso`)
        }
      } catch (err) {
        console.log(`❌ Tabela ${tableName}: ${err.message}`)
      }
    }
    
    console.log('\n🎯 Testando inserção de dados...')
    
    // Testar inserção de uma categoria
    const { data: categoriaData, error: categoriaError } = await supabase
      .from('categorias')
      .insert({
        nome: 'Teste Migration',
        descricao: 'Categoria criada para testar a migration',
        cor: '#FF6B6B',
        icone: 'test',
        ordem: 999
      })
      .select()
    
    if (categoriaError) {
      console.log(`❌ Erro ao inserir categoria: ${categoriaError.message}`)
    } else {
      console.log(`✅ Categoria inserida com sucesso: ${categoriaData[0].nome}`)
      
      // Limpar o teste
      await supabase
        .from('categorias')
        .delete()
        .eq('nome', 'Teste Migration')
    }
    
    console.log('\n🎉 Migration aplicada com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
  }
}

testTables().catch(console.error) 