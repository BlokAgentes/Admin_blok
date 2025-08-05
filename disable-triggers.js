const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Desabilitando triggers problemáticos...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function disableTriggers() {
  try {
    // Desabilitar triggers usando SQL direto
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS log_usuarios_activity ON usuarios;
        DROP TRIGGER IF EXISTS log_itens_activity ON itens;
      `
    })
    
    if (error) {
      console.log('❌ Erro ao desabilitar triggers:', error.message)
      console.log('🔍 Tentando abordagem alternativa...')
      
      // Tentar desabilitar individualmente
      try {
        await supabase.rpc('exec_sql', {
          sql: 'DROP TRIGGER IF EXISTS log_usuarios_activity ON usuarios;'
        })
        console.log('✅ Trigger de usuarios desabilitado')
      } catch (err) {
        console.log('⚠️ Não foi possível desabilitar trigger de usuarios:', err.message)
      }
      
      try {
        await supabase.rpc('exec_sql', {
          sql: 'DROP TRIGGER IF EXISTS log_itens_activity ON itens;'
        })
        console.log('✅ Trigger de itens desabilitado')
      } catch (err) {
        console.log('⚠️ Não foi possível desabilitar trigger de itens:', err.message)
      }
    } else {
      console.log('✅ Triggers desabilitados com sucesso')
    }
    
  } catch (error) {
    console.error('❌ Erro durante desabilitação:', error.message)
  }
}

disableTriggers().catch(console.error) 