const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testando conexão com Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NÃO CONFIGURADA')

// Validação das credenciais
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

// Criação do cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Função para testar a conexão
async function testConnection() {
  try {
    console.log('\n📡 Testando conectividade...')
    
    // Testa a conexão fazendo uma query simples
    const { data, error } = await supabase
      .from('client_base')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Tabela client_base não encontrada, testando conexão básica...')
      
      // Tenta uma query de sistema
      const { data: systemData, error: systemError } = await supabase
        .rpc('version')
      
      if (systemError) {
        console.error('❌ Erro de conexão:', systemError.message)
        return false
      }
      
      console.log('✅ Conexão estabelecida com sucesso (sistema)')
      console.log('📊 Dados do sistema:', systemData)
      return true
    }
    
    console.log('✅ Conexão estabelecida com sucesso')
    console.log('📊 Dados da tabela client_base:', data)
    return true
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message)
    return false
  }
}

// Função para validar permissões
async function validatePermissions() {
  try {
    console.log('\n🔐 Validando permissões...')
    
    // Testa operações básicas para validar permissões
    const tests = [
      { name: 'SELECT', operation: () => supabase.from('client_base').select('*').limit(1) },
      { name: 'INSERT', operation: () => supabase.from('client_base').insert({}).select() },
      { name: 'UPDATE', operation: () => supabase.from('client_base').update({}).eq('id', 999999) },
      { name: 'DELETE', operation: () => supabase.from('client_base').delete().eq('id', 999999) }
    ]
    
    const results = []
    
    for (const test of tests) {
      try {
        console.log(`  Testando ${test.name}...`)
        const { error } = await test.operation()
        const allowed = !error || error.code !== '42501' // 42501 = insufficient_privilege
        results.push({
          operation: test.name,
          allowed,
          error: error?.message
        })
        console.log(`    ${allowed ? '✅' : '❌'} ${test.name}: ${allowed ? 'Permitido' : error?.message || 'Negado'}`)
      } catch (error) {
        results.push({
          operation: test.name,
          allowed: false,
          error: error.message
        })
        console.log(`    ❌ ${test.name}: ${error.message}`)
      }
    }
    
    return results
  } catch (error) {
    console.error('❌ Erro ao validar permissões:', error.message)
    return []
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando testes de conexão com Supabase...\n')
  
  // Testa conexão
  const connectionOk = await testConnection()
  
  if (!connectionOk) {
    console.log('\n❌ Falha na conexão. Verifique as credenciais.')
    process.exit(1)
  }
  
  // Valida permissões
  const permissions = await validatePermissions()
  
  console.log('\n📋 Resumo dos testes:')
  console.log('✅ Conexão: OK')
  console.log('🔐 Permissões:')
  permissions.forEach(p => {
    console.log(`  ${p.allowed ? '✅' : '❌'} ${p.operation}: ${p.allowed ? 'Permitido' : 'Negado'}`)
  })
  
  console.log('\n🎉 Testes concluídos!')
}

// Executa os testes
main().catch(console.error) 