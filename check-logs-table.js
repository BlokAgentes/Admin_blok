const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Verificando estrutura da tabela logs_atividade...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLogsTable() {
  try {
    // Verificar se a tabela existe e sua estrutura
    const { data, error } = await supabase
      .from('logs_atividade')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao acessar tabela logs_atividade:', error.message)
      return
    }

    console.log('✅ Tabela logs_atividade existe')
    
    // Tentar inserir um log simples para ver a estrutura
    const { data: insertData, error: insertError } = await supabase
      .from('logs_atividade')
      .insert({
        usuario_id: null,
        acao: 'TEST',
        tabela_afetada: 'test',
        registro_id: '550e8400-e29b-41d4-a716-446655440000',
        detalhes: 'Teste de estrutura'
      })
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir log de teste:', insertError.message)
      console.log('📋 Campos disponíveis na tabela:')
      console.log('- usuario_id')
      console.log('- acao')
      console.log('- tabela_afetada')
      console.log('- registro_id')
      console.log('- detalhes')
      console.log('- criado_em')
    } else {
      console.log('✅ Log de teste inserido com sucesso:', insertData[0])
      
      // Remover o log de teste
      await supabase
        .from('logs_atividade')
        .delete()
        .eq('id', insertData[0].id)
      
      console.log('✅ Log de teste removido')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

checkLogsTable().catch(console.error) 