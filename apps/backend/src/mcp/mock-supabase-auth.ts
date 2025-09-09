import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

// Mock user database
const mockUsers: Array<{
  id: string
  email: string
  password: string
  user_metadata: Record<string, any>
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}> = [
  {
    id: randomUUID(),
    email: 'admin@demo.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oXx0zEqvW', // password: admin123
    user_metadata: { name: 'Admin User', role: 'ADMIN' },
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    email: 'user@demo.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oXx0zEqvW', // password: user123
    user_metadata: { name: 'Demo User', role: 'CLIENT' },
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'mock-jwt-secret'

// Mock session storage
const activeSessions: Map<string, {
  user: any
  access_token: string
  refresh_token: string
  expires_at: number
}> = new Map()

/**
 * Mock Supabase Admin Client for development
 */
export const mockSupabaseAdmin = {
  auth: {
    admin: {
      async createUser(options: {
        email: string
        password: string
        email_confirm?: boolean
        user_metadata?: Record<string, any>
      }) {
        console.log('🔧 Mock: Creating user', options.email)
        
        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === options.email)
        if (existingUser) {
          return {
            data: null,
            error: { message: 'User already registered', code: 'user_already_exists' }
          }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(options.password, 12)
        
        // Create new user
        const newUser = {
          id: randomUUID(),
          email: options.email,
          password: hashedPassword,
          user_metadata: options.user_metadata || {},
          email_confirmed_at: options.email_confirm ? new Date().toISOString() : undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        mockUsers.push(newUser)
        
        return {
          data: {
            user: {
              id: newUser.id,
              email: newUser.email,
              user_metadata: newUser.user_metadata,
              email_confirmed_at: newUser.email_confirmed_at,
              created_at: newUser.created_at,
              updated_at: newUser.updated_at
            }
          },
          error: null
        }
      },
      
      async deleteUser(userId: string) {
        console.log('🔧 Mock: Deleting user', userId)
        
        const userIndex = mockUsers.findIndex(u => u.id === userId)
        if (userIndex === -1) {
          return {
            data: null,
            error: { message: 'User not found', code: 'user_not_found' }
          }
        }
        
        mockUsers.splice(userIndex, 1)
        activeSessions.delete(userId)
        
        return { data: {}, error: null }
      }
    }
  }
}

/**
 * Mock Supabase Client for development
 */
export const mockSupabaseClient = {
  auth: {
    async signInWithPassword(credentials: { email: string; password: string }) {
      console.log('🔧 Mock: Login attempt for', credentials.email)
      
      const user = mockUsers.find(u => u.email === credentials.email)
      if (!user) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', code: 'invalid_credentials' }
        }
      }
      
      // Verify password
      const passwordValid = await bcrypt.compare(credentials.password, user.password)
      if (!passwordValid) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', code: 'invalid_credentials' }
        }
      }
      
      // Create session tokens
      const accessToken = jwt.sign(
        { 
          sub: user.id, 
          email: user.email,
          user_metadata: user.user_metadata,
          aud: 'authenticated'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      const refreshToken = jwt.sign(
        { sub: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
      )
      
      const session = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000),
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
      
      // Store session
      activeSessions.set(user.id, session)
      
      return {
        data: { user: session.user, session },
        error: null
      }
    },
    
    async signOut({ scope = 'local' }: { scope?: 'global' | 'local' } = {}) {
      console.log('🔧 Mock: Sign out with scope', scope)
      
      if (scope === 'global') {
        activeSessions.clear()
      }
      
      return { error: null }
    },
    
    async getUser(jwt?: string) {
      if (!jwt) {
        return {
          data: { user: null },
          error: { message: 'No JWT provided', code: 'no_jwt' }
        }
      }
      
      try {
        const decoded = jwt.verify(jwt, JWT_SECRET) as any
        const user = mockUsers.find(u => u.id === decoded.sub)
        
        if (!user) {
          return {
            data: { user: null },
            error: { message: 'User not found', code: 'user_not_found' }
          }
        }
        
        return {
          data: {
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata,
              email_confirmed_at: user.email_confirmed_at,
              created_at: user.created_at,
              updated_at: user.updated_at
            }
          },
          error: null
        }
      } catch (error) {
        return {
          data: { user: null },
          error: { message: 'Invalid JWT', code: 'invalid_jwt' }
        }
      }
    },
    
    async getSession() {
      console.log('🔧 Mock: Get current session')
      
      // In a real app, this would check for stored session
      return {
        data: { session: null },
        error: null
      }
    },
    
    async refreshSession({ refresh_token }: { refresh_token?: string } = {}) {
      console.log('🔧 Mock: Refresh session')
      
      if (!refresh_token) {
        return {
          data: { session: null, user: null },
          error: { message: 'Refresh token required', code: 'no_refresh_token' }
        }
      }
      
      try {
        const decoded = jwt.verify(refresh_token, JWT_SECRET) as any
        const user = mockUsers.find(u => u.id === decoded.sub)
        
        if (!user || decoded.type !== 'refresh') {
          return {
            data: { session: null, user: null },
            error: { message: 'Invalid refresh token', code: 'invalid_refresh_token' }
          }
        }
        
        // Create new session
        const accessToken = jwt.sign(
          { 
            sub: user.id, 
            email: user.email,
            user_metadata: user.user_metadata,
            aud: 'authenticated'
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        )
        
        const newRefreshToken = jwt.sign(
          { sub: user.id, type: 'refresh' },
          JWT_SECRET,
          { expiresIn: '30d' }
        )
        
        const session = {
          access_token: accessToken,
          refresh_token: newRefreshToken,
          token_type: 'bearer',
          expires_in: 7 * 24 * 60 * 60,
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000),
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
        
        return {
          data: { session, user: session.user },
          error: null
        }
      } catch (error) {
        return {
          data: { session: null, user: null },
          error: { message: 'Invalid refresh token', code: 'invalid_refresh_token' }
        }
      }
    },
    
    async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
      console.log('🔧 Mock: Password reset for', email)
      
      const user = mockUsers.find(u => u.email === email)
      // Always return success for security (don't reveal if email exists)
      
      return { error: null }
    },
    
    async verifyOtp({ token_hash, type }: { token_hash: string; type: string }) {
      console.log('🔧 Mock: Verify OTP', type)
      
      // Mock email confirmation
      return {
        data: {
          user: mockUsers[0], // Return first user for demo
          session: null
        },
        error: null
      }
    }
  }
}

// Export for compatibility
export const supabaseAdmin = mockSupabaseAdmin
export const supabaseClient = mockSupabaseClient