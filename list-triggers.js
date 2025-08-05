const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Listando todos os triggers ativos...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listTriggers() {
  try {
    console.log('📋 Buscando triggers...')
    
    // Tentar listar triggers usando uma consulta SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          trigger_name,
          event_object_table,
          action_statement
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        ORDER BY event_object_table, trigger_name;
      `
    })
    
    if (error) {
      console.log('❌ Erro ao listar triggers:', error.message)
      console.log('🔍 Tentando abordagem alternativa...')
      
      // Tentar verificar triggers específicos
      const tables = ['usuarios', 'perfis', 'categorias', 'itens', 'comentarios', 'anexos', 'logs_atividade', 'sessoes']
      
      for (const tableName of tables) {
        try {
          const { data: tableData, error: tableError } = await supabase.rpc('exec_sql', {
            sql: `
              SELECT trigger_name 
              FROM information_schema.triggers 
              WHERE trigger_schema = 'public' 
              AND event_object_table = '${tableName}';
            `
          })
          
          if (tableError) {
            console.log(`⚠️ Erro ao verificar ${tableName}:`, tableError.message)
          } else {
            console.log(`📋 ${tableName}: ${tableData.length} triggers`)
            if (tableData.length > 0) {
              tableData.forEach(trigger => {
                console.log(`   - ${trigger.trigger_name}`)
              })
            }
          }
        } catch (err) {
          console.log(`⚠️ Erro ao verificar ${tableName}:`, err.message)
        }
      }
    } else {
      console.log('✅ Triggers encontrados:', data)
    }
    
  } catch (error) {
    console.error('❌ Erro durante listagem:', error.message)
  }
}

listTriggers().catch(console.error) 