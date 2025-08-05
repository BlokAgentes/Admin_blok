const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🧪 Teste simples de criação de usuário...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSimpleCreate() {
  try {
    console.log('📝 Tentando criar usuário...')
    
    const usuarioTeste = {
      nome: 'Teste Simples',
      email: 'teste.simples@exemplo.com',
      telefone: '(11) 12345-6789',
      tipo_usuario: 'usuario'
    }
    
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuarioTeste)
      .select()
    
    if (error) {
      console.log('❌ Erro:', error.message)
      console.log('🔍 Detalhes do erro:', error)
    } else {
      console.log('✅ Usuário criado com sucesso!')
      console.log('📋 Dados:', data[0])
      
      // Limpar o teste
      await supabase
        .from('usuarios')
        .delete()
        .eq('email', 'teste.simples@exemplo.com')
      
      console.log('🧹 Teste limpo')
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message)
  }
}

testSimpleCreate().catch(console.error) 