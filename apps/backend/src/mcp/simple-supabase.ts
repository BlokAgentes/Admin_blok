import { createClient } from '@supabase/supabase-js'

// Simple Supabase clients with proper error handling
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE  
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey
  })
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required environment variables')
}

// Warn if service role is missing but continue with anon key for admin operations
if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE not set. Using SUPABASE_ANON_KEY for admin operations (limited functionality)')
}

// Admin client for server operations (use service role if available, otherwise anon key with limited permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Regular client for user operations
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})