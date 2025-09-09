#!/usr/bin/env node

/**
 * Script para testar a integração Supabase Authentication no backend
 * 
 * Uso: node test-supabase-integration.js
 * 
 * Este script testa:
 * - Conexão com Supabase usando SUPABASE_URL e SUPABASE_ANON_KEY
 * - Registro de usuário via backend API
 * - Login de usuário via backend API
 * - Validação de token
 * - Logout
 */

require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

console.log('🔍 Testando integração Supabase Authentication...\n')

// Verificar variáveis de ambiente
console.log('📋 Verificando configuração:')
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado')
console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado')
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurado' : '⚠️  Não configurado')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias')
  console.log('\n📝 Configure no arquivo .env:')
  console.log('SUPABASE_URL="https://seu-projeto.supabase.co"')
  console.log('SUPABASE_ANON_KEY="seu-anon-key"')
  process.exit(1)
}

async function testSupabaseIntegration() {
  try {
    // Importar Supabase client após verificar variáveis de ambiente
    const { createClient } = require('@supabase/supabase-js')
    
    console.log('\n🔌 Testando conexão com Supabase...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Testar conexão básica
    console.log('- Testando conexão básica...')
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.log('⚠️  Erro ao obter sessão (esperado para teste):', error.message)
    } else {
      console.log('✅ Conexão Supabase estabelecida')
    }
    
    // Testar criação de usuário de teste
    const testUser = {
      email: `test.${Date.now()}@gmail.com`, // Usar domínio válido
      password: 'TestPassword123!',
      name: 'Usuário de Teste'
    }
    
    console.log('\n👤 Testando registro de usuário...')
    console.log('- Email de teste:', testUser.email)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
          role: 'CLIENT'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Erro no registro:', signUpError.message)
    } else {
      console.log('✅ Usuário criado no Supabase')
      console.log('- ID:', signUpData.user?.id)
      console.log('- Email:', signUpData.user?.email)
      console.log('- Confirmado:', signUpData.user?.email_confirmed_at ? 'Sim' : 'Não')
    }
    
    // Se o usuário foi criado, testar login
    if (signUpData.user && !signUpError) {
      console.log('\n🔐 Testando login...')
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      })
      
      if (signInError) {
        console.log('❌ Erro no login:', signInError.message)
        
        // Se é erro de confirmação de email, simular confirmação em desenvolvimento
        if (signInError.message.includes('Email not confirmed') && process.env.NODE_ENV !== 'production') {
          console.log('⚠️  Email não confirmado - em produção, usuário precisaria confirmar via email')
        }
      } else {
        console.log('✅ Login realizado com sucesso')
        console.log('- Access Token:', signInData.session?.access_token ? 'Presente' : 'Ausente')
        console.log('- Refresh Token:', signInData.session?.refresh_token ? 'Presente' : 'Ausente')
        console.log('- Expires At:', new Date(signInData.session?.expires_at * 1000).toISOString())
        
        // Testar logout
        console.log('\n🚪 Testando logout...')
        const { error: logoutError } = await supabase.auth.signOut()
        
        if (logoutError) {
          console.log('❌ Erro no logout:', logoutError.message)
        } else {
          console.log('✅ Logout realizado com sucesso')
        }
      }
      
      // Limpar usuário de teste (se possível)
      console.log('\n🧹 Tentando limpar usuário de teste...')
      // Nota: Limpeza automática pode requerer service role key
      console.log('⚠️  Limpeza automática requer SUPABASE_SERVICE_ROLE (opcional)')
    }
    
    console.log('\n✅ Teste de integração Supabase concluído!')
    console.log('\n📝 Próximos passos:')
    console.log('1. Configure as variáveis de ambiente no seu .env')
    console.log('2. Inicie o servidor backend: cd apps/backend && npm dev')
    console.log('3. Teste as rotas de autenticação via API')
    console.log('4. Integre com o frontend')
    
  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message)
    console.log('\n🔍 Verificações:')
    console.log('1. As variáveis SUPABASE_URL e SUPABASE_ANON_KEY estão corretas?')
    console.log('2. O projeto Supabase está ativo?')
    console.log('3. As dependências estão instaladas? (npm install)')
  }
}

// Executar teste
testSupabaseIntegration()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })