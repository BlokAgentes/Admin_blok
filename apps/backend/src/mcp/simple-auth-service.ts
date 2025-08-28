import { supabaseAdmin, supabaseClient } from './simple-supabase'
import bcrypt from 'bcryptjs'

export interface UserData {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CLIENT'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: UserData
    session?: any
  }
  error?: string
}

/**
 * Simplified Authentication service using direct Supabase client calls
 * TODO: Remove Prisma dependencies and implement purely with Supabase
 */
export class SimpleAuthService {
  /**
   * Register a new user using Supabase Auth
   * TODO: Implement user registration with Supabase only
   */
  async register(email: string, password: string, name: string, role: 'ADMIN' | 'CLIENT' = 'CLIENT'): Promise<AuthResponse> {
    try {
      // TODO: Implement registration logic using only Supabase
      // Check if user exists, create user, etc.
      
      return {
        success: false,
        error: 'Registration temporarily disabled - Prisma removal in progress'
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: 'Registration failed'
      }
    }
  }

  /**
   * Login user using Supabase Auth
   * TODO: Implement login with Supabase only
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Sign in with Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })

      if (error || !data.user) {
        return {
          success: false,
          error: error?.message || 'Login failed'
        }
      }

      // TODO: Get user profile from Supabase profiles table instead of Prisma
      return {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || 'User',
            role: data.user.user_metadata?.role || 'CLIENT',
            createdAt: data.user.created_at || new Date().toISOString(),
            updatedAt: data.user.updated_at || new Date().toISOString()
          },
          session: data.session
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Login failed'
      }
    }
  }

  /**
   * Logout user from Supabase
   */
  async logout(scope: 'local' | 'global' = 'local'): Promise<AuthResponse> {
    try {
      const { error } = await supabaseClient.auth.signOut({ scope })
      
      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Logout error:', error)
      return {
        success: false,
        error: 'Logout failed'
      }
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(email: string, redirectTo?: string): Promise<AuthResponse> {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo
      })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: 'Password reset failed'
      }
    }
  }

  /**
   * Confirm email verification
   * TODO: Implement with Supabase only
   */
  async confirmEmail(token: string, type: string = 'signup'): Promise<AuthResponse> {
    try {
      // TODO: Implement email confirmation
      return {
        success: false,
        error: 'Email confirmation temporarily disabled - Prisma removal in progress'
      }
    } catch (error) {
      console.error('Email confirmation error:', error)
      return {
        success: false,
        error: 'Email confirmation failed'
      }
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabaseClient.auth.refreshSession({
        refresh_token: refreshToken
      })

      if (error || !data.session) {
        return {
          success: false,
          error: error?.message || 'Token refresh failed'
        }
      }

      return {
        success: true,
        data: {
          user: {
            id: data.user?.id || '',
            email: data.user?.email || '',
            name: data.user?.user_metadata?.name || 'User',
            role: data.user?.user_metadata?.role || 'CLIENT',
            createdAt: data.user?.created_at || new Date().toISOString(),
            updatedAt: data.user?.updated_at || new Date().toISOString()
          },
          session: data.session
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return {
        success: false,
        error: 'Token refresh failed'
      }
    }
  }

  /**
   * Get user profile by ID
   * TODO: Implement with Supabase profiles table
   */
  async getUserProfile(userId: string): Promise<AuthResponse> {
    try {
      // TODO: Query Supabase profiles table instead of Prisma
      return {
        success: false,
        error: 'User profile temporarily disabled - Prisma removal in progress'
      }
    } catch (error) {
      console.error('Get user profile error:', error)
      return {
        success: false,
        error: 'Failed to get user profile'
      }
    }
  }

  /**
   * Format user data for response
   */
  private formatUser(user: any): UserData {
    return {
      id: user.id,
      email: user.email,
      name: user.name || user.user_metadata?.name || 'User',
      role: user.role || user.user_metadata?.role || 'CLIENT',
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      updatedAt: user.updatedAt || user.updated_at || new Date().toISOString()
    }
  }

  /**
   * Log audit events
   * TODO: Implement with Supabase audit table
   */
  private async logAudit(action: string, userId: string, details: any): Promise<void> {
    try {
      // TODO: Log to Supabase audit table instead of Prisma
      console.log('Audit log:', { action, userId, details })
    } catch (error) {
      console.error('Failed to log audit event:', error)
    }
  }
}

// Export singleton instance
export const authService = new SimpleAuthService()