import { Request, Response, NextFunction } from 'express'
import { authService } from '../mcp/simple-auth-service'
import { 
  authRateLimit, 
  passwordResetRateLimit, 
  apiRateLimit,
  strictRateLimit,
  uploadRateLimit,
  sanitizeInput
} from '../config/security'

// Extend Express Request type to include user and MCP session data
export interface MCPAuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role: 'ADMIN' | 'CLIENT'
    name: string
    supabaseSession?: any
    isImpersonating?: boolean
    originalUserId?: string
  }
  supabaseSession?: any
}

/**
 * Extract bearer token from request headers
 */
const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * MCP-based authentication middleware
 * Uses Supabase Auth via MCP tools to authenticate requests
 */
export const requireMCPAuth = async (
  req: MCPAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractBearerToken(req.headers.authorization)

    if (!token) {
      return res.status(401).json({
        error: 'Authorization token required',
        message: 'Please provide a valid bearer token'
      })
    }

    // Get user data using MCP auth service
    const userResult = await authService.getUserByToken(token)

    if (!userResult.success || !userResult.data) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: userResult.error || 'Authentication failed'
      })
    }

    // Get current session from Supabase
    const sessionResult = await authService.getSession()
    
    // Attach user data to request
    req.user = {
      userId: userResult.data.id,
      email: userResult.data.email,
      role: userResult.data.role,
      name: userResult.data.name,
      supabaseSession: sessionResult.success ? sessionResult.data : null
    }

    req.supabaseSession = sessionResult.success ? sessionResult.data : null

    next()
  } catch (error) {
    console.error('MCP Auth middleware error:', error)
    return res.status(500).json({
      error: 'Authentication service error',
      message: 'Internal server error during authentication'
    })
  }
}

/**
 * Role-based authorization middleware
 * Requires user to have one of the specified roles
 */
export const requireMCPRole = (roles: ('ADMIN' | 'CLIENT')[]) => {
  return (req: MCPAuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      })
    }

    next()
  }
}

/**
 * Admin-only authorization middleware
 */
export const requireMCPAdmin = requireMCPRole(['ADMIN'])

/**
 * Optional authentication middleware
 * Attaches user data if token is present, but doesn't require authentication
 */
export const optionalMCPAuth = async (
  req: MCPAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractBearerToken(req.headers.authorization)

    if (token) {
      const userResult = await authService.getUserByToken(token)
      
      if (userResult.success && userResult.data) {
        const sessionResult = await authService.getSession()
        
        req.user = {
          userId: userResult.data.id,
          email: userResult.data.email,
          role: userResult.data.role,
          name: userResult.data.name,
          supabaseSession: sessionResult.success ? sessionResult.data : null
        }

        req.supabaseSession = sessionResult.success ? sessionResult.data : null
      }
    }

    next()
  } catch (error) {
    // For optional auth, we just log the error and continue
    console.warn('Optional MCP Auth middleware warning:', error)
    next()
  }
}

/**
 * Session validation middleware
 * Checks if the Supabase session is still valid and refreshes if needed
 */
export const validateMCPSession = async (
  req: MCPAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.supabaseSession) {
      return next()
    }

    // Check if session needs refresh (expires in less than 5 minutes)
    const expiresAt = new Date(req.supabaseSession.expires_at * 1000)
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    if (expiresAt < fiveMinutesFromNow) {
      console.log('Session expires soon, attempting refresh...')
      
      const refreshResult = await authService.refreshSession(
        req.supabaseSession.refresh_token
      )

      if (refreshResult.success && refreshResult.data) {
        // Update session data
        req.supabaseSession = refreshResult.data.session
        
        // Optionally add refreshed session to response headers
        res.setHeader('X-Session-Refreshed', 'true')
        res.setHeader('X-New-Access-Token', refreshResult.data.session.access_token)
      } else {
        console.warn('Failed to refresh session:', refreshResult.error)
        // Continue with expired session - let client handle token refresh
      }
    }

    next()
  } catch (error) {
    console.error('Session validation error:', error)
    // Don't fail the request on session validation errors
    next()
  }
}

// Rate limiting configurations are now imported from config/security.ts
// Export them for backward compatibility
export { 
  authRateLimit, 
  passwordResetRateLimit, 
  apiRateLimit,
  strictRateLimit,
  uploadRateLimit
}

/**
 * Middleware to log authentication events for audit purposes
 */
export const logAuthEvent = (eventType: string) => {
  return (req: MCPAuthenticatedRequest, res: Response, next: NextFunction) => {
    // Store original res.json to intercept response
    const originalJson = res.json
    
    res.json = function(data: any) {
      // Log successful auth events
      if (res.statusCode < 400 && req.user) {
        console.log(`Auth Event [${eventType}]:`, {
          userId: req.user.userId,
          email: req.user.email,
          role: req.user.role,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        })
      }

      // Call original json method
      return originalJson.call(this, data)
    }

    next()
  }
}

/**
 * Middleware to ensure user owns resource or is admin
 */
export const requireResourceOwnership = (userIdField: string = 'userId') => {
  return (req: MCPAuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      })
    }

    // Admins can access any resource
    if (req.user.role === 'ADMIN') {
      return next()
    }

    // Check ownership based on URL params, body, or query
    const resourceUserId = req.params[userIdField] || 
                          req.body[userIdField] || 
                          req.query[userIdField]

    if (resourceUserId && resourceUserId !== req.user.userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      })
    }

    next()
  }
}

/**
 * Input sanitization middleware
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize email fields
    if (req.body?.email) {
      req.body.email = sanitizeInput.email(req.body.email)
    }
    
    // Sanitize text inputs
    const textFields = ['name', 'bio', 'company', 'location', 'website']
    textFields.forEach(field => {
      if (req.body?.[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeInput.userInput(req.body[field])
      }
    })
    
    // Sanitize filename if uploading
    if (req.body?.filename) {
      req.body.filename = sanitizeInput.filename(req.body.filename)
    }
    
    next()
  } catch (error) {
    console.error('Input sanitization error:', error)
    return res.status(400).json({
      error: 'Invalid input format'
    })
  }
}

/**
 * File validation middleware for uploads
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const file = (req as any).file
  
  if (!file) {
    return next() // No file to validate
  }
  
  try {
    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 5MB'
      })
    }
    
    // Check file type for images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only image files are allowed'
      })
    }
    
    next()
  } catch (error) {
    console.error('File validation error:', error)
    return res.status(400).json({
      error: 'File validation failed'
    })
  }
}