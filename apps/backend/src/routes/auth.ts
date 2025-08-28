import { Router } from 'express'
import { authService } from '../mcp/simple-auth-service'
import { 
  requireMCPAuth, 
  requireMCPAdmin, 
  MCPAuthenticatedRequest,
  authRateLimit,
  passwordResetRateLimit,
  logAuthEvent,
  validateMCPSession,
  sanitizeInputs
} from '../middleware/mcp-auth'
import { validateBody } from '../middleware/validation'
import { loginSchema, registerSchema } from '../schemas/auth'

const router = Router()

// Register new user using MCP Supabase Auth
router.post('/register', 
  authRateLimit,
  sanitizeInputs,
  validateBody(registerSchema),
  logAuthEvent('REGISTER'),
  async (req, res) => {
    try {
      const { email, password, name, role = 'CLIENT' } = req.body

      const result = await authService.register(email, password, name, role)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Registration failed'
        })
      }

      // Return session token for immediate login
      return res.status(201).json({
        message: 'User registered successfully',
        user: result.data?.user,
        session: result.data?.session
      })
    } catch (error) {
      console.error('Registration error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

// Login user using MCP Supabase Auth
router.post('/login', 
  authRateLimit,
  sanitizeInputs,
  validateBody(loginSchema),
  logAuthEvent('LOGIN'),
  async (req, res) => {
    try {
      const { email, password } = req.body

      const result = await authService.login(email, password)

      if (!result.success) {
        return res.status(401).json({
          error: result.error || 'Invalid credentials'
        })
      }

      return res.json({
        message: 'Login successful',
        user: result.data?.user,
        session: result.data?.session
      })
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

// Admin login (uses same MCP login but validates admin role)
router.post('/admin/login', 
  authRateLimit,
  validateBody(loginSchema),
  logAuthEvent('ADMIN_LOGIN'),
  async (req, res) => {
    try {
      const { email, password } = req.body

      const result = await authService.login(email, password)

      if (!result.success) {
        return res.status(401).json({
          error: 'Invalid admin credentials'
        })
      }

      // Verify admin role
      if (result.data?.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Access denied. Admin privileges required.'
        })
      }

      return res.json({
        message: 'Admin login successful',
        user: result.data?.user,
        session: result.data?.session
      })
    } catch (error) {
      console.error('Admin login error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

// Logout user from Supabase
router.post('/logout', 
  requireMCPAuth,
  logAuthEvent('LOGOUT'),
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const result = await authService.logout('local')

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Logout failed'
        })
      }

      return res.json({
        message: 'Logout successful'
      })
    } catch (error) {
      console.error('Logout error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

// Password reset request
router.post('/forgot-password',
  passwordResetRateLimit,
  async (req, res) => {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({
          error: 'Email is required'
        })
      }

      const result = await authService.resetPassword(
        email,
        process.env.FRONTEND_URL + '/auth/reset-password'
      )

      // Always return success for security (don't reveal if email exists)
      return res.json({
        message: 'Password reset email sent if account exists'
      })
    } catch (error) {
      console.error('Password reset error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

// Confirm email verification
router.post('/confirm-email',
  async (req, res) => {
    try {
      const { token, type = 'signup' } = req.body

      if (!token) {
        return res.status(400).json({
          error: 'Confirmation token is required'
        })
      }

      const result = await authService.confirmEmail(token, type)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Email confirmation failed'
        })
      }

      return res.json({
        message: 'Email confirmed successfully',
        user: result.data?.user,
        session: result.data?.session
      })
    } catch (error) {
      console.error('Email confirmation error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

// Refresh session token
router.post('/refresh',
  async (req, res) => {
    try {
      const { refresh_token } = req.body

      const result = await authService.refreshSession(refresh_token)

      if (!result.success) {
        return res.status(401).json({
          error: result.error || 'Token refresh failed'
        })
      }

      return res.json({
        message: 'Session refreshed successfully',
        session: result.data?.session,
        user: result.data?.user
      })
    } catch (error) {
      console.error('Token refresh error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

// TODO: Implement impersonation feature in future version
// For now, admin can access user data via the admin endpoints

// Get current user profile
router.get('/me', 
  requireMCPAuth,
  validateMCPSession,
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        })
      }

      return res.json({
        user: {
          id: req.user.userId,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role
        },
        session: req.supabaseSession,
        isImpersonating: req.user.isImpersonating || false
      })
    } catch (error) {
      console.error('Get user error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

// TODO: List clients for admin - needs to be reimplemented with Supabase
// router.get('/admin/clients', requireMCPAuth, requireMCPAdmin, async (req, res) => {
//   // Implementation needed using Supabase direct queries or MCP service
// })

export default router