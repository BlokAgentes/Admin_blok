#!/usr/bin/env node

/**
 * Script para testar as rotas de autenticação do frontend
 * 
 * Uso: node test-frontend-auth.js
 * 
 * Este script testa:
 * - POST /api/auth/register
 * - POST /api/auth/login  
 * - GET /api/auth/me
 * - POST /api/auth/logout
 */

const BASE_URL = 'http://localhost:3000'

// Função para fazer requests HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return { response, data }
  } catch (error) {
    console.error('Request error:', error.message)
    return { error: error.message }
  }
}

async function testFrontendAuth() {
  console.log('🧪 Testando rotas de autenticação do frontend...\n')

  // Dados de teste
  const testUser = {
    name: 'Usuário Teste',
    email: `test.${Date.now()}@gmail.com`,
    password: 'TestPassword123!'
  }

  let accessToken = null

  try {
    // Teste 1: Registro
    console.log('1️⃣ Testando registro de usuário...')
    console.log('- Email:', testUser.email)
    
    const { response: registerResponse, data: registerData, error: registerError } = await makeRequest(
      `${BASE_URL}/api/auth/register`,
      {
        method: 'POST',
        body: JSON.stringify(testUser)
      }
    )

    if (registerError) {
      console.log('❌ Erro na requisição de registro:', registerError)
      return
    }

    if (registerResponse.ok) {
      console.log('✅ Registro realizado com sucesso')
      console.log('- ID:', registerData.user?.id)
      console.log('- Email:', registerData.user?.email)
      console.log('- Nome:', registerData.user?.name)
      console.log('- Role:', registerData.user?.role)
      console.log('- Mensagem:', registerData.message)
      
      if (registerData.session?.access_token) {
        accessToken = registerData.session.access_token
        console.log('- Token obtido automaticamente')
      }
    } else {
      console.log('❌ Erro no registro:', registerData.error)
      console.log('- Status:', registerResponse.status)
    }

    // Teste 2: Login (se o registro não retornou um token)
    if (!accessToken) {
      console.log('\n2️⃣ Testando login...')
      
      const { response: loginResponse, data: loginData, error: loginError } = await makeRequest(
        `${BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        }
      )

      if (loginError) {
        console.log('❌ Erro na requisição de login:', loginError)
        return
      }

      if (loginResponse.ok) {
        console.log('✅ Login realizado com sucesso')
        console.log('- ID:', loginData.user?.id)
        console.log('- Email:', loginData.user?.email)
        console.log('- Nome:', loginData.user?.name)
        console.log('- Mensagem:', loginData.message)
        
        if (loginData.session?.access_token) {
          accessToken = loginData.session.access_token
          console.log('- Token obtido')
        }
      } else {
        console.log('❌ Erro no login:', loginData.error)
        console.log('- Status:', loginResponse.status)
        
        if (loginData.error?.includes('confirme seu email')) {
          console.log('⚠️  Em desenvolvimento, o Supabase pode requerer confirmação de email')
        }
      }
    }

    // Teste 3: Obter dados do usuário (se temos token)
    if (accessToken) {
      console.log('\n3️⃣ Testando obter dados do usuário...')
      
      const { response: meResponse, data: meData, error: meError } = await makeRequest(
        `${BASE_URL}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (meError) {
        console.log('❌ Erro na requisição me:', meError)
      } else if (meResponse.ok) {
        console.log('✅ Dados do usuário obtidos com sucesso')
        console.log('- ID:', meData.user?.id)
        console.log('- Email:', meData.user?.email)
        console.log('- Nome:', meData.user?.name)
        console.log('- Role:', meData.user?.role)
      } else {
        console.log('❌ Erro ao obter dados:', meData.error)
        console.log('- Status:', meResponse.status)
      }

      // Teste 4: Logout
      console.log('\n4️⃣ Testando logout...')
      
      const { response: logoutResponse, data: logoutData, error: logoutError } = await makeRequest(
        `${BASE_URL}/api/auth/logout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (logoutError) {
        console.log('❌ Erro na requisição de logout:', logoutError)
      } else if (logoutResponse.ok) {
        console.log('✅ Logout realizado com sucesso')
        console.log('- Mensagem:', logoutData.message)
      } else {
        console.log('❌ Erro no logout:', logoutData.error)
        console.log('- Status:', logoutResponse.status)
      }
    } else {
      console.log('\n⚠️  Não foi possível obter token de acesso - pulando testes autenticados')
    }

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message)
  }

  console.log('\n✅ Teste das rotas de autenticação concluído!')
  console.log('\n📝 Notas importantes:')
  console.log('1. O servidor frontend deve estar rodando em http://localhost:3000')
  console.log('2. As variáveis SUPABASE_URL e SUPABASE_ANON_KEY devem estar configuradas')
  console.log('3. Em produção, emails precisam ser confirmados antes do login')
  console.log('4. Os usuários são criados apenas no Supabase (não no Prisma)')
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, { method: 'OPTIONS' })
    return true
  } catch (error) {
    console.log('❌ Servidor frontend não está rodando em http://localhost:3000')
    console.log('💡 Execute: cd apps/frontend && pnpm dev')
    return false
  }
}

// Executar teste
checkServer().then(serverRunning => {
  if (serverRunning) {
    testFrontendAuth()
  }
}).catch(error => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})