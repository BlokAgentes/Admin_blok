import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { supabaseAdmin, supabaseClient } from './mcp/simple-supabase'

const app = express()
const PORT = 5003

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabase: {
      url: process.env.SUPABASE_URL ? 'configured' : 'missing',
      anon_key: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing',
      service_role: process.env.SUPABASE_SERVICE_ROLE ? 'configured' : 'missing'
    }
  })
})

app.post('/test-auth', async (req, res) => {
  try {
    const { email = 'test@example.com', password = 'testpassword123' } = req.body

    // Test user creation
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        name: 'Test User',
        role: 'CLIENT'
      }
    })

    if (createError) {
      console.log('Create error (might be expected if user exists):', createError.message)
    }

    // Test login
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      throw loginError
    }

    res.json({
      message: 'Authentication test successful',
      user: loginData.user?.id,
      session: loginData.session ? 'active' : 'inactive'
    })
  } catch (error) {
    console.error('Auth test error:', error)
    res.status(500).json({
      error: 'Authentication test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`)
  console.log(`📍 Health: http://localhost:${PORT}/health`)
  console.log(`🔐 Auth test: POST http://localhost:${PORT}/test-auth`)
})