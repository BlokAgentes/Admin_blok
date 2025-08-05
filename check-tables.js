const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Verificando tabelas no banco de dados...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  try {
    // Verificar se as tabelas existem usando uma consulta SQL direta
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('usuarios', 'perfis', 'categorias', 'itens', 'comentarios', 'anexos', 'logs_atividade', 'sessoes')
        ORDER BY table_name;
      `
    })
    
    if (error) {
      console.log('❌ Erro ao verificar tabelas:', error.message)
      
      // Tentar uma abordagem alternativa
      console.log('\n🔍 Tentando verificar tabelas individualmente...')
      
      const tables = ['usuarios', 'perfis', 'categorias', 'itens', 'comentarios', 'anexos', 'logs_atividade', 'sessoes']
      
      for (const tableName of tables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (tableError) {
            console.log(`❌ Tabela ${tableName}: ${tableError.message}`)
          } else {
            console.log(`✅ Tabela ${tableName}: Existe`)
          }
        } catch (err) {
          console.log(`❌ Tabela ${tableName}: ${err.message}`)
        }
      }
    } else {
      console.log('✅ Tabelas encontradas:', data)
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message)
  }
}

checkTables().catch(console.error) 