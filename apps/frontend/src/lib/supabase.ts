import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validação das credenciais
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Credenciais do Supabase não configuradas. Verifique as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY.')
}

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Função para testar a conexão
export async function testConnection() {
  try {
    // Testa a conexão fazendo uma query simples
    const { data, error } = await supabase
      .from('client_base')
      .select('*')
      .limit(1)
    
    if (error) {
      // Se a tabela não existe, tenta uma query de sistema
      const { data: systemData, error: systemError } = await supabase
        .rpc('version')
      
      if (systemError) {
        throw new Error(`Erro de conexão: ${systemError.message}`)
      }
      
      return { 
        success: true, 
        message: 'Conexão estabelecida com sucesso (sistema)',
        data: systemData 
      }
    }
    
    return { 
      success: true, 
      message: 'Conexão estabelecida com sucesso',
      data: data 
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }
  }
}

// Função para validar permissões
export async function validatePermissions() {
  try {
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
        const { error } = await test.operation()
        results.push({
          operation: test.name,
          allowed: !error || error.code !== '42501', // 42501 = insufficient_privilege
          error: error?.message
        })
      } catch (error) {
        results.push({
          operation: test.name,
          allowed: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }
    
    return {
      success: true,
      permissions: results
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro ao validar permissões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

// Função para retry com backoff exponencial
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido')
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Backoff exponencial
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Exporta funções utilitárias
export { supabase as default } 